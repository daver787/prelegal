'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { apiFetch, getToken } from '@/lib/api';
import { DOC_LABELS, type DocumentType } from '@/lib/types';

interface DocRecord {
  id: number;
  doc_type: string;
  title: string;
  updated_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    apiFetch('/api/documents')
      .then((res) => {
        if (res.status === 401) { router.replace('/login'); return null; }
        return res.json();
      })
      .then((data) => { if (data) setDocs(data); })
      .finally(() => setLoading(false));
  }, [router]);

  const newDocBtn = (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      New Document
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AppHeader title="My Documents" actions={newDocBtn} />

      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-navy">My Documents</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-brand-gray">
            Loading…
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No documents yet</p>
            <p className="mt-1 text-xs text-gray-400">Start a new document and it will appear here.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Create your first document
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Document</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Last updated</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{doc.title}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {DOC_LABELS[doc.doc_type as DocumentType] ?? doc.doc_type}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(doc.updated_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/?docId=${doc.id}`}
                        className="font-medium text-brand-blue hover:underline"
                      >
                        Resume
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
