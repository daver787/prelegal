'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NdaChat from '@/components/NdaChat';
import DocumentPreview from '@/components/DocumentPreview';
import { defaultFormData, type AgreementData, DOC_LABELS } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [formData, setFormData] = useState<AgreementData>(defaultFormData);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('prelegal_logged_in')) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  const docLabel = formData.documentType ? DOC_LABELS[formData.documentType] : null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (await import('html2pdf.js' as any)).default;
      const element = document.getElementById('doc-preview-content');
      if (!element) return;
      const filename = formData.documentType
        ? formData.documentType.replace(/_/g, '-') + '.pdf'
        : 'agreement.pdf';
      await html2pdf()
        .set({
          margin: [12, 15, 12, 15],
          filename,
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="no-print flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {docLabel ? `${docLabel} Creator` : 'Legal Agreement Creator'}
          </h1>
          <p className="text-xs text-gray-500">
            {formData.documentType === 'mutual_nda' || formData.documentType === 'mutual_nda_coverpage'
              ? 'Common Paper Mutual NDA Standard Terms Version 1.0'
              : docLabel
              ? 'Common Paper Standard Terms'
              : 'Tell the AI assistant what document you need'}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading || !formData.documentType}
          className="inline-flex items-center gap-2 rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-60"
        >
          {downloading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating PDF…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </header>

      {/* Main split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: AI Chat */}
        <div className="no-print w-96 flex-shrink-0 overflow-hidden border-r border-gray-200 bg-white">
          <NdaChat data={formData} onChange={setFormData} />
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <DocumentPreview data={formData} />
        </div>
      </div>
    </div>
  );
}
