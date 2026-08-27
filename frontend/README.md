# Mutual NDA Creator

A Next.js prototype for PL-3: fill in a form with the key deal terms and get
back a completed Common Paper Mutual Non-Disclosure Agreement, previewed live
and downloadable as a PDF.

The generated document merges the entered values into the
[Common Paper Mutual NDA Cover Page](../templates/Mutual-NDA-coverpage.md),
and displays the invariant
[Standard Terms](../templates/Mutual-NDA.md) below it, with defined-term
references (e.g. "Purpose", "Governing Law") showing the filled-in value on
hover.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/lib/types.ts` — form data shape and defaults
- `src/lib/derived.ts` — computed display values (dates, term phrasing)
- `src/lib/standard-terms.ts` — Standard Terms content with `{{Field}}` tokens
- `src/lib/pdf.ts` — client-side PDF export (`html2canvas-pro` + `jspdf`)
- `src/components/NdaCreator.tsx` — page state, form + live preview layout
- `src/components/NdaForm.tsx` — the input form
- `src/components/NdaCoverPage.tsx` / `StandardTerms.tsx` — the rendered document
