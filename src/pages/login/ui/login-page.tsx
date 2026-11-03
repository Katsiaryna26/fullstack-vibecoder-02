import { useState } from "react";
import { ArrowLeft, LoaderCircle, LogIn, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { signInWithPassword } from "@/features/auth/api/auth-api";

type LoginPageProps = {
  onSuccess: () => void;
};

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  async function handleLogin({ email, password }: LoginFormValues) {
    setErrorMessage(null);

    try {
      await signInWithPassword(email.trim(), password);
      onSuccess();
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <a className="login-back-link" href="/">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to inbox
        </a>

        <div className="login-heading">
          <div className="login-brand-mark" aria-hidden="true">
            <MessageCircle size={20} strokeWidth={2.5} />
          </div>
          <p className="eyebrow">Welcome back</p>
          <h1 id="login-title">Sign in to Relay</h1>
          <p>Use your workspace account to access the client inbox.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(handleLogin)} noValidate>
          <label className="login-field">
            <span>Email</span>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            {errors.email ? (
              <span className="login-field-error" id="login-email-error">
                {errors.email.message}
              </span>
            ) : null}
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "login-password-error" : undefined}
            />
            {errors.password ? (
              <span className="login-field-error" id="login-password-error">
                {errors.password.message}
              </span>
            ) : null}
          </label>

          {errorMessage ? (
            <p className="login-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="spin" size={17} /> : <LogIn size={17} />}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign in. Check your email and password and try again.";
}
