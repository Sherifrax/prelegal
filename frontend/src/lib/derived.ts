import { NdaFormData } from "./types";

export function formatEffectiveDate(isoDate: string): string {
  if (!isoDate) return "[Today's date]";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMndaTerm(data: NdaFormData): string {
  if (data.mndaTermType === "until-terminated") {
    return "the date this MNDA is terminated in accordance with its terms";
  }
  const years = data.mndaTermYears || 1;
  const unit = years === 1 ? "year" : "years";
  return `${years} ${unit} from the Effective Date`;
}

export function formatConfidentialityTerm(data: NdaFormData): string {
  if (data.confidentialityTermType === "perpetuity") {
    return "in perpetuity";
  }
  const years = data.confidentialityTermYears || 1;
  const unit = years === 1 ? "year" : "years";
  return `${years} ${unit} from the Effective Date, but in the case of trade secrets until the Confidential Information is no longer considered a trade secret under applicable laws`;
}

export interface DefinedTermValues {
  Purpose: string;
  "Effective Date": string;
  "MNDA Term": string;
  "Term of Confidentiality": string;
  "Governing Law": string;
  Jurisdiction: string;
}

export function buildDefinedTermValues(data: NdaFormData): DefinedTermValues {
  return {
    Purpose: data.purpose || "[Purpose not yet specified]",
    "Effective Date": formatEffectiveDate(data.effectiveDate),
    "MNDA Term": formatMndaTerm(data),
    "Term of Confidentiality": formatConfidentialityTerm(data),
    "Governing Law": data.governingLaw || "[Governing law not yet specified]",
    Jurisdiction: data.jurisdiction || "[Jurisdiction not yet specified]",
  };
}
