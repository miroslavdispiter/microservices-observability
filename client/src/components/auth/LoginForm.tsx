import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FormInput } from "./FormInput";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/travels", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    return errs;
  };

  const errors = validate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/travels");
    } catch (err: any) {
      setServerError(err?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state dok se proverava autentifikacija
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100 px-4">
      <div className="w-full max-w-md mx-auto rounded-3xl p-8 bg-white/95 backdrop-blur-sm shadow-2xl border border-purple-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            submitted={submitted}
            autoComplete="email"
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
            error={errors.password}
            submitted={submitted}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-500
                       hover:from-violet-600 hover:to-indigo-600
                       text-white rounded-xl py-3 font-semibold
                       transition-all duration-300 transform hover:scale-[1.02]
                       disabled:opacity-70 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-xl cursor-pointer mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};