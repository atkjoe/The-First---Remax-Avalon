import { Bath, BedDouble, Eye, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "../../services/api";
import { currency, number } from "../../utils/format";

const fallbackImage = "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80";

export default function PropertyCard({ property }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <img
        src={assetUrl(property.image) || fallbackImage}
        alt={property.title || "Property"}
        className="h-52 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-lg font-bold text-brand-ink">{property.title || "Untitled property"}</h3>
            <p className="mt-1 text-sm font-semibold text-brand-blue">{currency(property.price)}</p>
          </div>
          <span className="rounded-full bg-brand-sky px-3 py-1 text-xs font-bold text-brand-blue">{property.type || "Property"}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />{number(property.beds)}</span>
          <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" />{number(property.baths)}</span>
          <span className="inline-flex items-center gap-1"><Ruler className="h-4 w-4" />{number(property.area)}</span>
        </div>
        <Link to={`/properties/${property._id}`} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-brand-ink hover:bg-slate-50">
          <Eye className="h-4 w-4" />
          View details
        </Link>
      </div>
    </article>
  );
}
