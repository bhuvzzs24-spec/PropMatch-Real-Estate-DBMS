'use client';

import RoleGate from '@/components/auth/RoleGate';
import StatCard from '@/components/agent/StatCard';
import { useApi } from '@/hooks/useApi';
import * as adminService from '@/services/admin';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { formatShortINR } from '@/utils/format';

function AdminDashboardContent() {
  const { data, loading, error, reload } = useApi(() => adminService.getAnalytics(), 'admin-analytics', { keepPrevious: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Platform analytics</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Users" value={data.totals.users} />
            <StatCard label="Agents" value={data.totals.agents} />
            <StatCard label="Active listings" value={data.totals.activeListings} />
            <StatCard label="Enquiries" value={data.totals.inquiries} />
            <StatCard label="Site visits" value={data.totals.visits} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Average price/sqft by locality</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Locality</th>
                    <th className="px-4 py-2">Listings</th>
                    <th className="px-4 py-2">Avg ₹/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  {data.avgPricePerSqftByLocality.map((row) => (
                    <tr key={`${row.city}-${row.locality}`} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2">{row.locality}, {row.city}</td>
                      <td className="px-4 py-2">{row.listings}</td>
                      <td className="px-4 py-2">{formatShortINR(row.avgPricePerSqft)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Top agents by enquiries</h2>
              <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                {data.topAgents.map((a) => (
                  <li key={a.agentId} className="flex justify-between text-sm">
                    <span className="text-slate-700">{a.agentName}</span>
                    <span className="text-slate-500">{a.totalListings} listings · {a.totalInquiries} enquiries</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Trending properties</h2>
              <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                {data.trendingProperties.map((p) => (
                  <li key={p.propertyId} className="flex justify-between text-sm">
                    <span className="truncate pr-2 text-slate-700">{p.title}</span>
                    <span className="shrink-0 text-slate-500">{p.views} views</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RoleGate allow={['ADMIN']} loginNext="/admin/dashboard">
      <AdminDashboardContent />
    </RoleGate>
  );
}
