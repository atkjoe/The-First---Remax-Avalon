import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/properties/PropertyCard.jsx";
import Button from "../components/ui/Button.jsx";
import { Input, Select } from "../components/ui/Input.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/ui/Status.jsx";
import { useAsync } from "../hooks/useAsync";
import { propertyService } from "../services/propertyService";
import { pageCount, paginate } from "../utils/filter";

const perPage = 6;

export default function Properties() {
  const [params] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: "",
    type: params.get("type") || "",
    beds: params.get("beds") || "",
    maxPrice: params.get("maxPrice") || "",
    sort: "newest"
  });
  const { data, loading, error, run } = useAsync(propertyService.list, [], { initialData: [] });
  const properties = data || [];

  function update(field, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const filtered = useMemo(() => {
    return [...properties]
      .filter((property) => {
        const matchesSearch = !filters.q || property.title?.toLowerCase().includes(filters.q.toLowerCase()) || property.type?.toLowerCase().includes(filters.q.toLowerCase());
        const matchesType = !filters.type || property.type === filters.type;
        const matchesBeds = !filters.beds || Number(property.beds || 0) >= Number(filters.beds);
        const matchesPrice = !filters.maxPrice || Number(property.price || 0) <= Number(filters.maxPrice);
        return matchesSearch && matchesType && matchesBeds && matchesPrice;
      })
      .sort((a, b) => {
        if (filters.sort === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
        if (filters.sort === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
        if (filters.sort === "area-desc") return Number(b.area || 0) - Number(a.area || 0);
        return String(b._id).localeCompare(String(a._id));
      });
  }, [filters, properties]);

  const pages = pageCount(filtered, perPage);
  const visible = paginate(filtered, Math.min(page, pages), perPage);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-brand-red">Properties</p>
        <h1 className="text-3xl font-extrabold text-brand-ink">Find your next property</h1>
      </div>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-ink">
          <SlidersHorizontal className="h-4 w-4" />
          Search and filters
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input label="Search" value={filters.q} onChange={(event) => update("q", event.target.value)} placeholder="Title or type" />
          <Select label="Type" value={filters.type} onChange={(event) => update("type", event.target.value)}>
            <option value="">All</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Studio</option>
            <option>Townhouse</option>
          </Select>
          <Select label="Bedrooms" value={filters.beds} onChange={(event) => update("beds", event.target.value)}>
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </Select>
          <Input label="Max price" type="number" min="0" value={filters.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} />
          <Select label="Sort" value={filters.sort} onChange={(event) => update("sort", event.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
            <option value="area-desc">Largest area</option>
          </Select>
        </div>
      </section>

      {loading ? <SkeletonGrid /> : error ? <ErrorState message={error} onRetry={run} /> : visible.length ? (
        <>
          <div className="mb-4 text-sm text-slate-600">Showing {visible.length} of {filtered.length} properties</div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((property) => <PropertyCard key={property._id} property={property} />)}
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button>
            <span className="text-sm font-semibold text-slate-600">Page {Math.min(page, pages)} of {pages}</span>
            <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </>
      ) : <EmptyState title="No matching properties" description="Try adjusting the filters or search terms." />}
    </main>
  );
}
