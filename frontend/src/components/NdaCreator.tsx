"use client";

import { useRef, useState } from "react";
import { defaultNdaFormData, NdaFormData } from "@/lib/types";
import { buildDefinedTermValues } from "@/lib/derived";
import NdaChat from "./NdaChat";
import NdaCoverPage from "./NdaCoverPage";
import StandardTerms from "./StandardTerms";
import { downloadElementAsPdf } from "@/lib/pdf";

export default function NdaCreator() {
  const [data, setData] = useState<NdaFormData>(defaultNdaFormData);
  const [isComplete, setIsComplete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const definedTerms = buildDefinedTermValues(data);

  const handleDownload = async () => {
    if (!documentRef.current) return;
    setIsDownloading(true);
    try {
      const party1 = data.party1.company || "Party 1";
      const party2 = data.party2.company || "Party 2";
      await downloadElementAsPdf(
        documentRef.current,
        `Mutual-NDA-${party1}-${party2}.pdf`.replace(/\s+/g, "-")
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">Mutual NDA Creator</h1>
        <p className="mt-1 text-sm text-slate-600">
          Chat with the AI assistant about your NDA. The completed Mutual
          Non-Disclosure Agreement updates on the right as you answer.
        </p>
        <div className="mt-6">
          <NdaChat
            data={data}
            onDataChange={setData}
            onCompleteChange={setIsComplete}
          />
        </div>
      </div>

      <div>
        <div className="sticky top-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600">Preview</h2>
            {isComplete && (
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
            <div ref={documentRef} className="bg-white p-8 text-sm text-slate-900">
              <NdaCoverPage data={data} />
              <StandardTerms definedTerms={definedTerms} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
