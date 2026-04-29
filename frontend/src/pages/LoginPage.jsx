import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { user, loading, setUser } = useAuth(); // auth loading
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Redirect only AFTER auth is resolved
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await loginUser(form);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = !form.username || !form.password || isSubmitting;

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="auth-subtitle">Welcome back 👋</p>

        {error && <p className="auth-error">{error}</p>}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoFocus
        />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <span
            className="password-toggle"
            onClick={() => setShowPassword((s) => !s)}
          >
            👁
          </span>
        </div>
        <button disabled={isDisabled}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;