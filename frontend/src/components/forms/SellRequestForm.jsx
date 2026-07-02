import { Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import { sellRequestService } from "../../services/sellRequestService";
import Button from "../ui/Button.jsx";
import { Input, Select } from "../ui/Input.jsx";

const initial = {
  name: "",
  phone: "",
  address: "",
  type: "Apartment",
  area: "",
  bedrooms: "",
  bathrooms: "",
  price: ""
};

export default function SellRequestForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      showToast("Name, phone, and address are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const created = await sellRequestService.create(form);
      showToast("Sell request submitted successfully.");
      setForm(initial);
      onCreated?.(created);
    } catch (err) {
      showToast(err.friendlyMessage || "Could not submit sell request.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Input label="Full name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
      <Input label="Phone number" value={form.phone} onChange={(event) => update("phone", event.target.value)} required />
      <Input label="Address" value={form.address} onChange={(event) => update("address", event.target.value)} required />
      <Select label="Property type" value={form.type} onChange={(event) => update("type", event.target.value)}>
        <option>Apartment</option>
        <option>Villa</option>
        <option>Studio</option>
      </Select>
      <Input label="Area" type="number" min="0" value={form.area} onChange={(event) => update("area", event.target.value)} />
      <Input label="Bedrooms" type="number" min="0" value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} />
      <Input label="Bathrooms" type="number" min="0" value={form.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} />
      <Input label="Expected price" type="number" min="0" value={form.price} onChange={(event) => update("price", event.target.value)} />
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Submitting..." : "Submit sell request"}
        </Button>
      </div>
    </form>
  );
}
