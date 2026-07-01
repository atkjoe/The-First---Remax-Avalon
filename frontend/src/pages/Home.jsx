import { ArrowRight, Building2, Search, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PropertyCard from "../components/properties/PropertyCard.jsx";
import Button from "../components/ui/Button.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/ui/Status.jsx";
import { useAsync } from "../hooks/useAsync";
import { propertyService } from "../services/propertyService";

export default function Home() {
  const navigate = useNavigate();
  const { data, loading, error, run } = useAsync(propertyService.list, [], { initialData: [] });
  const properties = data || [];
  const featured = properties.slice(0, 3);

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(event.currentTarget));
    navigate(`/properties?${params.toString()}`);
  }

  return (
    <main className="mb-20">
      <section className="hero-photo">
        <div className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-20 text-white sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-white/80">The First · Remax Avalon</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">Find, sell, and manage real estate with clarity.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">A modern property experience for buyers, sellers, and the Avalon team.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/properties" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-brand-blue hover:bg-brand-sky">
              Browse properties <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/sell" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/70 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
              Sell your property
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-4">
          <select name="type" className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm">
            <option value="">Any type</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Studio</option>
            <option>Townhouse</option>
          </select>
          <select name="beds" className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm">
            <option value="">Any bedrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <input name="maxPrice" type="number" min="0" placeholder="Maximum budget" className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm" />
          <Button type="submit">
            <Search className="h-4 w-4" /> Search
          </Button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-brand-red">Featured</p>
            <h2 className="text-3xl font-extrabold text-brand-ink">Latest properties</h2>
          </div>
          <Link to="/properties" className="text-sm font-bold text-brand-blue hover:underline">View all properties</Link>
        </div>
        {loading ? <SkeletonGrid count={3} /> : error ? <ErrorState message={error} onRetry={run} /> : featured.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => <PropertyCard key={property._id} property={property} />)}
          </div>
        ) : <EmptyState title="No properties yet" description="Once the team adds listings, the best ones will appear here." />}
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Building2, title: "Property listings", text: "Search live listings from the backend." },
            { icon: ShieldCheck, title: "Team dashboard", text: "Protected admin workspace with role-aware access." },
            { icon: Search, title: "Requests pipeline", text: "Capture buyer and seller leads in one place." }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-lg border border-slate-200 p-5">
                <Icon className="h-7 w-7 text-brand-blue" />
                <h3 className="mt-4 font-bold text-brand-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
