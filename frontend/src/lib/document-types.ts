export type FieldType = "text" | "textarea" | "date" | "int" | "select";

// Field/party `key`s below must match the backend's snake_case FieldSpec.key
// and PartySpec.key exactly (backend/app/document_types.py) — these are raw
// dict keys inside DocumentData.fields, which Pydantic's camelCase alias
// generator does not touch (it only aliases declared model attribute names).
export interface FieldMeta {
  key: string;
  label: string;
  fieldType: FieldType;
  options?: readonly string[];
  hint?: string;
}

export interface PartyMeta {
  key: "party1" | "party2";
  label: string;
  full: boolean;
}

export interface DocumentTypeMeta {
  id: string;
  name: string;
  description: string;
  fields: readonly FieldMeta[];
  parties: readonly [PartyMeta, PartyMeta];
}

export interface StandardTermSection {
  title: string;
  body: string;
}

const MUTUAL_NDA: DocumentTypeMeta = {
  id: "mutual-nda",
  name: "Mutual Non-Disclosure Agreement",
  description:
    "Common Paper's standard mutual NDA terms, allowing two parties to exchange confidential information under reciprocal confidentiality obligations, exceptions, and remedies.",
  fields: [
    { key: "purpose", label: "Purpose", fieldType: "text", hint: "How Confidential Information may be used" },
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "mnda_term_type", label: "MNDA Term", fieldType: "select", options: ["expires", "until-terminated"], hint: "The length of this MNDA" },
    { key: "confidentiality_term_type", label: "Term of Confidentiality", fieldType: "select", options: ["years", "perpetuity"], hint: "How long Confidential Information is protected" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "jurisdiction", label: "Jurisdiction", fieldType: "text" },
    { key: "modifications", label: "MNDA Modifications", fieldType: "textarea", hint: "List any modifications to the MNDA" },
  ],
  parties: [
    { key: "party1", label: "Party 1", full: true },
    { key: "party2", label: "Party 2", full: true },
  ],
};

const CSA: DocumentTypeMeta = {
  id: "csa",
  name: "Cloud Service Agreement",
  description:
    "Common Paper's standard SaaS/cloud service agreement covering access and use, support, fees, term and termination, warranties, limitation of liability, indemnification, and confidentiality for a cloud service provider and customer.",
  fields: [
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "subscription_period", label: "Subscription Period", fieldType: "text" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "chosen_courts", label: "Chosen Courts", fieldType: "text" },
    { key: "general_cap_amount", label: "General Cap Amount", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: true },
    { key: "party2", label: "Customer", full: true },
  ],
};

const PILOT_AGREEMENT: DocumentTypeMeta = {
  id: "pilot-agreement",
  name: "Pilot Agreement",
  description:
    "Common Paper's standard short-term pilot/trial agreement letting a prospective customer evaluate a product before committing to a full commercial agreement such as a CSA or Software License Agreement.",
  fields: [
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "pilot_period", label: "Pilot Period", fieldType: "text" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "chosen_courts", label: "Chosen Courts", fieldType: "text" },
    { key: "general_cap_amount", label: "General Cap Amount", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: true },
    { key: "party2", label: "Customer", full: true },
  ],
};

const DESIGN_PARTNER: DocumentTypeMeta = {
  id: "design-partner",
  name: "Design Partner Agreement",
  description:
    "Common Paper's standard agreement for giving a partner early access to a product in exchange for structured feedback as part of a product development program.",
  fields: [
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "term", label: "Term", fieldType: "text" },
    { key: "fees", label: "Fees", fieldType: "text" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "chosen_courts", label: "Chosen Courts", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: true },
    { key: "party2", label: "Partner", full: true },
  ],
};

const SLA: DocumentTypeMeta = {
  id: "sla",
  name: "Service Level Agreement",
  description:
    "Common Paper's standard SLA defining uptime and support response time targets, service credits, and remedies, designed to be used alongside the Cloud Service Agreement.",
  fields: [
    { key: "target_uptime", label: "Target Uptime", fieldType: "text" },
    { key: "target_response_time", label: "Target Response Time", fieldType: "text" },
    { key: "support_channel", label: "Support Channel", fieldType: "text" },
    { key: "uptime_credit", label: "Uptime Credit", fieldType: "text" },
    { key: "response_time_credit", label: "Response Time Credit", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: false },
    { key: "party2", label: "Customer", full: false },
  ],
};

const PSA: DocumentTypeMeta = {
  id: "psa",
  name: "Professional Services Agreement",
  description:
    "Common Paper's standard agreement for delivering professional services under statements of work (SOWs), covering deliverables, IP assignment, fees, warranties, and indemnification.",
  fields: [
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "chosen_courts", label: "Chosen Courts", fieldType: "text" },
    { key: "payment_period", label: "Payment Period", fieldType: "text" },
    { key: "additional_warranties", label: "Additional Warranties", fieldType: "textarea" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: true },
    { key: "party2", label: "Customer", full: true },
  ],
};

