export interface PartyInfo {
  company: string;
  printName: string;
  title: string;
  noticeAddress: string;
}

export interface DocumentData {
  docType: string | null;
  fields: Record<string, string>;
  parties: Record<string, PartyInfo>;
}

export const emptyParty: PartyInfo = {
  company: "",
  printName: "",
  title: "",
  noticeAddress: "",
};

export const defaultDocumentData: DocumentData = {
  docType: null,
  fields: {},
  parties: {},
};
