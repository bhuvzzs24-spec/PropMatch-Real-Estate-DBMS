'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PriceChange } from '@/types/api';
import { formatDate, formatShortINR } from '@/utils/format';

export default function PriceHistoryChart({ priceHistory, currentPrice }: { priceHistory: PriceChange[]; currentPrice: number }) {
  if (priceHistory.length === 0) return null;

  const points = [
    ...priceHistory.map((p) => ({ date: formatDate(p.changedAt), price: p.oldPrice })),
    { date: 'Now', price: currentPrice },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">Price history</p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatShortINR(v)} tick={{ fontSize: 12 }} width={70} />
            <Tooltip formatter={(v) => formatShortINR(Number(v))} />
            <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
