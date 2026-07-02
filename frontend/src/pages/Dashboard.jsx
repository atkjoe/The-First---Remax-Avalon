import { Building2, CalendarDays, NotebookPen, Plus, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import PropertyForm from "../components/forms/PropertyForm.jsx";
import PropertyCard from "../components/properties/PropertyCard.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { Input, Select } from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/ui/Status.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync";
import { dashboardService } from "../services/dashboardService";
import { propertyService } from "../services/propertyService";
import { requestService } from "../services/requestService";
import { sellRequestService } from "../services/sellRequestService";
import { currency, date, number } from "../utils/format";

export default function Dashboard() {
  const { isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const [propertyModal, setPropertyModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [requestType, setRequestType] = useState("");
  const stats = useAsync(dashboardService.stats, []);
  const properties = useAsync(propertyService.list, [], { initialData: [] });
  const requests = useAsync(requestService.list, [], { initialData: [] });
  const sellRequests = useAsync(sellRequestService.list, [], { immediate: isSuperAdmin, initialData: [] });

  const filteredRequests = useMemo(() => {
    return (requests.data || []).filter((item) => {
      const text = `${item.name} ${item.phone} ${item.requesterType} ${item.location} ${item.type} ${item.notes}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase())) && (!requestType || item.type === requestType);
    });
  }, [query, requestType, requests.data]);

  function askDelete(type, id, label) {
    setDeleteTarget({ type, id, label });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "property") {
        await propertyService.remove(deleteTarget.id);
        properties.setData((items = []) => items.filter((item) => item._id !== deleteTarget.id));
      }
      if (deleteTarget.type === "buyer request") {
        await requestService.remove(deleteTarget.id);
        requests.setData((items = []) => items.filter((item) => item._id !== deleteTarget.id));
      }
      if (deleteTarget.type === "sell request") {
        await sellRequestService.remove(deleteTarget.id);
        sellRequests.setData((items = []) => items.filter((item) => item._id !== deleteTarget.id));
      }
      stats.run().catch(() => {});
      showToast(`${deleteTarget.label} deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.friendlyMessage || `Could not delete ${deleteTarget.type}.`, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={Building2} label="Properties" value={stats.data?.properties} loading={stats.loading} />
        <Stat icon={Users} label="Buyer requests" value={stats.data?.requests} loading={stats.loading} />
        <Stat icon={Search} label="Sell requests" value={stats.data?.sell} loading={stats.loading} />
        <Stat icon={CalendarDays} label="Appointments" value={stats.data?.appointments} loading={stats.loading} />
        <Stat icon={NotebookPen} label="Client notes" value={stats.data?.clientNotes} loading={stats.loading} />
      </section>

      {stats.error ? <ErrorState message={stats.error} onRetry={stats.run} /> : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-brand-ink">Properties</h2>
            <p className="text-sm text-slate-500">New listings automatically use your contact details.</p>
          </div>
          <Button onClick={() => setPropertyModal(true)}>
            <Plus className="h-4 w-4" />
            Add property
          </Button>
        </div>
        {properties.loading ? <SkeletonGrid count={3} /> : properties.error ? <ErrorState message={properties.error} onRetry={properties.run} /> : properties.data?.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {properties.data.slice(0, 6).map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                actions={isSuperAdmin ? (
                  <Button variant="danger" className="min-h-10 w-full" onClick={() => askDelete("property", property._id, property.title || "Property")}>
                    <Trash2 className="h-4 w-4" />
                    Delete property
                  </Button>
                ) : null}
              />
            ))}
          </div>
        ) : <EmptyState title="No properties yet" description="Create the first listing with an image upload." />}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-brand-ink">Buyer requests</h2>
            <p className="text-sm text-slate-500">Public buyer requirements collected from the website.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
            <Input label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Select label="Type" value={requestType} onChange={(event) => setRequestType(event.target.value)}>
              <option value="">All</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Studio</option>
            </Select>
          </div>
        </div>
        <RequestList data={filteredRequests} loading={requests.loading} error={requests.error} retry={requests.run} isSuperAdmin={isSuperAdmin} onDelete={(item) => askDelete("buyer request", item._id, item.location || "Buyer request")} />
      </section>

      {isSuperAdmin ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-brand-ink">Sell requests</h2>
              <p className="text-sm text-slate-500">Seller valuation requests visible to the superadmin.</p>
            </div>
          </div>
          <SellRequestList data={sellRequests.data || []} loading={sellRequests.loading} error={sellRequests.error} retry={sellRequests.run} onDelete={(item) => askDelete("sell request", item._id, item.name || "Sell request")} />
        </section>
      ) : null}

      <Modal open={propertyModal} title="Add property" onClose={() => setPropertyModal(false)}>
        <PropertyForm
          onCreated={(created) => {
            properties.setData((items = []) => [created, ...items]);
            stats.run().catch(() => {});
            setPropertyModal(false);
          }}
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete record"
        message={`Are you sure you want to delete ${deleteTarget?.label || "this record"}? This cannot be undone.`}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Stat({ icon: Icon, label, value, loading }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-7 w-7 text-brand-blue" />
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-brand-ink">{loading ? "..." : number(value, "0")}</p>
    </div>
  );
}

function RequestList({ data, loading, error, retry, isSuperAdmin, onDelete }) {
  if (loading) return <SkeletonGrid count={4} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data.length) return <EmptyState title="No buyer requests" description="Submitted buyer requirements will appear here." />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item) => (
        <article key={item._id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-brand-ink">{item.name || "Buyer request"}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.phone || "No phone"} | {item.location}</p>
            </div>
            <span className="rounded-full bg-brand-sky px-3 py-1 text-xs font-bold text-brand-blue">{item.requesterType || "Client"}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-brand-ink">{item.type || "Property"}</p>
          <p className="mt-2 text-sm text-slate-600">{currency(item.budget)} · {number(item.bedrooms)} bedrooms</p>
          <p className="mt-2 text-sm text-slate-500">{item.notes || "No notes"}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">{date(item.createdAt)}</p>
          {isSuperAdmin ? (
            <Button variant="danger" className="mt-4 min-h-10 w-full" onClick={() => onDelete(item)}>
              <Trash2 className="h-4 w-4" />
              Delete buyer request
            </Button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function SellRequestList({ data, loading, error, retry, onDelete }) {
  if (loading) return <SkeletonGrid count={4} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data.length) return <EmptyState title="No sell requests" description="Seller valuation requests will appear here." />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item) => (
        <article key={item._id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-brand-ink">{item.name}</h3>
              <p className="text-sm text-slate-500">{item.phone}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{item.status || "new"}</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{item.address}</p>
          <p className="mt-2 text-sm text-slate-600">{item.type} · {number(item.area)} sqm · {currency(item.price)}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">{date(item.createdAt)}</p>
          <Button variant="danger" className="mt-4 min-h-10 w-full" onClick={() => onDelete(item)}>
            <Trash2 className="h-4 w-4" />
            Delete sell request
          </Button>
        </article>
      ))}
    </div>
  );
}
