'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/format';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="mx-auto max-w-md px-4 py-8"><LoadingState /></div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <EmptyState
          title="Log in to view your profile"
          action={
            <Link href="/login?next=/profile" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My profile</h1>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Row label="Full name" value={user.fullName} />
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone ?? '—'} />
        <Row label="Role" value={user.role} />
        <Row label="Member since" value={formatDate(user.createdAt)} />
        {user.agentProfile && (
          <>
            <Row label="Agency" value={user.agentProfile.agencyName} />
            <Row label="Licence no." value={user.agentProfile.licenseNo} />
            <Row label="Verified" value={user.agentProfile.isVerified ? 'Yes' : 'Pending verification'} />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
