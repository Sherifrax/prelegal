import { NdaFormData } from "@/lib/types";
import { formatEffectiveDate } from "@/lib/derived";

function Field({
  label,
  hint,
  value,
}: {
  label: string;
  hint?: string;
  value: string;
}) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">{label}</h3>
      {hint && <p className="text-sm text-slate-500 italic">{hint}</p>}
      <p className="mt-1">{value}</p>
    </div>
  );
}

function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <p className="flex items-start gap-2">
      <span aria-hidden>{checked ? "☑" : "☐"}</span>
      <span>{label}</span>
    </p>
  );
}

export default function NdaCoverPage({ data }: { data: NdaFormData }) {
  return (
    <section>
      <h1 className="text-xl font-bold">Mutual Non-Disclosure Agreement</h1>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Using this Mutual Non-Disclosure Agreement
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        This Mutual Non-Disclosure Agreement (the “MNDA”) consists of: (1)
        this Cover Page (“Cover Page”) and (2) the Common Paper Mutual NDA
        Standard Terms Version 1.0 (“Standard Terms”) identical to those
        posted at{" "}
        <a
          href="https://commonpaper.com/standards/mutual-nda/1.0"
          className="underline"
        >
          commonpaper.com/standards/mutual-nda/1.0
        </a>
        . Any modifications of the Standard Terms should be made on this
        Cover Page, which will control over conflicts with the Standard
        Terms.
      </p>

      <Field
        label="Purpose"
        hint="How Confidential Information may be used"
        value={data.purpose || "[Purpose not yet specified]"}
      />

      <Field label="Effective Date" value={formatEffectiveDate(data.effectiveDate)} />

      <div className="mt-4">
        <h3 className="font-semibold">MNDA Term</h3>
        <p className="text-sm text-slate-500 italic">The length of this MNDA</p>
        <div className="mt-1 space-y-1">
          <Checkbox
            checked={data.mndaTermType === "expires"}
            label={`Expires ${data.mndaTermYears || 1} year(s) from Effective Date.`}
          />
          <Checkbox
            checked={data.mndaTermType === "until-terminated"}
            label="Continues until terminated in accordance with the terms of the MNDA."
          />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Term of Confidentiality</h3>
        <p className="text-sm text-slate-500 italic">
          How long Confidential Information is protected
        </p>
        <div className="mt-1 space-y-1">
          <Checkbox
            checked={data.confidentialityTermType === "years"}
            label={`${data.confidentialityTermYears || 1} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`}
          />
          <Checkbox
            checked={data.confidentialityTermType === "perpetuity"}
            label="In perpetuity."
          />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Governing Law &amp; Jurisdiction</h3>
        <p className="mt-1">
          Governing Law: {data.governingLaw || "[Fill in state]"}
        </p>
        <p>
          Jurisdiction: {data.jurisdiction || "[Fill in city or county and state]"}
        </p>
      </div>

      {data.modifications && (
        <Field
          label="MNDA Modifications"
          hint="List any modifications to the MNDA"
          value={data.modifications}
        />
      )}

      <p className="mt-6 text-sm">
        By signing this Cover Page, each party agrees to enter into this
        MNDA as of the Effective Date of{" "}
        {formatEffectiveDate(data.effectiveDate)}.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left"></th>
              <th className="border p-2 text-left">Party 1</th>
              <th className="border p-2 text-left">Party 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-semibold">Signature</td>
              <td className="border p-2">&nbsp;</td>
              <td className="border p-2">&nbsp;</td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold">Print Name</td>
              <td className="border p-2">{data.party1.printName}</td>
              <td className="border p-2">{data.party2.printName}</td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold">Title</td>
              <td className="border p-2">{data.party1.title}</td>
              <td className="border p-2">{data.party2.title}</td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold">Company</td>
              <td className="border p-2">{data.party1.company}</td>
              <td className="border p-2">{data.party2.company}</td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold">Notice Address</td>
              <td className="border p-2 whitespace-pre-wrap">
                {data.party1.noticeAddress}
              </td>
              <td className="border p-2 whitespace-pre-wrap">
                {data.party2.noticeAddress}
              </td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold">Date</td>
              <td className="border p-2">&nbsp;</td>
              <td className="border p-2">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to
        use under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          className="underline"
        >
          CC BY 4.0
        </a>
        .
      </p>
    </section>
  );
}
