import { Bell, Shield } from "lucide-react";

export default function Settings() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase text-brand-red">Settings</p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-ink">Workspace settings</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <Shield className="h-6 w-6 text-brand-blue" />
          <h2 className="mt-3 font-bold text-brand-ink">Protected API access</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">JWT tokens are stored locally and attached to protected requests.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <Bell className="h-6 w-6 text-brand-blue" />
          <h2 className="mt-3 font-bold text-brand-ink">Notifications</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Success and error feedback is shown with toast notifications across forms.</p>
        </div>
      </div>
    </section>
  );
}
