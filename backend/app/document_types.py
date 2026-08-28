from typing import Literal

from pydantic import BaseModel

FieldType = Literal["text", "textarea", "date", "int", "select"]


class FieldSpec(BaseModel):
    key: str
    label: str
    description: str
    field_type: FieldType = "text"
    options: tuple[str, ...] | None = None
    required: bool = True
    # This field is only required when `fields[required_if[0]] == required_if[1]`.
    required_if: tuple[str, str] | None = None
    hint: str | None = None


class PartySpec(BaseModel):
    key: Literal["party1", "party2"]
    label: str
    # Full parties require company/printName/title/noticeAddress; light parties
    # (used by addenda that ride on an underlying agreement) require company only.
    full: bool = True


class DocumentTypeSpec(BaseModel):
    id: str
    name: str
    description: str
    fields: tuple[FieldSpec, ...]
    parties: tuple[PartySpec, ...]


_MUTUAL_NDA = DocumentTypeSpec(
    id="mutual-nda",
    name="Mutual Non-Disclosure Agreement",
    description=(
        "Common Paper's standard mutual NDA terms, allowing two parties to exchange "
        "confidential information under reciprocal confidentiality obligations, "
        "exceptions, and remedies."
    ),
    fields=(
        FieldSpec(
            key="purpose",
            label="Purpose",
            description="How the parties may use each other's confidential information",
        ),
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the MNDA starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="mnda_term_type",
            label="MNDA Term Type",
            description=(
                '"expires" if the MNDA has a fixed length, or "until-terminated" if '
                "it lasts until either party ends it"
            ),
            field_type="select",
            options=("expires", "until-terminated"),
        ),
        FieldSpec(
            key="mnda_term_years",
            label="MNDA Term Years",
            description="If the MNDA term expires, how many years from the effective date",
            field_type="int",
            required_if=("mnda_term_type", "expires"),
        ),
        FieldSpec(
            key="confidentiality_term_type",
            label="Term of Confidentiality Type",
            description=(
                '"years" if confidentiality protection has a fixed length, or '
                '"perpetuity" if it lasts forever'
            ),
            field_type="select",
            options=("years", "perpetuity"),
        ),
        FieldSpec(
            key="confidentiality_term_years",
            label="Term of Confidentiality Years",
            description="If confidentiality lasts a fixed number of years, how many",
            field_type="int",
            required_if=("confidentiality_term_type", "years"),
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The US state (or other jurisdiction) whose law governs the MNDA",
        ),
        FieldSpec(
            key="jurisdiction",
            label="Jurisdiction",
            description="The city/county and state where disputes will be handled",
        ),
        FieldSpec(
            key="modifications",
            label="MNDA Modifications",
            description="Any custom changes to the standard MNDA terms",
            field_type="textarea",
            required=False,
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Party 1"),
        PartySpec(key="party2", label="Party 2"),
    ),
)

_CSA = DocumentTypeSpec(
    id="csa",
    name="Cloud Service Agreement",
    description=(
        "Common Paper's standard SaaS/cloud service agreement covering access and "
        "use, support, fees, term and termination, warranties, limitation of "
        "liability, indemnification, and confidentiality for a cloud service "
        "provider and customer."
    ),
    fields=(
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the agreement starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="subscription_period",
            label="Subscription Period",
            description="The length of the subscription term, e.g. '12 months'",
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The state/jurisdiction whose law governs the agreement",
        ),
        FieldSpec(
            key="chosen_courts",
            label="Chosen Courts",
            description="The city/state where disputes will be handled",
        ),
        FieldSpec(
            key="general_cap_amount",
            label="General Cap Amount",
            description=(
                "The general liability cap, e.g. a dollar amount or a multiple of "
                "fees paid"
            ),
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider"),
        PartySpec(key="party2", label="Customer"),
    ),
)

_PILOT_AGREEMENT = DocumentTypeSpec(
    id="pilot-agreement",
    name="Pilot Agreement",
    description=(
        "Common Paper's standard short-term pilot/trial agreement letting a "
        "prospective customer evaluate a product before committing to a full "
        "commercial agreement such as a CSA or Software License Agreement."
    ),
    fields=(
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the pilot starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="pilot_period",
            label="Pilot Period",
            description="How long the pilot/evaluation period lasts, e.g. '60 days'",
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The state/jurisdiction whose law governs the agreement",
        ),
        FieldSpec(
            key="chosen_courts",
            label="Chosen Courts",
            description="The city/state where disputes will be handled",
        ),
        FieldSpec(
            key="general_cap_amount",
            label="General Cap Amount",
            description="The general liability cap, e.g. a dollar amount",
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider"),
        PartySpec(key="party2", label="Customer"),
    ),
)

