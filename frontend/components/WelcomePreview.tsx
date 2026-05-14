'use client';

export default function WelcomePreview() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white px-12 py-16 shadow-sm text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-brand-blue opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-brand-navy">
          Your agreement will appear here
        </h2>
        <p className="mb-8 text-sm text-brand-gray">
          Tell the AI assistant what document you need to get started.
        </p>
        <div className="mx-auto max-w-sm text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Supported documents
          </p>
          <ul className="space-y-2">
            {[
              'Mutual NDA',
              'Cloud Service Agreement',
              'Design Partner Agreement',
              'Professional Services Agreement',
              'Software License Agreement',
              'Partnership Agreement',
              'Pilot Agreement',
            ].map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
