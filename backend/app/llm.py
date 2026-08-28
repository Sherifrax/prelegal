from datetime import date
from typing import Literal

from litellm import completion
from pydantic import BaseModel

from app.config import LLM_EXTRA_BODY, LLM_MODEL
from app.schemas_nda import NdaFormData, PartyInfo, is_complete

SYSTEM_PROMPT = """You are a friendly legal assistant helping a user fill out a \
Common Paper Mutual Non-Disclosure Agreement (Mutual NDA) cover page through \
conversation, instead of a form.

Today's date is {today}.

Guide the user conversationally, asking about a couple of missing details at a \
time rather than listing every field at once. Confirm what you understood when \
useful. Once every required field below is known, tell the user their MNDA is \
ready to download.

Required fields:
- purpose: how the parties may use each other's confidential information
- effective_date: the date the MNDA starts, as an ISO date (YYYY-MM-DD). Resolve \
relative dates like "today" or "next Monday" against today's date.
- mnda_term_type: "expires" if the MNDA has a fixed length, or "until-terminated" \
if it lasts until either party ends it
- mnda_term_years: if mnda_term_type is "expires", how many years from the \
effective date
- confidentiality_term_type: "years" if confidentiality protection has a fixed \
length, or "perpetuity" if it lasts forever
- confidentiality_term_years: if confidentiality_term_type is "years", how many \
years from the effective date
- governing_law: the US state (or other jurisdiction) whose law governs the MNDA
- jurisdiction: the city/county and state where disputes will be handled
- modifications: any custom changes to the standard MNDA terms (optional, leave \
blank unless the user mentions something)
- party1_company, party1_print_name, party1_title, party1_notice_address: the \
first party's company name, the name and title of the person signing, and the \
company's notice address
- party2_company, party2_print_name, party2_title, party2_notice_address: the \
same four details for the second party (often the user's own counterparty)

In every reply, return your best understanding of ALL fields established so far \
across the WHOLE conversation, not just the latest message — leave a field null \
only if it truly has not been discussed yet. Never invent details the user hasn't \
given you."""


GREETING = (
    "Hi! I'll help you put together a Mutual NDA. Let's start with the "
    "basics — what are the two companies involved, and what's the purpose "
    "of sharing confidential information between them?"
)


class ExtractedFields(BaseModel):
    reply: str

    purpose: str | None = None
    effective_date: str | None = None
    mnda_term_type: Literal["expires", "until-terminated"] | None = None
    mnda_term_years: int | None = None
    confidentiality_term_type: Literal["years", "perpetuity"] | None = None
    confidentiality_term_years: int | None = None
    governing_law: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None

    party1_company: str | None = None
    party1_print_name: str | None = None
    party1_title: str | None = None
    party1_notice_address: str | None = None

    party2_company: str | None = None
    party2_print_name: str | None = None
    party2_title: str | None = None
    party2_notice_address: str | None = None


def _merge_party(party: PartyInfo, prefix: str, extracted: ExtractedFields) -> PartyInfo:
    return PartyInfo(
        company=getattr(extracted, f"{prefix}_company") or party.company,
        print_name=getattr(extracted, f"{prefix}_print_name") or party.print_name,
        title=getattr(extracted, f"{prefix}_title") or party.title,
        notice_address=getattr(extracted, f"{prefix}_notice_address")
        or party.notice_address,
    )


def _merge(current: NdaFormData, extracted: ExtractedFields) -> NdaFormData:
    return NdaFormData(
        purpose=extracted.purpose or current.purpose,
        effective_date=extracted.effective_date or current.effective_date,
        mnda_term_type=extracted.mnda_term_type or current.mnda_term_type,
        mnda_term_years=extracted.mnda_term_years or current.mnda_term_years,
        confidentiality_term_type=extracted.confidentiality_term_type
        or current.confidentiality_term_type,
        confidentiality_term_years=extracted.confidentiality_term_years
        or current.confidentiality_term_years,
        governing_law=extracted.governing_law or current.governing_law,
        jurisdiction=extracted.jurisdiction or current.jurisdiction,
        modifications=extracted.modifications or current.modifications,
        party1=_merge_party(current.party1, "party1", extracted),
        party2=_merge_party(current.party2, "party2", extracted),
    )


def run_chat_turn(
    messages: list[dict[str, str]], current_data: NdaFormData
) -> tuple[str, NdaFormData, bool]:
    system_message = {
        "role": "system",
        "content": SYSTEM_PROMPT.format(today=date.today().isoformat()),
    }
    response = completion(
        model=LLM_MODEL,
        messages=[system_message, *messages],
        response_format=ExtractedFields,
        reasoning_effort="low",
        extra_body=LLM_EXTRA_BODY,
    )
    extracted = ExtractedFields.model_validate_json(
        response.choices[0].message.content
    )
    merged = _merge(current_data, extracted)
    return extracted.reply, merged, is_complete(merged)
