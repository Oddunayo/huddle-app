import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { InputField } from "./InputField";

export default function LoginForm({
  onRegisterClick,
  onLoginSuccess,
  onForgotPasswordClick,
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setErrorMessage("");
    setFieldErrors({ email: "", password: "" });
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      /* if (formData.email !== "user@team.com") {
        setFieldErrors({
          email: "Invalid email address or account not found.",
          password: "Incorrect password. Please try again.",
        });
        return;
      } */

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-sm text-left space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-500 text-sm">Sign in to your account.</p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field with Error */}
        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="you@team.com"
          error={fieldErrors.email}
          required
        />

        {/* Password Field with Error */}
        <div>
          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="......."
            error={fieldErrors.password}
            required
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs text-[#5C54E5] font-semibold hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full font-semibold py-3.5 px-4 rounded-full transition duration-200 mt-2 flex items-center justify-center gap-2 ${
            isFormValid && !isLoading
              ? "bg-[#5C54E5] hover:bg-[#4B43D1] text-white cursor-pointer shadow-xs"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <p className="text-center text-xs text-gray-500 pt-1">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-[#5C54E5] font-semibold hover:underline cursor-pointer"
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  );
}