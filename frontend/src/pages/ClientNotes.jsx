import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../components/ui/Button.jsx";
import { Input, Textarea } from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/ui/Status.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync";
import { clientNoteService } from "../services/clientNoteService";
import { date } from "../utils/format";

const initial = { clientName: "", clientPhone: "", notes: "" };

export default function ClientNotes() {
  const clientNotes = useAsync(clientNoteService.list, [], { initialData: [] });
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

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
      const saved = editing ? await clientNoteService.update(editing._id, form) : await clientNoteService.create(form);
      clientNotes.setData((items = []) => editing ? items.map((item) => item._id === saved._id ? saved : item) : [saved, ...items]);
      showToast(editing ? "Client note updated." : "Client note added.");
      setModalOpen(false);
    } catch (err) {
      showToast(err.friendlyMessage || "Could not save client note.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    try {
      await clientNoteService.remove(item._id);
      clientNotes.setData((items = []) => items.filter((current) => current._id !== item._id));
      showToast("Client note deleted.");
    } catch (err) {
      showToast(err.friendlyMessage || "Could not delete client note.", "error");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-brand-red">Client log</p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-ink">Private client notes</h1>
          <p className="mt-2 text-sm text-slate-600">These entries are private to your admin account.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add note</Button>
      </div>

      {clientNotes.loading ? <SkeletonGrid count={4} /> : clientNotes.error ? <ErrorState message={clientNotes.error} onRetry={clientNotes.run} /> : clientNotes.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {clientNotes.data.map((item) => (
            <article key={item._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-brand-ink">{item.clientName || "Client"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.clientPhone || "No phone"} · Updated {date(item.updatedAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="h-10 w-10 px-0" aria-label="Edit client note" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="danger" className="h-10 w-10 px-0" aria-label="Delete client note" onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{item.notes || "No notes yet."}</p>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No client notes yet" description="Create notes for follow-ups, preferences, and viewing history." />}

      <Modal open={modalOpen} title={editing ? "Edit client note" : "Add client note"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Client name" value={form.clientName} onChange={(event) => update("clientName", event.target.value)} />
          <Input label="Client phone" value={form.clientPhone} onChange={(event) => update("clientPhone", event.target.value)} />
          <Textarea label="Notes" className="min-h-36 sm:col-span-2" value={form.notes} onChange={(event) => update("notes", event.target.value)} required />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save note"}</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
