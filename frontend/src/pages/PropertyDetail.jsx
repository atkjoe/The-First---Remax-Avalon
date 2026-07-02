import { Bath, BedDouble, MessageCircle, NotebookText, Phone, Ruler, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/ui/Status.jsx";
import { useAsync } from "../hooks/useAsync";
import { assetUrl } from "../services/api";
import { propertyService } from "../services/propertyService";
import { currency, number } from "../utils/format";

const fallbackImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

export default function PropertyDetail() {
  const { id } = useParams();
  const { data, loading, error, run } = useAsync(propertyService.list, [], { initialData: [] });
  const properties = data || [];
  const property = properties.find((item) => item._id === id);
  const phoneHref = property?.contactPhone ? `tel:${property.contactPhone.replace(/\s/g, "")}` : "";

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-10"><SkeletonGrid count={1} /></main>;
  if (error) return <main className="mx-auto max-w-7xl px-4 py-10"><ErrorState message={error} onRetry={run} /></main>;
  if (!property) return <main className="mx-auto max-w-7xl px-4 py-10"><EmptyState title="Property not found" description="This listing may have been removed." action={<Link className="font-bold text-brand-blue" to="/properties">Back to properties</Link>} /></main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <img src={assetUrl(property.image) || fallbackImage} alt={property.title} className="h-[420px] w-full rounded-lg object-cover shadow-soft" />
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <span className="rounded-full bg-brand-sky px-3 py-1 text-xs font-bold text-brand-blue">{property.type}</span>
          <h1 className="mt-4 text-3xl font-extrabold text-brand-ink">{property.title}</h1>
          <p className="mt-2 text-2xl font-extrabold text-brand-blue">{currency(property.price)}</p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-slate-600">
            <span className="rounded-lg bg-slate-50 p-3"><BedDouble className="mb-2 h-5 w-5 text-brand-blue" />{number(property.beds)} beds</span>
            <span className="rounded-lg bg-slate-50 p-3"><Bath className="mb-2 h-5 w-5 text-brand-blue" />{number(property.baths)} baths</span>
            <span className="rounded-lg bg-slate-50 p-3"><Ruler className="mb-2 h-5 w-5 text-brand-blue" />{number(property.area)} sqm</span>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-bold text-brand-ink"><UserRound className="h-4 w-4 text-brand-blue" /> Listed by</div>
              <p className="mt-1">{property.listedBy || "The First team"}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-bold text-brand-ink"><NotebookText className="h-4 w-4 text-brand-blue" /> Apartment notes</div>
              <p className="mt-1 leading-6">{property.notes || "Contact the listing admin for viewing times, availability, and negotiation details."}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button disabled={!phoneHref} onClick={() => { if (phoneHref) window.location.href = phoneHref; }}><Phone className="h-4 w-4" /> {property.contactPhone || "Call"}</Button>
            <a href={property.contactWhatsapp || "#"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
