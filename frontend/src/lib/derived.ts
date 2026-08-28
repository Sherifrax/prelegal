import { DocumentData } from "./types";
import { DocumentTypeMeta } from "./document-types";

export type DefinedTermValues = Record<string, string>;

export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return "[Not yet specified]";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// These two MNDA fields compose a full sentence from a type + a conditional
// year count, rather than mapping 1:1 onto a token — every other field/type
// combination below maps its raw value straight onto its token.
function formatMndaTerm(fields: Record<string, string>): string {
  if (fields.mnda_term_type === "until-terminated") {
    return "the date this MNDA is terminated in accordance with its terms";
  }
  const years = Number(fields.mnda_term_years) || 1;
  const unit = years === 1 ? "year" : "years";
  return `${years} ${unit} from the Effective Date`;
}

function formatConfidentialityTerm(fields: Record<string, string>): string {
  if (fields.confidentiality_term_type === "perpetuity") {
    return "in perpetuity";
  }
  const years = Number(fields.confidentiality_term_years) || 1;
  const unit = years === 1 ? "year" : "years";
  return `${years} ${unit} from the Effective Date, but in the case of trade secrets until the Confidential Information is no longer considered a trade secret under applicable laws`;
}

export function buildDefinedTermValues(
  data: DocumentData,
  spec: DocumentTypeMeta
): DefinedTermValues {
  const values: DefinedTermValues = {};

  for (const field of spec.fields) {
    if (spec.id === "mutual-nda" && field.key === "mnda_term_type") {
      values[field.label] = formatMndaTerm(data.fields);
      continue;
    }
    if (spec.id === "mutual-nda" && field.key === "confidentiality_term_type") {
      values[field.label] = formatConfidentialityTerm(data.fields);
      continue;
    }

    const raw = data.fields[field.key] ?? "";
    if (field.fieldType === "date") {
      values[field.label] = formatDate(raw);
    } else {
      values[field.label] = raw || `[${field.label} not yet specified]`;
    }
  }

  return values;
}
