import { Bell, CalendarDays, NotebookPen, Shield } from "lucide-react";

export default function Settings() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase text-brand-red">Settings</p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-ink">Workspace settings</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <Shield className="h-6 w-6 text-brand-blue" />
          <h2 className="mt-3 font-bold text-brand-ink">Private admin data</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Appointments and client notes are filtered to the signed-in admin account.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <Bell className="h-6 w-6 text-brand-blue" />
          <h2 className="mt-3 font-bold text-brand-ink">Appointment reminders</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">The calendar can show browser reminders before scheduled viewings and follow-ups.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <CalendarDays className="h-6 w-6 text-brand-blue" />
          <h2 className="mt-3 font-bold text-brand-ink">Calendar workflow</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Each admin can add, edit, and delete their own appointment schedule.</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <NotebookPen className="h-6 w-6 text-brand-blue" />
          <h2 className="mt-3 font-bold text-brand-ink">Client log</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Client notes stay attached to the admin who created them.</p>
        </div>
      </div>
    </section>
  );
}
