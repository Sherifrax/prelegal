import { Fragment, ReactNode } from "react";
import DefinedTerm from "./DefinedTerm";
import { DefinedTermValues } from "@/lib/derived";

export default function InlineText({
  text,
  definedTerms,
}: {
  text: string;
  definedTerms: DefinedTermValues;
}) {
  const nodes: ReactNode[] = [];
  const tokenPattern = /\{\{([^}]+)\}\}|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>
      );
    }
    const [, tokenField, boldText] = match;
    if (tokenField) {
      const field = tokenField as keyof DefinedTermValues;
      nodes.push(
        <DefinedTerm key={key++} field={tokenField} value={definedTerms[field]} />
      );
    } else if (boldText) {
      nodes.push(<strong key={key++}>{boldText}</strong>);
    }
    lastIndex = tokenPattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{nodes}</>;
}
