export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} PropMatch. Built for a DBMS Level 3 project.</p>
      </div>
    </footer>
  );
}
