'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import * as inquiriesService from '@/services/inquiries';
import { ApiError } from '@/services/http';

export default function InquiryForm({ propertyId, onClose }: { propertyId: number; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await inquiriesService.createInquiry({ propertyId, message: message.trim() });
      showToast('Enquiry sent to the agent', 'success');
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PROPERTY_NOT_AVAILABLE') {
        setError('This property is no longer available.');
      } else {
        setError('Could not send your enquiry. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Send an enquiry" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Ask about pricing, availability, or anything else..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? 'Sending...' : 'Send enquiry'}
        </button>
      </form>
    </Modal>
  );
}
