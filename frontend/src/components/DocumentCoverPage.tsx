import { DocumentData, PartyInfo, emptyParty } from "@/lib/types";
import { DocumentTypeMeta, FieldMeta } from "@/lib/document-types";
import { formatDate } from "@/lib/derived";

function Field({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">{label}</h3>
      {hint && <p className="text-sm text-slate-500 italic">{hint}</p>}
      <p className="mt-1 whitespace-pre-wrap">{value}</p>
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

function titleCase(value: string): string {
  return value.replace(/(?:^|-)\w/g, (c) => c.toUpperCase()).replace(/-/g, " ");
}

function SignatureTable({
  data,
  meta,
}: {
  data: DocumentData;
  meta: DocumentTypeMeta;
}) {
  const [party1Meta, party2Meta] = meta.parties;
  const party1: PartyInfo = data.parties.party1 ?? emptyParty;
  const party2: PartyInfo = data.parties.party2 ?? emptyParty;
  const rows: { label: string; render: (p: PartyInfo) => string }[] = [
    { label: "Signature", render: () => "" },
    ...(party1Meta.full || party2Meta.full
      ? [{ label: "Print Name", render: (p: PartyInfo) => p.printName }]
      : []),
    ...(party1Meta.full || party2Meta.full
      ? [{ label: "Title", render: (p: PartyInfo) => p.title }]
      : []),
    { label: "Company", render: (p: PartyInfo) => p.company },
    ...(party1Meta.full || party2Meta.full
      ? [{ label: "Notice Address", render: (p: PartyInfo) => p.noticeAddress }]
      : []),
    { label: "Date", render: () => "" },
  ];

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 text-left"></th>
            <th className="border p-2 text-left">{party1Meta.label}</th>
            <th className="border p-2 text-left">{party2Meta.label}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="border p-2 font-semibold">{row.label}</td>
              <td className="border p-2 whitespace-pre-wrap">
                {row.render(party1) || " "}
              </td>
              <td className="border p-2 whitespace-pre-wrap">
                {row.render(party2) || " "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldValue({ field, data }: { field: FieldMeta; data: DocumentData }) {
  const raw = data.fields[field.key] ?? "";

  if (field.fieldType === "select" && field.options) {
    return (
      <div className="mt-4">
        <h3 className="font-semibold">{field.label}</h3>
        {field.hint && <p className="text-sm text-slate-500 italic">{field.hint}</p>}
        <div className="mt-1 space-y-1">
          {field.options.map((option) => (
            <Checkbox key={option} checked={raw === option} label={titleCase(option)} />
          ))}
        </div>
      </div>
    );
  }

  if (field.fieldType === "date") {
    return <Field label={field.label} hint={field.hint} value={formatDate(raw)} />;
  }

  return (
    <Field
      label={field.label}
      hint={field.hint}
      value={raw || `[${field.label} not yet specified]`}
    />
  );
}

// The Mutual NDA's term-length fields compose into full sentences alongside a
// checkbox (e.g. "Expires 2 year(s) from Effective Date."), which doesn't fit
// the generic per-field layout below — every other document type's fields
// (including DPA's plain Controller/Processor select) render generically.
function MutualNdaCoverPage({ data }: { data: DocumentData }) {
  const f = data.fields;
  return (
    <>
      <Field
        label="Purpose"
        hint="How Confidential Information may be used"
        value={f.purpose || "[Purpose not yet specified]"}
      />
      <Field label="Effective Date" value={formatDate(f.effective_date)} />

      <div className="mt-4">
        <h3 className="font-semibold">MNDA Term</h3>
        <p className="text-sm text-slate-500 italic">The length of this MNDA</p>
        <div className="mt-1 space-y-1">
          <Checkbox
            checked={f.mnda_term_type === "expires"}
            label={`Expires ${Number(f.mnda_term_years) || 1} year(s) from Effective Date.`}
          />
          <Checkbox
            checked={f.mnda_term_type === "until-terminated"}
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
            checked={f.confidentiality_term_type === "years"}
            label={`${Number(f.confidentiality_term_years) || 1} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`}
          />
          <Checkbox checked={f.confidentiality_term_type === "perpetuity"} label="In perpetuity." />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Governing Law &amp; Jurisdiction</h3>
        <p className="mt-1">Governing Law: {f.governing_law || "[Fill in state]"}</p>
        <p>Jurisdiction: {f.jurisdiction || "[Fill in city or county and state]"}</p>
      </div>

      {f.modifications && (
        <Field
          label="MNDA Modifications"
          hint="List any modifications to the MNDA"
          value={f.modifications}
        />
      )}
    </>
  );
}

export default function DocumentCoverPage({
  data,
  meta,
}: {
  data: DocumentData;
  meta: DocumentTypeMeta;
}) {
  const effectiveDateField = meta.fields.find((f) => f.fieldType === "date");

  return (
    <section>
      <h1 className="text-xl font-bold">{meta.name}</h1>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Using this {meta.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        This {meta.name} consists of: (1) this Cover Page and (2) the Common
        Paper {meta.name} Standard Terms identical to those posted at{" "}
        <a href="https://commonpaper.com/" className="underline">
          commonpaper.com
        </a>
        . Any modifications should be made on this Cover Page, which will
        control over conflicts with the Standard Terms.
      </p>

      {meta.id === "mutual-nda" ? (
        <MutualNdaCoverPage data={data} />
      ) : (
        meta.fields.map((field) => <FieldValue key={field.key} field={field} data={data} />)
      )}

      {effectiveDateField && (
        <p className="mt-6 text-sm">
          By signing this Cover Page, each party agrees to enter into this
          agreement as of the Effective Date of{" "}
          {formatDate(data.fields[effectiveDateField.key])}.
        </p>
      )}

      <SignatureTable data={data} meta={meta} />

      <p className="mt-6 text-sm text-slate-500">
        Common Paper {meta.name} — free to use under{" "}
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