const DPA: DocumentTypeMeta = {
  id: "dpa",
  name: "Data Processing Agreement",
  description:
    "Common Paper's standard GDPR/UK GDPR-ready data processing agreement covering processor and subprocessor obligations, international data transfers (EEA SCCs / UK Addendum), security incident response, and audit rights.",
  fields: [
    { key: "controller_or_processor", label: "Controller or Processor", fieldType: "select", options: ["controller", "processor"] },
    { key: "categories_of_personal_data", label: "Categories of Personal Data", fieldType: "textarea" },
    { key: "categories_of_data_subjects", label: "Categories of Data Subjects", fieldType: "textarea" },
    { key: "approved_subprocessors", label: "Approved Subprocessors", fieldType: "textarea" },
    { key: "governing_member_state", label: "Governing Member State", fieldType: "text" },
    { key: "provider_security_contact", label: "Provider Security Contact", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: false },
    { key: "party2", label: "Customer", full: false },
  ],
};

const SOFTWARE_LICENSE: DocumentTypeMeta = {
  id: "software-license",
  name: "Software License Agreement",
  description:
    "Common Paper's standard on-premises/installed software license agreement covering license grants, restrictions, updates, open source disclosure, warranties, liability, and indemnification.",
  fields: [
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "permitted_uses", label: "Permitted Uses", fieldType: "text" },
    { key: "subscription_period", label: "Subscription Period", fieldType: "text" },
    { key: "general_cap_amount", label: "General Cap Amount", fieldType: "text" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "chosen_courts", label: "Chosen Courts", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: true },
    { key: "party2", label: "Customer", full: true },
  ],
};

const PARTNERSHIP: DocumentTypeMeta = {
  id: "partnership",
  name: "Partnership Agreement",
  description:
    "Common Paper's standard agreement for a business partnership involving mutual obligations, trademark licensing, and optional fee sharing between two companies.",
  fields: [
    { key: "effective_date", label: "Effective Date", fieldType: "date" },
    { key: "end_date", label: "End Date", fieldType: "date" },
    { key: "obligations", label: "Obligations", fieldType: "textarea" },
    { key: "territory", label: "Territory", fieldType: "text" },
    { key: "governing_law", label: "Governing Law", fieldType: "text" },
    { key: "chosen_courts", label: "Chosen Courts", fieldType: "text" },
  ],
  parties: [
    { key: "party1", label: "Company", full: true },
    { key: "party2", label: "Partner", full: true },
  ],
};

const BAA: DocumentTypeMeta = {
  id: "baa",
  name: "Business Associate Agreement",
  description:
    "Common Paper's standard HIPAA Business Associate Agreement governing the use, protection, and breach notification of Protected Health Information (PHI) between a covered entity and a business associate.",
  fields: [
    { key: "baa_effective_date", label: "BAA Effective Date", fieldType: "date" },
    { key: "breach_notification_period", label: "Breach Notification Period", fieldType: "text" },
    { key: "limitations", label: "Limitations", fieldType: "textarea" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: true },
    { key: "party2", label: "Company", full: true },
  ],
};

const AI_ADDENDUM: DocumentTypeMeta = {
  id: "ai-addendum",
  name: "AI Addendum",
  description:
    "Common Paper's standard addendum governing the use of AI/ML features within a product, covering input/output ownership, model training permissions, and AI-specific disclaimers.",
  fields: [
    { key: "training_data", label: "Training Data", fieldType: "textarea" },
    { key: "training_purposes", label: "Training Purposes", fieldType: "textarea" },
    { key: "training_restrictions", label: "Training Restrictions", fieldType: "textarea" },
    { key: "improvement_restrictions", label: "Improvement Restrictions", fieldType: "textarea" },
  ],
  parties: [
    { key: "party1", label: "Provider", full: false },
    { key: "party2", label: "Customer", full: false },
  ],
};

export const DOCUMENT_TYPES: Record<string, DocumentTypeMeta> = {
  [MUTUAL_NDA.id]: MUTUAL_NDA,
  [CSA.id]: CSA,
  [PILOT_AGREEMENT.id]: PILOT_AGREEMENT,
  [DESIGN_PARTNER.id]: DESIGN_PARTNER,
  [SLA.id]: SLA,
  [PSA.id]: PSA,
  [DPA.id]: DPA,
  [SOFTWARE_LICENSE.id]: SOFTWARE_LICENSE,
  [PARTNERSHIP.id]: PARTNERSHIP,
  [BAA.id]: BAA,
  [AI_ADDENDUM.id]: AI_ADDENDUM,
};
