"use client";

import { useRef, useState } from "react";
import { defaultDocumentData, DocumentData } from "@/lib/types";
import { buildDefinedTermValues } from "@/lib/derived";
import { DOCUMENT_TYPES } from "@/lib/document-types";
import { STANDARD_TERMS_BY_DOC_TYPE } from "@/lib/templates";
import DocumentChat from "./DocumentChat";
import DocumentCoverPage from "./DocumentCoverPage";
import StandardTerms from "./StandardTerms";
import { downloadElementAsPdf } from "@/lib/pdf";

export default function DocumentCreator() {
  const [data, setData] = useState<DocumentData>(defaultDocumentData);
  const [isComplete, setIsComplete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const meta = data.docType ? DOCUMENT_TYPES[data.docType] : null;
  const sections = data.docType ? STANDARD_TERMS_BY_DOC_TYPE[data.docType] : null;
  const definedTerms = meta ? buildDefinedTermValues(data, meta) : {};

  const handleDownload = async () => {
    if (!documentRef.current || !meta) return;
    setIsDownloading(true);
    try {
      const party1 = data.parties.party1?.company || meta.parties[0].label;
      const party2 = data.parties.party2?.company || meta.parties[1].label;
      await downloadElementAsPdf(
        documentRef.current,
        `${meta.name}-${party1}-${party2}.pdf`.replace(/\s+/g, "-")
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">{meta ? meta.name : "Document Creator"}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {meta
            ? `Chat with the AI assistant about your ${meta.name}. The document updates on the right as you answer.`
            : "Tell the AI assistant what kind of legal agreement you need, and it'll guide you through creating it."}
        </p>
        <div className="mt-6">
          <DocumentChat data={data} onDataChange={setData} onCompleteChange={setIsComplete} />
        </div>
      </div>

      <div>
        <div className="sticky top-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600">Preview</h2>
            {isComplete && meta && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 disabled:opacity-50"
              >
                {isDownloading ? "Preparing PDF…" : "Download PDF"}
              </button>
            )}
          </div>
          <div className="mt-3 max-h-[80vh] overflow-y-auto rounded-lg border border-slate-200 shadow-sm">
            {meta && sections ? (
              <div ref={documentRef} className="bg-white p-8 text-sm text-slate-900">
                <DocumentCoverPage data={data} meta={meta} />
                <StandardTerms documentName={meta.name} sections={sections} definedTerms={definedTerms} />
              </div>
            ) : (
              <div className="bg-white p-8 text-sm text-slate-500">
                The document preview will appear here once the AI knows which
                agreement you need.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
