import { BarChart3, Home, LogOut, Settings, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-brand-mist">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8">
          <p className="text-xl font-extrabold text-brand-blue">The First</p>
          <p className="text-xs font-semibold uppercase text-brand-red">Admin workspace</p>
        </div>
        <DashboardNav />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <h1 className="text-lg font-bold text-brand-ink">{user?.name} · {user?.role}</h1>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="mt-3 lg:hidden">
            <DashboardNav compact />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function DashboardNav({ compact = false }) {
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3, end: true },
    { to: "/dashboard/profile", label: "Profile", icon: User },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
    { to: "/", label: "Public site", icon: Home }
  ];

  return (
    <nav className={compact ? "flex gap-2 overflow-x-auto" : "flex flex-col gap-2"} aria-label="Dashboard navigation">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `inline-flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-brand-sky text-brand-blue" : "text-slate-600 hover:bg-slate-100"}`}>
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
