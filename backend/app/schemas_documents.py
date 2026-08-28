from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.document_types import DocumentTypeSpec


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PartyInfo(CamelModel):
    company: str = ""
    print_name: str = ""
    title: str = ""
    notice_address: str = ""


class DocumentData(CamelModel):
    doc_type: str | None = None
    fields: dict[str, str] = Field(default_factory=dict)
    parties: dict[str, PartyInfo] = Field(default_factory=dict)


def empty_document_data(spec: DocumentTypeSpec) -> DocumentData:
    return DocumentData(
        doc_type=spec.id,
        fields={},
        parties={party.key: PartyInfo() for party in spec.parties},
    )


def _party_required_subfields(full: bool) -> tuple[str, ...]:
    return ("company", "print_name", "title", "notice_address") if full else ("company",)


def is_complete(data: DocumentData, spec: DocumentTypeSpec) -> bool:
    for field in spec.fields:
        if not field.required:
            continue
        if field.required_if:
            other_key, other_value = field.required_if
            if data.fields.get(other_key) != other_value:
                continue
        value = data.fields.get(field.key, "")
        if field.field_type == "int":
            try:
                if int(value) < 1:
                    return False
            except (TypeError, ValueError):
                return False
        elif not value.strip():
            return False

    for party_spec in spec.parties:
        party = data.parties.get(party_spec.key)
        if party is None:
            return False
        for subfield in _party_required_subfields(party_spec.full):
            if not getattr(party, subfield).strip():
                return False

    return True
