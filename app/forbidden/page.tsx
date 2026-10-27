import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <ShieldAlert size={40} className="text-rose-500" />
      <h1 className="mt-4 text-xl font-bold text-slate-900">You don&apos;t have access to this page</h1>
      <p className="mt-2 text-sm text-slate-500">If you think this is a mistake, check that you&apos;re logged in with the right account.</p>
      <Link href="/" className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
        Back to home
      </Link>
    </div>
  );
}
