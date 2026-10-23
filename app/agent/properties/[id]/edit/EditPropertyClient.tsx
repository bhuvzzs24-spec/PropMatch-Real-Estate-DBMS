'use client';

import RoleGate from '@/components/auth/RoleGate';
import PropertyForm from '@/components/agent/PropertyForm';
import { useApi } from '@/hooks/useApi';
import * as agentService from '@/services/agent';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

function EditPropertyContent({ propertyId }: { propertyId: number }) {
  const { data, loading, error, reload } = useApi(() => agentService.getEditableProperty(propertyId), `edit-property-${propertyId}`);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  if (!data) return <EmptyState title="Listing not found" description="It may have been removed." />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit listing</h1>
      <PropertyForm
        initial={data}
        submitLabel="Save changes"
        onSubmit={(input) => agentService.updateProperty(propertyId, input).then(() => undefined)}
      />
    </div>
  );
}

export default function EditPropertyClient({ propertyId }: { propertyId: number }) {
  return (
    <RoleGate allow={['AGENT']} loginNext={`/agent/properties/${propertyId}/edit`}>
      <EditPropertyContent propertyId={propertyId} />
    </RoleGate>
  );
}
