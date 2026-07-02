import { LogIn } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Login() {
  const [name, setName] = useState("");
  const [idCode, setIdCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !idCode.trim()) {
      setError("Name and ID are required.");
      return;
    }

    setLoading(true);
    try {
      await auth.login({ name: name.trim(), idCode: idCode.trim() });
      showToast("Welcome back.");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      const message = err.friendlyMessage || "Invalid login.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-145px)] min-w-0 items-center justify-center px-4 py-10">
      <section className="w-full max-w-md min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold uppercase text-brand-red">Team login</p>
        <h1 className="mt-2 break-words text-2xl font-extrabold leading-tight text-brand-ink sm:text-3xl">Access dashboard</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="username" required />
          <Input label="ID code" value={idCode} onChange={(event) => setIdCode(event.target.value)} autoComplete="current-password" required />
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </section>
    </main>
  );
}
