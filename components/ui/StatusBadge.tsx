import { STATUS_STYLES } from '@/utils/constants';
import type { InquiryStatus, PropertyStatus, VisitStatus } from '@/types/api';

const LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  SOLD: 'Sold',
  RENTED: 'Rented',
  INACTIVE: 'Inactive',
  NEW: 'New',
  CONTACTED: 'Contacted',
  CLOSED: 'Closed',
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function StatusBadge({ status }: { status: PropertyStatus | InquiryStatus | VisitStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
