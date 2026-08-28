import { StandardTermSection } from "@/lib/document-types";
import { DefinedTermValues } from "@/lib/derived";
import InlineText from "./InlineText";

export default function StandardTerms({
  documentName,
  sections,
  definedTerms,
}: {
  documentName: string;
  sections: StandardTermSection[];
  definedTerms: DefinedTermValues;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Standard Terms</h2>
      <ol className="mt-4 space-y-4 list-decimal pl-5">
        {sections.map((section) => {
          const [firstParagraph, ...restParagraphs] = section.body.split("\n\n");
          return (
            <li key={section.title} className="leading-relaxed">
              <strong>{section.title}.</strong>{" "}
              <InlineText text={firstParagraph} definedTerms={definedTerms} />
              {restParagraphs.map((paragraph, index) => (
                <p key={index} className="mt-2">
                  <InlineText text={paragraph} definedTerms={definedTerms} />
                </p>
              ))}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-sm text-slate-500">
        Common Paper {documentName} — text generated from Common Paper&apos;s
        free standard templates under{" "}
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
