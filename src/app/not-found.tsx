import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-6">
        <span className="text-2xl font-bold text-gold-400">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Ecclesiastical Record Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The requested portal resource or candidate record could not be located in the central registry.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-sm hover:bg-gold-400 transition-colors"
      >
        Return to Portal Dashboard
      </Link>
    </div>
  );
}

