import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

interface SignupForm {
  username: string;
  password: string;
  confirmPassword: string;
}

function SignupPage() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] =
    useState<SignupForm>({
      username: "",
      password: "",
      confirmPassword: "",
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

  const passwordsMatch =
    form.password &&
    form.confirmPassword
      ? form.password ===
        form.confirmPassword
      : true;

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> {
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

      await signupUser({
        username: form.username,
        password: form.password,
      });

      await refreshUser();
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "Signup failed",
        );
      } else {
        setError("Signup failed");
      }
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
    <div className={styles.authPage}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <h2>Sign Up</h2>

        <p className={styles.subtitle}>
          Create your account 🚀
        </p>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
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
          >
            👁
          </button>
        </div>

        <input
          name="confirmPassword"
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className={
            form.confirmPassword
              ? passwordsMatch
                ? styles.valid
                : styles.invalid
              : ""
          }
        />

        {form.confirmPassword &&
          !passwordsMatch && (
            <p
              className={
                styles.inputError
              }
            >
              Passwords do not match
            </p>
          )}

        <button disabled={isDisabled}>
          {isSubmitting
            ? "Creating..."
            : "Sign Up"}
        </button>

        <p className={styles.authSwitch}>
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;