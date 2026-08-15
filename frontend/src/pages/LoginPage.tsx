import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

interface LoginForm {
  username: string;
  password: string;
}

function LoginPage() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement>,
  ): void {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);

      await loginUser(form);
      await refreshUser();
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message ||
            "Invalid username or password",
        );
      } else {
        setError(
          "Invalid username or password",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled =
    !form.username ||
    !form.password ||
    isSubmitting;

  return (
    <div className={styles.authPage}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <h2>Login</h2>
        <p className={styles.subtitle}>
          Welcome back 👋
        </p>

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoFocus
        />

        <div className={styles.passwordField}>
          <input
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="button"
            className={`${styles.passwordToggle} ${
              showPassword
                ? styles.active
                : ""
            }`}
            onClick={() =>
              setShowPassword((s) => !s)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            👁
          </button>
        </div>

        <button disabled={isDisabled}>
          {isSubmitting
            ? "Logging in..."
            : "Login"}
        </button>

        <p className={styles.authSwitch}>
          Don’t have an account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;