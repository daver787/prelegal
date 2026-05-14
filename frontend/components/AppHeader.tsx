'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuth, getEmail } from '@/lib/api';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, actions }: Props) {
  const router = useRouter();
  const email = getEmail();

  const handleSignOut = () => {
    clearAuth();
    router.replace('/login');
  };

  return (
    <header className="no-print flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-brand-navy hover:opacity-80 transition">
          Prelegal
        </Link>
        <div className="hidden sm:block h-5 w-px bg-gray-200" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-800 leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-brand-gray leading-tight">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <Link
          href="/documents"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          My Documents
        </Link>
        {email && (
          <span className="hidden md:block text-xs text-brand-gray">{email}</span>
        )}
        <button
          onClick={handleSignOut}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
