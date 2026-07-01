import RequestForm from "../components/forms/RequestForm.jsx";

export default function Requests() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-brand-red">Buyer request</p>
        <h1 className="text-3xl font-extrabold text-brand-ink">Tell us what you are looking for</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Submit a buying requirement. Admins can review all requests in the protected dashboard.</p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <RequestForm />
      </section>
    </main>
  );
}
