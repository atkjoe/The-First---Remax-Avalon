import { Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import { propertyService } from "../../services/propertyService";
import Button from "../ui/Button.jsx";
import { Input, Select, Textarea } from "../ui/Input.jsx";

const initial = { title: "", type: "Apartment", price: "", beds: "", baths: "", area: "", notes: "" };

export default function PropertyForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.price) {
      setError("Title and price are required.");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) payload.append("image", image);

    setLoading(true);
    try {
      const created = await propertyService.create(payload);
      showToast("Property published successfully.");
      setForm(initial);
      setImage(null);
      onCreated?.(created);
    } catch (err) {
      setError(err.friendlyMessage || "Could not create property.");
      showToast(err.friendlyMessage || "Could not create property.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Input label="Title" value={form.title} onChange={(event) => update("title", event.target.value)} required />
      <Select label="Type" value={form.type} onChange={(event) => update("type", event.target.value)}>
        <option>Apartment</option>
        <option>Villa</option>
        <option>Studio</option>
        <option>Twin House</option>
      </Select>
      <Input label="Price" type="number" min="0" value={form.price} onChange={(event) => update("price", event.target.value)} required />
      <Input label="Area" type="number" min="0" value={form.area} onChange={(event) => update("area", event.target.value)} />
      <Input label="Bedrooms" type="number" min="0" value={form.beds} onChange={(event) => update("beds", event.target.value)} />
      <Input label="Bathrooms" type="number" min="0" value={form.baths} onChange={(event) => update("baths", event.target.value)} />
      <Textarea label="Apartment notes" className="min-h-28 sm:col-span-2" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Finishing, floor, view, delivery status, or viewing notes" />
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Property image</span>
        <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} />
      </label>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          <Upload className="h-4 w-4" />
          {loading ? "Publishing..." : "Publish property"}
        </Button>
      </div>
    </form>
  );
}
