import type { ApiMeta } from '@/types/api';

export default function Pagination({ meta, onChange }: { meta: ApiMeta; onChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="Pagination">
      <button
        onClick={() => onChange(meta.page - 1)}
        disabled={meta.page <= 1}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
          <button
            onClick={() => onChange(p)}
            aria-current={p === meta.page ? 'page' : undefined}
            className={`min-w-[2.25rem] rounded-lg px-3 py-1.5 text-sm ${
              p === meta.page ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(meta.page + 1)}
        disabled={meta.page >= meta.totalPages}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
