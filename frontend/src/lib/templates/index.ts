import { StandardTermSection } from "../document-types";
import { standardTermSections as mutualNda } from "./mutual-nda";
import { standardTermSections as csa } from "./csa";
import { standardTermSections as pilotAgreement } from "./pilot-agreement";
import { standardTermSections as designPartner } from "./design-partner";
import { standardTermSections as sla } from "./sla";
import { standardTermSections as psa } from "./psa";
import { standardTermSections as dpa } from "./dpa";
import { standardTermSections as softwareLicense } from "./software-license";
import { standardTermSections as partnership } from "./partnership";
import { standardTermSections as baa } from "./baa";
import { standardTermSections as aiAddendum } from "./ai-addendum";

export const STANDARD_TERMS_BY_DOC_TYPE: Record<string, StandardTermSection[]> = {
  "mutual-nda": mutualNda,
  csa: csa,
  "pilot-agreement": pilotAgreement,
  "design-partner": designPartner,
  sla: sla,
  psa: psa,
  dpa: dpa,
  "software-license": softwareLicense,
  partnership: partnership,
  baa: baa,
  "ai-addendum": aiAddendum,
};
