export default function ReasonChips({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {reasons.slice(0, 2).map((r) => (
        <span key={r} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {r}
        </span>
      ))}
    </div>
  );
}
