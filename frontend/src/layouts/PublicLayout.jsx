import { Clock, Mail, MapPin, Menu, MessageCircle, Phone, User, X } from "lucide-react";
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

const advisorContacts = [
  { name: "Youssef", phone: "01020801467", whatsapp: "https://wtsi.me/201020801467" },
  { name: "Mostafa", phone: "+20 108 0069523", whatsapp: "https://wh.ms/201080069523" },
  { name: "Rahma", phone: "01031320203", whatsapp: "https://wa.me/201031320203" }
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
     

      <footer className="bg-brand-ink px-4 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_1.3fr_0.8fr]">
          <div>
            <p className="text-xl font-extrabold text-white">The First</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-red">Remax Avalon</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">Real estate guidance for buyers and sellers, with every listing connected to the Avalon advisor who posted it.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <Clock className="h-4 w-4 text-brand-red" />
              Viewings by appointment
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Advisor contacts</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {advisorContacts.map((advisor) => (
                <div key={advisor.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="font-bold text-white">{advisor.name}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                    <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${advisor.phone.replace(/\s/g, "")}`}>
                      <Phone className="h-4 w-4 text-brand-red" /> {advisor.phone}
                    </a>
                    <a className="inline-flex items-center gap-2 hover:text-white" href={advisor.whatsapp}>
                      <MessageCircle className="h-4 w-4 text-brand-red" /> WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">Office</h2>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-300"><MapPin className="mt-0.5 h-4 w-4 flex-none text-brand-red" /> Remax Avalon team, Egypt</p>
            <a className="mt-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white" href="mailto:info@thefirst-remaxavalon.com"><Mail className="h-4 w-4 text-brand-red" /> info@thefirst-remaxavalon.com</a>
            <p className="mt-6 text-sm text-slate-400">(c) 2026 The First - Remax Avalon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
