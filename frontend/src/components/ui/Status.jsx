import Button from "./Button.jsx";

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 h-40 rounded-lg bg-slate-200" />
          <div className="mb-3 h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-lg font-bold text-brand-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-red-800">
      <p className="font-semibold">Something needs attention</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
