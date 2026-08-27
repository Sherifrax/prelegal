interface DefinedTermProps {
  field: string;
  value: string;
}

export default function DefinedTerm({ field, value }: DefinedTermProps) {
  return (
    <span
      className="cursor-help underline decoration-dotted decoration-slate-400 underline-offset-2"
      title={`${field}: ${value}`}
    >
      {field}
    </span>
  );
}
