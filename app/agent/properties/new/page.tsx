'use client';

import RoleGate from '@/components/auth/RoleGate';
import PropertyForm from '@/components/agent/PropertyForm';
import * as agentService from '@/services/agent';

function NewPropertyContent() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">New listing</h1>
      <PropertyForm submitLabel="Publish listing" onSubmit={(input) => agentService.createProperty(input).then(() => undefined)} />
    </div>
  );
}

export default function NewPropertyPage() {
  return (
    <RoleGate allow={['AGENT']} loginNext="/agent/properties/new">
      <NewPropertyContent />
    </RoleGate>
  );
}
