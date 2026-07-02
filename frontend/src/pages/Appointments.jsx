import { Bell, CalendarDays, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button.jsx";
import { Input, Textarea } from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/ui/Status.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync";
import { appointmentService } from "../services/appointmentService";
import { date } from "../utils/format";

const initial = {
  clientName: "",
  clientPhone: "",
  propertyTitle: "",
  scheduledAt: "",
  reminderMinutesBefore: "30",
  notes: ""
};

export default function Appointments() {
  const appointments = useAsync(appointmentService.list, [], { initialData: [] });
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return (appointments.data || []).filter((item) => new Date(item.scheduledAt).getTime() >= now);
  }, [appointments.data]);

  const reminders = useMemo(() => {
    const now = Date.now();
    return upcoming.filter((item) => {
      const scheduled = new Date(item.scheduledAt).getTime();
      const reminderAt = scheduled - Number(item.reminderMinutesBefore || 0) * 60000;
      return reminderAt <= now;
    });
  }, [upcoming]);

  useEffect(() => {
    if (!reminders.length || !("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
    if (Notification.permission !== "granted") return;
    reminders.slice(0, 3).forEach((item) => {
      const key = `appointment-notified-${item._id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      new Notification(`Appointment with ${item.clientName || "client"}`, {
        body: item.propertyTitle || "Scheduled viewing reminder"
      });
    });
  }, [reminders]);

  function openCreate() {
    setEditing(null);
    setForm(initial);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      clientName: item.clientName || "",
      clientPhone: item.clientPhone || "",
      propertyTitle: item.propertyTitle || "",
      scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : "",
      reminderMinutesBefore: String(item.reminderMinutesBefore ?? 30),
      notes: item.notes || ""
    });
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        scheduledAt: new Date(form.scheduledAt),
        reminderMinutesBefore: Number(form.reminderMinutesBefore || 0)
      };
      const saved = editing ? await appointmentService.update(editing._id, payload) : await appointmentService.create(payload);
      appointments.setData((items = []) => {
        const next = editing ? items.map((item) => item._id === saved._id ? saved : item) : [...items, saved];
        return next.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      });
      showToast(editing ? "Appointment updated." : "Appointment scheduled.");
      setModalOpen(false);
    } catch (err) {
      showToast(err.friendlyMessage || "Could not save appointment.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    try {
      await appointmentService.remove(item._id);
      appointments.setData((items = []) => items.filter((current) => current._id !== item._id));
      showToast("Appointment deleted.");
    } catch (err) {
      showToast(err.friendlyMessage || "Could not delete appointment.", "error");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-brand-red">Calendar</p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-ink">Appointments</h1>
          <p className="mt-2 text-sm text-slate-600">Only your scheduled appointments are shown here.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add appointment</Button>
      </div>

      {reminders.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4" /> Reminder</div>
          <p className="mt-1 text-sm">{reminders[0].clientName || "A client"} has an upcoming appointment for {reminders[0].propertyTitle || "a property"}.</p>
        </div>
      ) : null}

      {appointments.loading ? <SkeletonGrid count={3} /> : appointments.error ? <ErrorState message={appointments.error} onRetry={appointments.run} /> : appointments.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {appointments.data.map((item) => (
            <article key={item._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-brand-ink">{item.clientName || "Client appointment"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.clientPhone || "No phone"} · {item.propertyTitle || "No property set"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="h-10 w-10 px-0" aria-label="Edit appointment" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="danger" className="h-10 w-10 px-0" aria-label="Delete appointment" onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 p-3"><CalendarDays className="h-4 w-4 text-brand-blue" /> {date(item.scheduledAt)}</span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 p-3"><Clock className="h-4 w-4 text-brand-blue" /> {new Date(item.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{item.notes || "No notes for this appointment."}</p>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No appointments yet" description="Schedule viewings, follow-ups, and calls from here." />}

      <Modal open={modalOpen} title={editing ? "Edit appointment" : "Add appointment"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Client name" value={form.clientName} onChange={(event) => update("clientName", event.target.value)} />
          <Input label="Client phone" value={form.clientPhone} onChange={(event) => update("clientPhone", event.target.value)} />
          <Input label="Property" value={form.propertyTitle} onChange={(event) => update("propertyTitle", event.target.value)} />
          <Input label="Date and time" type="datetime-local" value={form.scheduledAt} onChange={(event) => update("scheduledAt", event.target.value)} required />
          <Input label="Reminder minutes before" type="number" min="0" value={form.reminderMinutesBefore} onChange={(event) => update("reminderMinutesBefore", event.target.value)} />
          <Textarea label="Notes" className="min-h-28 sm:col-span-2" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save appointment"}</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
