import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const inputClassName =
  "w-full rounded-xl border border-[var(--slate-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--slate-surface-text)]";

const buttonClassName =
  "w-full rounded-xl bg-[var(--slate-surface-text)] text-[var(--slate-surface)] py-3 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      // error already handled in context
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center min-h-0 p-8">
      <div className="w-full max-w-sm text-left">
        <h2 className="text-3xl font-semibold tracking-tight">Login</h2>

        <p className="mt-2 text-sm text-[var(--slate-muted)]">Welcome back.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={buttonClassName}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <Link
          to="/register"
          className="block mt-6 text-sm text-[var(--slate-muted)] hover:text-[var(--slate-surface-text)] transition"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
