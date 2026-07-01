import { Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/sell", label: "Sell" },
  { to: "/requests", label: "Buyer Request" }
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-brand-mist text-brand-ink relative flex flex-col " >
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="leading-tight" aria-label="The First Remax Avalon home">
            <span className="block text-lg font-extrabold text-brand-blue">The First</span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-brand-red">Remax Avalon</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-brand-sky text-brand-blue" : "text-slate-600 hover:bg-slate-100"}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              <User className="h-4 w-4" />
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          </div>

          <Button variant="ghost" className="h-10 w-10 px-0 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {open ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? "bg-brand-sky text-brand-blue" : "text-slate-600"}`}>
                  {item.label}
                </NavLink>
              ))}
              <Link to={isAuthenticated ? "/dashboard" : "/login"} onClick={() => setOpen(false)} className="rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white">
                {isAuthenticated ? "Dashboard" : "Login"}
              </Link>
            </div>
          </div>
        ) : null}
      </header>
         <main className="flex-1">
              <Outlet  /> 
          </main>
     

      <footer className="bg-brand-ink px-4 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold">The First</p>
            <p className="text-sm text-slate-300">Remax Avalon</p>
          </div>
          <p className="text-sm text-slate-300">© 2026 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
