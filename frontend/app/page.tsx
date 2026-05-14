'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NdaChat from '@/components/NdaChat';
import DocumentPreview from '@/components/DocumentPreview';
import AppHeader from '@/components/AppHeader';
import { defaultFormData, type AgreementData, DOC_LABELS } from '@/lib/types';
import { apiFetch, getToken } from '@/lib/api';

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [formData, setFormData] = useState<AgreementData>(defaultFormData);
  const [downloading, setDownloading] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef<AgreementData | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const loadId = searchParams.get('docId');
    if (loadId) {
      apiFetch(`/api/documents/${loadId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((doc) => {
          if (doc?.data_json) {
            try { setFormData(JSON.parse(doc.data_json)); setDocId(Number(loadId)); } catch {}
          }
          setReady(true);
        })
        .catch(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [router, searchParams]);

  if (!ready) return null;

  const docLabel = formData.documentType ? DOC_LABELS[formData.documentType] : null;

  const doSave = async (data: AgreementData, currentDocId: number | null): Promise<number | null> => {
    const title = DOC_LABELS[data.documentType!];
    const body = { title, data_json: JSON.stringify(data) };
    if (currentDocId) {
      await apiFetch(`/api/documents/${currentDocId}`, { method: 'PUT', body: JSON.stringify(body) });
      return currentDocId;
    } else {
      const res = await apiFetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ doc_type: data.documentType, ...body }),
      });
      if (res.ok) {
        const { id } = await res.json();
        return id;
      }
      return null;
    }
  };

  const handleSave = async (data: AgreementData) => {
    if (!data.documentType) return;
    if (savingRef.current) {
      pendingSaveRef.current = data;
      return;
    }
    savingRef.current = true;
    let latestDocId = docId;
    try {
      const newId = await doSave(data, latestDocId);
      if (newId && !latestDocId) {
        latestDocId = newId;
        setDocId(newId);
      }
    } finally {
      savingRef.current = false;
      const pending = pendingSaveRef.current;
      if (pending) {
        pendingSaveRef.current = null;
        handleSave(pending);
      }
    }
  };

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

  const downloadBtn = (
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
  );

  return (
    <div className="flex h-screen flex-col">
      <AppHeader
        title={docLabel ? `${docLabel} Creator` : 'Legal Agreement Creator'}
        subtitle={
          formData.documentType === 'mutual_nda' || formData.documentType === 'mutual_nda_coverpage'
            ? 'Common Paper Mutual NDA Standard Terms Version 1.0'
            : docLabel
            ? 'Common Paper Standard Terms'
            : 'Tell the AI assistant what document you need'
        }
        actions={downloadBtn}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="no-print w-96 flex-shrink-0 overflow-hidden border-r border-gray-200 bg-white">
          <NdaChat data={formData} onChange={setFormData} onSave={handleSave} />
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <DocumentPreview data={formData} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
