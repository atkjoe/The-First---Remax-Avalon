import { Building2, Plus, Search, Trash2, Users } from "lucide-react";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [requestType, setRequestType] = useState("");
  const stats = useAsync(dashboardService.stats, []);
  const properties = useAsync(propertyService.list, [], { initialData: [] });
  const requests = useAsync(requestService.list, [], { initialData: [] });
  const sellRequests = useAsync(sellRequestService.list, [], { immediate: isSuperAdmin, initialData: [] });

  const filteredRequests = useMemo(() => {
    return (requests.data || []).filter((item) => {
      const text = `${item.location} ${item.type} ${item.notes}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase())) && (!requestType || item.type === requestType);
    });
  }, [query, requestType, requests.data]);

  function handleDestructiveDemo() {
    showToast("The backend does not expose delete endpoints yet, so no records were removed.", "info");
    setConfirmOpen(false);
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Building2} label="Properties" value={stats.data?.properties} loading={stats.loading} />
        <Stat icon={Users} label="Buyer requests" value={stats.data?.requests} loading={stats.loading} />
        <Stat icon={Search} label="Sell requests" value={stats.data?.sell} loading={stats.loading} />
      </section>

      {stats.error ? <ErrorState message={stats.error} onRetry={stats.run} /> : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-brand-ink">Properties</h2>
            <p className="text-sm text-slate-500">Uses GET and protected POST /api/properties.</p>
          </div>
          <Button onClick={() => setPropertyModal(true)}>
            <Plus className="h-4 w-4" />
            Add property
          </Button>
        </div>
        {properties.loading ? <SkeletonGrid count={3} /> : properties.error ? <ErrorState message={properties.error} onRetry={properties.run} /> : properties.data?.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {properties.data.slice(0, 6).map((property) => <PropertyCard key={property._id} property={property} />)}
          </div>
        ) : <EmptyState title="No properties yet" description="Create the first listing with an image upload." />}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-brand-ink">Buyer requests</h2>
            <p className="text-sm text-slate-500">Protected GET /api/requests plus public submission page.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
            <Input label="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Select label="Type" value={requestType} onChange={(event) => setRequestType(event.target.value)}>
              <option value="">All</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Studio</option>
              <option>Townhouse</option>
            </Select>
          </div>
        </div>
        <RequestList data={filteredRequests} loading={requests.loading} error={requests.error} retry={requests.run} />
      </section>

      {isSuperAdmin ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-brand-ink">Sell requests</h2>
              <p className="text-sm text-slate-500">Superadmin-only GET /api/sell-requests.</p>
            </div>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Clear demo
            </Button>
          </div>
          <SellRequestList data={sellRequests.data || []} loading={sellRequests.loading} error={sellRequests.error} retry={sellRequests.run} />
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
      <ConfirmDialog open={confirmOpen} title="Confirm action" message="This app asks before destructive actions. The current backend has no delete API, so this is a safe confirmation example." onClose={() => setConfirmOpen(false)} onConfirm={handleDestructiveDemo} />
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

function RequestList({ data, loading, error, retry }) {
  if (loading) return <SkeletonGrid count={4} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data.length) return <EmptyState title="No buyer requests" description="Submitted buyer requirements will appear here." />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item) => (
        <article key={item._id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-brand-ink">{item.location}</h3>
            <span className="rounded-full bg-brand-sky px-3 py-1 text-xs font-bold text-brand-blue">{item.type}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{currency(item.budget)} · {number(item.bedrooms)} bedrooms</p>
          <p className="mt-2 text-sm text-slate-500">{item.notes || "No notes"}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">{date(item.createdAt)}</p>
        </article>
      ))}
    </div>
  );
}

function SellRequestList({ data, loading, error, retry }) {
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
        </article>
      ))}
    </div>
  );
}
