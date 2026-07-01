export default function Button({ children, variant = "primary", className = "", type = "button", ...props }) {
  const variants = {
    primary: "bg-brand-blue text-white hover:bg-blue-800 focus:ring-brand-blue",
    secondary: "bg-white text-brand-ink border border-slate-200 hover:bg-slate-50 focus:ring-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-brand-ink hover:bg-slate-100 focus:ring-slate-300"
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
