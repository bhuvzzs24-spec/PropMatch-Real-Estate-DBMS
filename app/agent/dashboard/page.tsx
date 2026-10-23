'use client';

import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';
import StatCard from '@/components/agent/StatCard';
import { useApi } from '@/hooks/useApi';
import { getAgentStats } from '@/services/agent';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { formatShortINR } from '@/utils/format';

function DashboardContent() {
  const { user } = useAuth();
  const { data: stats, loading, error, reload } = useApi(() => getAgentStats(), 'agent-stats', { keepPrevious: false });
  const isVerified = user?.agentProfile?.isVerified ?? true;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link href="/agent/properties/new" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          + New listing
        </Link>
      </div>

      {!isVerified && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your agency is pending admin verification. Your listings won&apos;t appear publicly until then.
        </div>
      )}

      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {stats && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total listings" value={stats.totalListings} />
            <StatCard label="Active" value={stats.activeListings} />
            <StatCard label="Closed" value={stats.closedListings} />
            <StatCard label="Enquiries" value={stats.totalInquiries} />
            <StatCard label="Site visits" value={stats.totalVisits} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">Average listing price</p>
              <p className="text-xl font-bold text-emerald-700">{formatShortINR(stats.avgListingPrice)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">Enquiries by status</p>
              <div className="flex gap-4 text-sm text-slate-600">
                <span>New: {stats.inquiriesByStatus.NEW}</span>
                <span>Contacted: {stats.inquiriesByStatus.CONTACTED}</span>
                <span>Closed: {stats.inquiriesByStatus.CLOSED}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/agent/properties" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Manage listings
            </Link>
            <Link href="/agent/inquiries" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              View enquiries
            </Link>
            <Link href="/agent/visits" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              View visit requests
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function AgentDashboardPage() {
  return (
    <RoleGate allow={['AGENT']} loginNext="/agent/dashboard">
      <DashboardContent />
    </RoleGate>
  );
}
