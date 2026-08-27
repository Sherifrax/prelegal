export type MndaTermType = "expires" | "until-terminated";
export type ConfidentialityTermType = "years" | "perpetuity";

export interface PartyInfo {
  company: string;
  printName: string;
  title: string;
  noticeAddress: string;
}

export interface NdaFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: MndaTermType;
  mndaTermYears: number;
  confidentialityTermType: ConfidentialityTermType;
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

export const emptyParty: PartyInfo = {
  company: "",
  printName: "",
  title: "",
  noticeAddress: "",
};

export const defaultNdaFormData: NdaFormData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: new Date().toISOString().slice(0, 10),
  mndaTermType: "expires",
  mndaTermYears: 1,
  confidentialityTermType: "years",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: { ...emptyParty },
  party2: { ...emptyParty },
};
