import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from "react-router-dom";


export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/home');
      // optionally redirect here
    } catch (err) {
      // error already handled in context
    }

  };

    return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 font-sans">
        <div className="w-full max-w-sm">
        
        <h2 className="text-3xl font-semibold tracking-tight">
            Login
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
            Welcome back.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            
            <div>
            <label className="block text-sm font-medium mb-2">
                Email
            </label>

            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-2">
                Password
            </label>

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
            </div>

            <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-black text-white py-3 text-sm font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50"
            >
            {isLoading ? "Logging in..." : "Login"}
            </button>
        </form>

        {error && (
            <p className="mt-4 text-sm text-red-500">
            {error}
            </p>
        )}

        <Link
            to="/register"
            className="block mt-6 text-sm text-neutral-500 hover:text-black transition"
        >
            Don&apos;t have an account? Sign up
        </Link>
        </div>
    </div>
    );
}