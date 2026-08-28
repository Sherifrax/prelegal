from datetime import date
from typing import Literal

from litellm import completion
from pydantic import BaseModel, create_model

from app.config import LLM_EXTRA_BODY, LLM_MODEL
from app.document_types import DOCUMENT_TYPES, DocumentTypeSpec, catalog_prompt_listing
from app.schemas_documents import DocumentData, PartyInfo, empty_document_data, is_complete

GREETING = (
    "Hi! I'll help you put together a legal agreement. Tell me a bit about the "
    "deal or relationship you need documented — for example, sharing confidential "
    "information, a cloud service, a pilot/trial, or something else — and I'll "
    "figure out which document fits, or you can name one directly."
)

_PARTY_SUBFIELDS = ("company", "print_name", "title", "notice_address")


class TypeSelection(BaseModel):
    reply: str
    doc_type: Literal[tuple(DOCUMENT_TYPES.keys())] | None = None


def _detection_system_prompt(today: str) -> str:
    return (
        "You are a friendly legal assistant helping a user figure out which "
        "legal document they need, from Common Paper's catalog of standard "
        "agreement templates.\n\n"
        f"Today's date is {today}.\n\n"
        "Available documents:\n"
        f"{catalog_prompt_listing()}\n\n"
        "Ask the user what kind of deal or relationship they need documented if "
        "it's not already clear. As soon as you can confidently match their need "
        "to one of the documents above, set doc_type to its id and confirm your "
        "understanding in your reply. If the user describes something not "
        "covered by any of these documents, explain that you can't generate "
        "that, suggest the closest document from the list above as an "
        "alternative, and ask whether they'd like to proceed with it instead — "
        "do not set doc_type until they confirm."
    )


def _extraction_system_prompt(spec: DocumentTypeSpec, today: str) -> str:
    lines = [
        "You are a friendly legal assistant helping a user fill out a Common "
        f"Paper {spec.name} through conversation, instead of a form.",
        "",
        f"Today's date is {today}.",
        "",
        "Guide the user conversationally, asking about a couple of missing "
        "details at a time rather than listing every field at once. Confirm "
        "what you understood when useful. Once every required field below is "
        "known, tell the user their document is ready to download. If any "
        "required field is still missing after your reply, your reply MUST end "
        "with a specific question about one of the missing fields — never end "
        "on a purely declarative statement while fields are still missing.",
        "",
        "Required fields:",
    ]
    for field in spec.fields:
        if field.required_if:
            requirement = f'required only if {field.required_if[0]} is "{field.required_if[1]}"'
        elif field.required:
            requirement = "required"
        else:
            requirement = "optional"
        lines.append(f"- {field.key} ({requirement}): {field.description}")

    for party in spec.parties:
        subfields = _PARTY_SUBFIELDS if party.full else ("company",)
        keys = ", ".join(f"{party.key}_{sub}" for sub in subfields)
        detail = (
            "the company name, the name and title of the person signing, and "
            "the company's notice address"
            if party.full
            else "the company name"
        )
        lines.append(f"- {keys}: for the {party.label}, {detail}")

    lines.append("")
    lines.append(
        "In every reply, return your best understanding of ALL fields "
        "established so far across the WHOLE conversation, not just the latest "
        "message — leave a field null only if it truly has not been discussed "
        "yet. Never invent details the user hasn't given you."
    )
    return "\n".join(lines)


def _build_extraction_model(spec: DocumentTypeSpec) -> type[BaseModel]:
    annotations: dict[str, tuple[type, object]] = {"reply": (str, ...)}

    for field in spec.fields:
        if field.field_type == "int":
            py_type: type = int
        elif field.field_type == "select" and field.options:
            py_type = Literal[tuple(field.options)]
        else:
            py_type = str
        annotations[field.key] = (py_type | None, None)

    for party in spec.parties:
        for sub in _PARTY_SUBFIELDS:
            annotations[f"{party.key}_{sub}"] = (str | None, None)

    model_name = f"ExtractedFields_{spec.id.replace('-', '_')}"
    return create_model(model_name, **annotations)


def _merge(current: DocumentData, spec: DocumentTypeSpec, extracted: BaseModel) -> DocumentData:
    fields = dict(current.fields)
    for field in spec.fields:
        value = getattr(extracted, field.key, None)
        if value is not None and value != "":
            fields[field.key] = str(value)

    parties = dict(current.parties)
    for party_spec in spec.parties:
        party = parties.get(party_spec.key, PartyInfo())
        updated = party.model_dump()
        for sub in _PARTY_SUBFIELDS:
            value = getattr(extracted, f"{party_spec.key}_{sub}", None)
            if value:
                updated[sub] = value
        parties[party_spec.key] = PartyInfo(**updated)

    return DocumentData(doc_type=current.doc_type, fields=fields, parties=parties)


def run_type_detection(messages: list[dict[str, str]]) -> tuple[str, str | None]:
    system_message = {
        "role": "system",
        "content": _detection_system_prompt(date.today().isoformat()),
    }
    response = completion(
        model=LLM_MODEL,
        messages=[system_message, *messages],
        response_format=TypeSelection,
        reasoning_effort="low",
        extra_body=LLM_EXTRA_BODY,
    )
    selection = TypeSelection.model_validate_json(response.choices[0].message.content)
    return selection.reply, selection.doc_type


def run_field_extraction(
    messages: list[dict[str, str]], current_data: DocumentData, spec: DocumentTypeSpec
) -> tuple[str, DocumentData, bool]:
    extraction_model = _build_extraction_model(spec)
    system_message = {
        "role": "system",
        "content": _extraction_system_prompt(spec, date.today().isoformat()),
    }
    response = completion(
        model=LLM_MODEL,
        messages=[system_message, *messages],
        response_format=extraction_model,
        reasoning_effort="low",
        extra_body=LLM_EXTRA_BODY,
    )
    extracted = extraction_model.model_validate_json(response.choices[0].message.content)
    merged = _merge(current_data, spec, extracted)
    return extracted.reply, merged, is_complete(merged, spec)


def run_chat_turn(
    messages: list[dict[str, str]], current_data: DocumentData
) -> tuple[str, DocumentData, bool]:
    if current_data.doc_type is None:
        reply, doc_type = run_type_detection(messages)
        if doc_type is None:
            return reply, current_data, False
        spec = DOCUMENT_TYPES[doc_type]
        return run_field_extraction(messages, empty_document_data(spec), spec)

    spec = DOCUMENT_TYPES[current_data.doc_type]
    return run_field_extraction(messages, current_data, spec)
