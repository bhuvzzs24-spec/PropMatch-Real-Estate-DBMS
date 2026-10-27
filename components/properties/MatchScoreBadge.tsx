export default function MatchScoreBadge({ score }: { score: number }) {
  const tone = score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-slate-500';
  return (
    <span className={`inline-flex items-center rounded-full ${tone} px-2.5 py-1 text-xs font-semibold text-white shadow`}>
      {Math.round(score)}% match
    </span>
  );
}
