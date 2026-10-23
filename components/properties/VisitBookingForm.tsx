'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import * as visitsService from '@/services/visits';
import { ApiError } from '@/services/http';
import { toDateTimeLocalValue } from '@/utils/format';

export default function VisitBookingForm({ propertyId, onClose }: { propertyId: number; onClose: () => void }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);

  const [when, setWhen] = useState(toDateTimeLocalValue(tomorrow));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await visitsService.createVisit({ propertyId, scheduledAt: new Date(when).toISOString() });
      showToast('Visit requested. The agent will confirm shortly.', 'success');
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SLOT_ALREADY_BOOKED') {
        setError('That slot is already booked. Please choose another time.');
      } else if (err instanceof ApiError && err.code === 'VISIT_MUST_BE_IN_FUTURE') {
        setError('Please choose a time in the future.');
      } else if (err instanceof ApiError && err.code === 'PROPERTY_NOT_AVAILABLE') {
        setError('This property is no longer available.');
      } else {
        setError('Could not book the visit. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Book a site visit" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Preferred date & time</label>
        <input
          type="datetime-local"
          value={when}
          min={toDateTimeLocalValue(new Date())}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? 'Booking...' : 'Request visit'}
        </button>
      </form>
    </Modal>
  );
}
