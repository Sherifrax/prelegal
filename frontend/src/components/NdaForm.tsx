import { NdaFormData, PartyInfo } from "@/lib/types";

interface NdaFormProps {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: PartyInfo;
  onChange: (party: PartyInfo) => void;
}) {
  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Company</Label>
          <input
            className={inputClass}
            value={party.company}
            onChange={(e) => onChange({ ...party, company: e.target.value })}
          />
        </div>
        <div>
          <Label>Signatory name</Label>
          <input
            className={inputClass}
            value={party.printName}
            onChange={(e) =>
              onChange({ ...party, printName: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Title</Label>
          <input
            className={inputClass}
            value={party.title}
            onChange={(e) => onChange({ ...party, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Notice address</Label>
          <input
            className={inputClass}
            value={party.noticeAddress}
            onChange={(e) =>
              onChange({ ...party, noticeAddress: e.target.value })
            }
          />
        </div>
      </div>
    </fieldset>
  );
}

export default function NdaForm({ data, onChange }: NdaFormProps) {
  const set = <K extends keyof NdaFormData>(key: K, value: NdaFormData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label>Purpose</Label>
        <p className="text-xs text-slate-500">
          How Confidential Information may be used
        </p>
        <textarea
          className={inputClass}
          rows={2}
          value={data.purpose}
          onChange={(e) => set("purpose", e.target.value)}
        />
      </div>

      <div>
        <Label>Effective date</Label>
        <input
          type="date"
          className={inputClass}
          value={data.effectiveDate}
          onChange={(e) => set("effectiveDate", e.target.value)}
        />
      </div>

      <div>
        <Label>MNDA term</Label>
        <p className="text-xs text-slate-500">The length of this MNDA</p>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mndaTermType"
              checked={data.mndaTermType === "expires"}
              onChange={() => set("mndaTermType", "expires")}
            />
            Expires
            <input
              type="number"
              min={1}
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={data.mndaTermYears}
              onChange={(e) =>
                set("mndaTermYears", Number(e.target.value) || 1)
              }
              disabled={data.mndaTermType !== "expires"}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mndaTermType"
              checked={data.mndaTermType === "until-terminated"}
              onChange={() => set("mndaTermType", "until-terminated")}
            />
            Continues until terminated
          </label>
        </div>
      </div>

      <div>
        <Label>Term of confidentiality</Label>
        <p className="text-xs text-slate-500">
          How long Confidential Information is protected
        </p>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="confidentialityTermType"
              checked={data.confidentialityTermType === "years"}
              onChange={() => set("confidentialityTermType", "years")}
            />
            <input
              type="number"
              min={1}
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={data.confidentialityTermYears}
              onChange={(e) =>
                set("confidentialityTermYears", Number(e.target.value) || 1)
              }
              disabled={data.confidentialityTermType !== "years"}
            />
            year(s) from Effective Date (trade secrets survive longer)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="confidentialityTermType"
              checked={data.confidentialityTermType === "perpetuity"}
              onChange={() => set("confidentialityTermType", "perpetuity")}
            />
            In perpetuity
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Governing law (state)</Label>
          <input
            className={inputClass}
            placeholder="e.g. Delaware"
            value={data.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
          />
        </div>
        <div>
          <Label>Jurisdiction</Label>
          <input
            className={inputClass}
            placeholder="e.g. New Castle, DE"
            value={data.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>MNDA modifications (optional)</Label>
        <textarea
          className={inputClass}
          rows={2}
          value={data.modifications}
          onChange={(e) => set("modifications", e.target.value)}
        />
      </div>

      <PartyFields
        title="Party 1"
        party={data.party1}
        onChange={(party1) => set("party1", party1)}
      />
      <PartyFields
        title="Party 2"
        party={data.party2}
        onChange={(party2) => set("party2", party2)}
      />
    </form>
  );
}
