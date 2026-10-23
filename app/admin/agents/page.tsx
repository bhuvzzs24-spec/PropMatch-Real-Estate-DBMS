'use client';

import RoleGate from '@/components/auth/RoleGate';
import { useApi } from '@/hooks/useApi';
import * as adminService from '@/services/admin';
import { useToast } from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';

function AdminAgentsContent() {
  const { data, loading, error, reload } = useApi(() => adminService.listAgents(), 'admin-agents', { keepPrevious: false });
  const showToast = useToast();

  async function toggleVerified(agentId: number, isVerified: boolean) {
    try {
      await adminService.setAgentVerified(agentId, !isVerified);
      showToast(!isVerified ? 'Agent verified' : 'Verification revoked', 'success');
      reload();
    } catch {
      showToast('Could not update the agent.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Agent verification</h1>
      {loading && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Licence no.</th>
                <th className="px-4 py-3">Listings</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.agentId} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{a.fullName}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.agencyName}</td>
                  <td className="px-4 py-3 text-slate-600">{a.licenseNo}</td>
                  <td className="px-4 py-3 text-slate-600">{a.totalListings}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {a.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleVerified(a.agentId, a.isVerified)} className="text-sm font-medium text-emerald-700 hover:underline">
                      {a.isVerified ? 'Revoke' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminAgentsPage() {
  return (
    <RoleGate allow={['ADMIN']} loginNext="/admin/agents">
      <AdminAgentsContent />
    </RoleGate>
  );
}
