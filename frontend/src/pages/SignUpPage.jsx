import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect after auth is resolved
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const passwordsMatch =
    form.password && form.confirmPassword
      ? form.password === form.confirmPassword
      : true;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create user + session
      await signupUser({
        username: form.username,
        password: form.password,
      });

      // 2. Sync AuthContext
      await refreshUser();

      // ❌ no navigate here

    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled =
    !form.username ||
    !form.password ||
    !form.confirmPassword ||
    !passwordsMatch ||
    isSubmitting;

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <p className="auth-subtitle">Create your account 🚀</p>

        {error && <p className="auth-error">{error}</p>}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoFocus
        />

        {/* Password */}
        <div className="password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <span
            className={`password-toggle ${showPassword ? "active" : ""}`}
            onClick={() => setShowPassword((s) => !s)}
          >
            👁
          </span>
        </div>

        {/* Confirm Password */}
        <input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className={
            form.confirmPassword
              ? passwordsMatch
                ? "valid"
                : "invalid"
              : ""
          }
        />

        {form.confirmPassword && !passwordsMatch && (
          <p className="input-error">Passwords do not match</p>
        )}

        <button disabled={isDisabled}>
          {isSubmitting ? "Creating..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;