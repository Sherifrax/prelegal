import { standardTermSections } from "@/lib/standard-terms";
import { DefinedTermValues } from "@/lib/derived";
import InlineText from "./InlineText";

export default function StandardTerms({
  definedTerms,
}: {
  definedTerms: DefinedTermValues;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Standard Terms</h2>
      <ol className="mt-4 space-y-4 list-decimal pl-5">
        {standardTermSections.map((section) => (
          <li key={section.title} className="leading-relaxed">
            <strong>{section.title}.</strong>{" "}
            <InlineText text={section.body} definedTerms={definedTerms} />
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-slate-500">
        Common Paper Mutual Non-Disclosure Agreement{" "}
        <a
          href="https://commonpaper.com/standards/mutual-nda/1.0/"
          className="underline"
        >
          Version 1.0
        </a>{" "}
        free to use under{" "}
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
