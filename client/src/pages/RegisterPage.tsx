import { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(email, password);
      // optionally redirect here
      navigate('/notes');
    } catch (err) {
      // error already handled in context
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h2>Sign up</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: "20px" }}
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
        <Link to="/login" style={{ display: "block", marginTop: "10px" }}>Log in</Link>
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
}