export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        className={`min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-blue-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
