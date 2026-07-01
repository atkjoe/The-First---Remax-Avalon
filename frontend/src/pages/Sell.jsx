import SellRequestForm from "../components/forms/SellRequestForm.jsx";

export default function Sell() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 mt-20">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-brand-red">Sell</p>
        <h1 className="text-3xl font-extrabold text-brand-ink">Request a property valuation</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Share your property details and the team will follow up with you.</p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SellRequestForm />
      </section>
    </main>
  );
}
