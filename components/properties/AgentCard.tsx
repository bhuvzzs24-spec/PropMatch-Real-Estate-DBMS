import { BadgeCheck, Phone } from 'lucide-react';
import type { PropertyAgent } from '@/types/api';

export default function AgentCard({ agent, onEnquire, onBookVisit }: { agent: PropertyAgent; onEnquire: () => void; onBookVisit: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
          {agent.fullName.charAt(0)}
        </div>
        <div>
          <p className="flex items-center gap-1 font-medium text-slate-900">
            {agent.fullName}
            {agent.isVerified && <BadgeCheck size={16} className="text-emerald-600" />}
          </p>
          <p className="text-sm text-slate-500">{agent.agencyName}</p>
        </div>
      </div>
      {agent.phone && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
          <Phone size={14} /> {agent.phone}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <button onClick={onEnquire} className="rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Send enquiry
        </button>
        <button onClick={onBookVisit} className="rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Book a site visit
        </button>
      </div>
    </div>
  );
}
