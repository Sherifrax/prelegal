from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

MndaTermType = Literal["expires", "until-terminated"]
ConfidentialityTermType = Literal["years", "perpetuity"]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PartyInfo(CamelModel):
    company: str = ""
    print_name: str = ""
    title: str = ""
    notice_address: str = ""


class NdaFormData(CamelModel):
    purpose: str = ""
    effective_date: str = ""
    mnda_term_type: MndaTermType = "expires"
    mnda_term_years: int = 1
    confidentiality_term_type: ConfidentialityTermType = "years"
    confidentiality_term_years: int = 1
    governing_law: str = ""
    jurisdiction: str = ""
    modifications: str = ""
    party1: PartyInfo = PartyInfo()
    party2: PartyInfo = PartyInfo()


REQUIRED_TEXT_FIELDS = (
    "purpose",
    "effective_date",
    "governing_law",
    "jurisdiction",
)

REQUIRED_PARTY_FIELDS = ("company", "print_name", "title", "notice_address")


def is_complete(data: NdaFormData) -> bool:
    for field in REQUIRED_TEXT_FIELDS:
        if not getattr(data, field).strip():
            return False

    if data.mnda_term_type == "expires" and data.mnda_term_years < 1:
        return False

    if (
        data.confidentiality_term_type == "years"
        and data.confidentiality_term_years < 1
    ):
        return False

    for party in (data.party1, data.party2):
        for field in REQUIRED_PARTY_FIELDS:
            if not getattr(party, field).strip():
                return False

    return True
