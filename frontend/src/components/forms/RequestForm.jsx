import { Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import { requestService } from "../../services/requestService";
import Button from "../ui/Button.jsx";
import { Input, Select, Textarea } from "../ui/Input.jsx";

const initial = { location: "", budget: "", type: "Apartment", bedrooms: "", notes: "" };

export default function RequestForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.location.trim() || !form.budget) {
      showToast("Location and budget are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const created = await requestService.create(form);
      showToast("Buyer request submitted successfully.");
      setForm(initial);
      onCreated?.(created);
    } catch (err) {
      showToast(err.friendlyMessage || "Could not submit request.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Input label="Location required" value={form.location} onChange={(event) => update("location", event.target.value)} required />
      <Input label="Budget" type="number" min="0" value={form.budget} onChange={(event) => update("budget", event.target.value)} required />
      <Select label="Property type" value={form.type} onChange={(event) => update("type", event.target.value)}>
        <option>Apartment</option>
        <option>Villa</option>
        <option>Studio</option>
        <option>Townhouse</option>
      </Select>
      <Input label="Bedrooms" type="number" min="0" value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} />
      <Textarea label="Notes" className="min-h-28" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Submitting..." : "Submit buyer request"}
        </Button>
      </div>
    </form>
  );
}
