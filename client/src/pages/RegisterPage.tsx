import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  borderColor?: string;
  focusColor?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
  error?: string;
  submitted: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  borderColor = "border-indigo-200",
  focusColor = "focus:border-indigo-500",
  value,
  onChange,
  showPassword = false,
  toggleShowPassword,
  error,
  submitted,
}) => {
  const errorClass =
    "block min-h-[1rem] text-xs mt-1 transition-all duration-200";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {type === "password" ? (
        <div className="relative">
          <input
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-transparent px-2 py-1.5 border-b-2 ${borderColor} ${focusColor}
                       outline-none transition-colors duration-300 placeholder:text-gray-400 pr-14`}
            autoComplete="new-password"
          />
          {toggleShowPassword && (
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-medium
                         text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-transparent px-2 py-1.5 border-b-2 ${borderColor} ${focusColor}
                     outline-none transition-colors duration-300 placeholder:text-gray-400`}
        />
      )}
      <span
        className={`${errorClass} ${
          submitted && error ? "text-red-500" : "text-transparent"
        }`}
      >
        {error || "\u200b"}
      </span>
    </div>
  );
};

interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.username.trim()) errs.username = "Username is required.";
    else if (form.username.length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
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
      const res = await registerApi({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      
      // Backend vraća { success, message, data }
      if (res.data.success && res.data.data) {
        const authData = res.data.data;
        login({
          token: authData.token,
          userId: String(authData.id),
          email: authData.email,
          role: authData.role,
          firstName: authData.firstName,
          lastName: authData.lastName,
          username: authData.username,
        });
        navigate("/travels");
      } else {
        setServerError(res.data.message || "Registration failed.");
      }
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100 px-4 py-10">
      <div className="w-full max-w-2xl mx-auto rounded-3xl p-8 bg-white/95 backdrop-blur-sm shadow-2xl border border-purple-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Fill in your details to get started
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"
        >
          <InputField
            name="firstName"
            label="First Name"
            placeholder="Name"
            borderColor="border-cyan-200"
            focusColor="focus:border-cyan-500"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
            submitted={submitted}
          />
          <InputField
            name="lastName"
            label="Last Name"
            placeholder="Last Name"
            borderColor="border-cyan-200"
            focusColor="focus:border-cyan-500"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
            submitted={submitted}
          />

          <InputField
            name="username"
            label="Username"
            placeholder="Username"
            borderColor="border-emerald-200"
            focusColor="focus:border-emerald-500"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            submitted={submitted}
          />
          <InputField
            name="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            submitted={submitted}
          />

          <div className="md:col-span-2">
            <InputField
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              showPassword={showPassword}
              toggleShowPassword={() => setShowPassword(!showPassword)}
              error={errors.password}
              submitted={submitted}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500
                         hover:from-violet-600 hover:to-indigo-600
                         text-white rounded-xl py-3 font-semibold
                         transition-all duration-300 transform hover:scale-[1.01]
                         disabled:opacity-70 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl cursor-pointer"
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-sm mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};