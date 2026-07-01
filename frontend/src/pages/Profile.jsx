import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user } = useAuth();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase text-brand-red">Profile</p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-ink">{user?.name}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Role</p>
          <p className="mt-1 font-bold text-brand-ink">{user?.role}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Access</p>
          <p className="mt-1 font-bold text-brand-ink">{user?.role === "superadmin" ? "Full dashboard access" : "Admin dashboard access"}</p>
        </div>
      </div>
    </section>
  );
}