_DESIGN_PARTNER = DocumentTypeSpec(
    id="design-partner",
    name="Design Partner Agreement",
    description=(
        "Common Paper's standard agreement for giving a partner early access to a "
        "product in exchange for structured feedback as part of a product "
        "development program."
    ),
    fields=(
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the program starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="term",
            label="Term",
            description="How long the design partner program lasts",
        ),
        FieldSpec(
            key="fees",
            label="Fees",
            description="Any fees paid to the partner, if applicable",
            required=False,
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The state/jurisdiction whose law governs the agreement",
        ),
        FieldSpec(
            key="chosen_courts",
            label="Chosen Courts",
            description="The city/state where disputes will be handled",
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider"),
        PartySpec(key="party2", label="Partner"),
    ),
)

_SLA = DocumentTypeSpec(
    id="sla",
    name="Service Level Agreement",
    description=(
        "Common Paper's standard SLA defining uptime and support response time "
        "targets, service credits, and remedies, designed to be used alongside the "
        "Cloud Service Agreement."
    ),
    fields=(
        FieldSpec(
            key="target_uptime",
            label="Target Uptime",
            description="The uptime commitment, e.g. '99.9%'",
        ),
        FieldSpec(
            key="target_response_time",
            label="Target Response Time",
            description="The support response time commitment, e.g. '4 business hours'",
        ),
        FieldSpec(
            key="support_channel",
            label="Support Channel",
            description="How customers reach support, e.g. an email address or portal",
        ),
        FieldSpec(
            key="uptime_credit",
            label="Uptime Credit",
            description="The service credit owed if the uptime target is missed",
        ),
        FieldSpec(
            key="response_time_credit",
            label="Response Time Credit",
            description="The service credit owed if the response time target is missed",
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider", full=False),
        PartySpec(key="party2", label="Customer", full=False),
    ),
)

_PSA = DocumentTypeSpec(
    id="psa",
    name="Professional Services Agreement",
    description=(
        "Common Paper's standard agreement for delivering professional services "
        "under statements of work (SOWs), covering deliverables, IP assignment, "
        "fees, warranties, and indemnification."
    ),
    fields=(
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the agreement starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The state/jurisdiction whose law governs the agreement",
        ),
        FieldSpec(
            key="chosen_courts",
            label="Chosen Courts",
            description="The city/state where disputes will be handled",
        ),
        FieldSpec(
            key="payment_period",
            label="Payment Period",
            description="How many days Customer has to pay invoices, e.g. '30 days'",
        ),
        FieldSpec(
            key="additional_warranties",
            label="Additional Warranties",
            description="Any additional warranties Provider makes, if any",
            field_type="textarea",
            required=False,
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider"),
        PartySpec(key="party2", label="Customer"),
    ),
)

_DPA = DocumentTypeSpec(
    id="dpa",
    name="Data Processing Agreement",
    description=(
        "Common Paper's standard GDPR/UK GDPR-ready data processing agreement "
        "covering processor and subprocessor obligations, international data "
        "transfers (EEA SCCs / UK Addendum), security incident response, and audit "
        "rights."
    ),
    fields=(
        FieldSpec(
            key="controller_or_processor",
            label="Controller or Processor",
            description=(
                "Whether Customer is acting as Controller or Processor of the "
                'personal data: "controller" or "processor"'
            ),
            field_type="select",
            options=("controller", "processor"),
        ),
        FieldSpec(
            key="categories_of_personal_data",
            label="Categories of Personal Data",
            description="The categories of personal data being processed",
            field_type="textarea",
        ),
        FieldSpec(
            key="categories_of_data_subjects",
            label="Categories of Data Subjects",
            description="The categories of individuals whose personal data is processed",
            field_type="textarea",
        ),
        FieldSpec(
            key="approved_subprocessors",
            label="Approved Subprocessors",
            description="Any subprocessors approved to process the personal data",
            field_type="textarea",
            required=False,
        ),
        FieldSpec(
            key="governing_member_state",
            label="Governing Member State",
            description="The EU/UK member state whose law governs",
        ),
        FieldSpec(
            key="provider_security_contact",
            label="Provider Security Contact",
            description="Contact details for Provider's security team",
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider", full=False),
        PartySpec(key="party2", label="Customer", full=False),
    ),
)

_SOFTWARE_LICENSE = DocumentTypeSpec(
    id="software-license",
    name="Software License Agreement",
    description=(
        "Common Paper's standard on-premises/installed software license agreement "
        "covering license grants, restrictions, updates, open source disclosure, "
        "warranties, liability, and indemnification."
    ),
    fields=(
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the agreement starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="permitted_uses",
            label="Permitted Uses",
            description="What Customer is permitted to use the software for",
        ),
        FieldSpec(
            key="subscription_period",
            label="Subscription Period",
            description="The length of the license/subscription term, e.g. '12 months'",
        ),
        FieldSpec(
            key="general_cap_amount",
            label="General Cap Amount",
            description="The general liability cap, e.g. a dollar amount",
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The state/jurisdiction whose law governs the agreement",
        ),
        FieldSpec(
            key="chosen_courts",
            label="Chosen Courts",
            description="The city/state where disputes will be handled",
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider"),
        PartySpec(key="party2", label="Customer"),
    ),
)

_PARTNERSHIP = DocumentTypeSpec(
    id="partnership",
    name="Partnership Agreement",
    description=(
        "Common Paper's standard agreement for a business partnership involving "
        "mutual obligations, trademark licensing, and optional fee sharing between "
        "two companies."
    ),
    fields=(
        FieldSpec(
            key="effective_date",
            label="Effective Date",
            description="The date the partnership starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="end_date",
            label="End Date",
            description="The date the partnership ends, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="obligations",
            label="Obligations",
            description="Each party's key obligations under the partnership",
            field_type="textarea",
        ),
        FieldSpec(
            key="territory",
            label="Territory",
            description="The territory covered by the trademark license",
        ),
        FieldSpec(
            key="governing_law",
            label="Governing Law",
            description="The state/jurisdiction whose law governs the agreement",
        ),
        FieldSpec(
            key="chosen_courts",
            label="Chosen Courts",
            description="The city/state where disputes will be handled",
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Company"),
        PartySpec(key="party2", label="Partner"),
    ),
)

_BAA = DocumentTypeSpec(
    id="baa",
    name="Business Associate Agreement",
    description=(
        "Common Paper's standard HIPAA Business Associate Agreement governing the "
        "use, protection, and breach notification of Protected Health Information "
        "(PHI) between a covered entity and a business associate."
    ),
    fields=(
        FieldSpec(
            key="baa_effective_date",
            label="BAA Effective Date",
            description="The date the BAA starts, as an ISO date (YYYY-MM-DD)",
            field_type="date",
        ),
        FieldSpec(
            key="breach_notification_period",
            label="Breach Notification Period",
            description=(
                "How quickly Provider must notify of a breach, e.g. '5 business days'"
            ),
        ),
        FieldSpec(
            key="limitations",
            label="Limitations",
            description="Any restrictions on offshoring, de-identification, aggregation, or subcontracting",
            field_type="textarea",
            required=False,
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider"),
        PartySpec(key="party2", label="Company"),
    ),
)

_AI_ADDENDUM = DocumentTypeSpec(
    id="ai-addendum",
    name="AI Addendum",
    description=(
        "Common Paper's standard addendum governing the use of AI/ML features "
        "within a product, covering input/output ownership, model training "
        "permissions, and AI-specific disclaimers."
    ),
    fields=(
        FieldSpec(
            key="training_data",
            label="Training Data",
            description="What data, if any, Provider may use to train its models",
            field_type="textarea",
            required=False,
        ),
        FieldSpec(
            key="training_purposes",
            label="Training Purposes",
            description="The purposes for which Provider may train on the data, if any",
            field_type="textarea",
            required=False,
        ),
        FieldSpec(
            key="training_restrictions",
            label="Training Restrictions",
            description="Any restrictions on how Provider may use the data for training",
            field_type="textarea",
            required=False,
        ),
        FieldSpec(
            key="improvement_restrictions",
            label="Improvement Restrictions",
            description="Any restrictions on using the data to improve the product generally",
            field_type="textarea",
            required=False,
        ),
    ),
    parties=(
        PartySpec(key="party1", label="Provider", full=False),
        PartySpec(key="party2", label="Customer", full=False),
    ),
)

DOCUMENT_TYPES: dict[str, DocumentTypeSpec] = {
    spec.id: spec
    for spec in (
        _MUTUAL_NDA,
        _CSA,
        _PILOT_AGREEMENT,
        _DESIGN_PARTNER,
        _SLA,
        _PSA,
        _DPA,
        _SOFTWARE_LICENSE,
        _PARTNERSHIP,
        _BAA,
        _AI_ADDENDUM,
    )
}


def catalog_prompt_listing() -> str:
    """Render the document-type catalog as a bulleted list for the LLM prompt."""
    return "\n".join(
        f"- {spec.name} (id: {spec.id}): {spec.description}"
        for spec in DOCUMENT_TYPES.values()
    )
