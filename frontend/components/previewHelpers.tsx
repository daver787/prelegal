export function placeholder(value: string, fallback: string) {
  return value || <span className="italic text-gray-400">{fallback}</span>;
}

export function formatDate(iso: string): string {
  return iso
    ? new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
}

export function formatDateCell(iso: string): React.ReactNode {
  return formatDate(iso) || <span className="italic text-gray-400">Not specified</span>;
}

export function CoverRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td className="border border-gray-300 px-4 py-3 align-top text-xs font-semibold text-gray-700 w-1/3 bg-gray-50">
        {label}
        {hint && <div className="mt-0.5 text-xs font-normal text-gray-500">{hint}</div>}
      </td>
      <td className="border border-gray-300 px-4 py-3 align-top text-sm">{children}</td>
    </tr>
  );
}

export function SigRow({
  label,
  children,
}: {
  label: string;
  children: [React.ReactNode, React.ReactNode];
}) {
  const [c1, c2] = children;
  return (
    <tr>
      <td className="border border-gray-300 px-4 py-3 align-top text-xs font-semibold text-gray-700 bg-gray-50">
        {label}
      </td>
      <td className="border border-gray-300 px-4 py-3 align-top text-sm">{c1}</td>
      <td className="border border-gray-300 px-4 py-3 align-top text-sm">{c2}</td>
    </tr>
  );
}

interface Party {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

export function TwoPartySignatureTable({
  label1,
  label2,
  party1,
  party2,
}: {
  label1: string;
  label2: string;
  party1: Party;
  party2: Party;
}) {
  return (
    <table className="mb-6 w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left text-xs font-semibold w-1/4" />
          <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-center text-xs font-semibold">
            {label1.toUpperCase()}
          </th>
          <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-center text-xs font-semibold">
            {label2.toUpperCase()}
          </th>
        </tr>
      </thead>
      <tbody>
        <SigRow label="Signature">
          <div className="h-8" />
          <div className="h-8" />
        </SigRow>
        <SigRow label="Print Name">
          <>{placeholder(party1.name, '')}</>
          <>{placeholder(party2.name, '')}</>
        </SigRow>
        <SigRow label="Title">
          <>{placeholder(party1.title, '')}</>
          <>{placeholder(party2.title, '')}</>
        </SigRow>
        <SigRow label="Company">
          <>{placeholder(party1.company, '')}</>
          <>{placeholder(party2.company, '')}</>
        </SigRow>
        <SigRow label="Notice Address">
          <>{placeholder(party1.noticeAddress, '')}</>
          <>{placeholder(party2.noticeAddress, '')}</>
        </SigRow>
        <SigRow label="Date">
          <>{formatDate(party1.date)}</>
          <>{formatDate(party2.date)}</>
        </SigRow>
      </tbody>
    </table>
  );
}

export function PreviewShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div
        id="doc-preview-content"
        className="rounded-lg bg-white px-12 py-10 shadow-sm font-serif text-[13px] leading-relaxed text-gray-900"
        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        <h1 className="mb-1 text-center text-xl font-bold tracking-wide">{title}</h1>
        {subtitle && (
          <p className="mb-6 text-center text-xs uppercase tracking-widest text-gray-500">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
