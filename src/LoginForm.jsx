import { useState } from "react";
import { InputField } from "./InputField";

export default function LoginForm({
  onBack,
  onRegisterClick,
  onLoginSuccess,
  onForgotPasswordClick,
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // Simple validation (will replace with actual authentication logic)
    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    console.log('Login submitted:', formData);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
      onLoginSuccess();
    }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <button onClick={onBack} className="text-sm text-blue-500 hover:underline mb-4">
          ← Back
        </button>
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Welcome Back! Please Log In ✔
        </h2>

        {errorMessage && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Enter your email"
          required
          />

        <InputField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        disabled={isLoading}
        placeholder="......."
        required
        />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
            'Login'
          )}
          </button>
          <button
        type="button"
        onClick={onForgotPasswordClick}
        className="text-blue-500 hover:underline"
        >
          Forgot Password?
        </button>
        </form>
        
        <div className="mt-6 text-center text-sm *:text-gray-600">
            Don't have an account?{" "}
            <button onClick={onRegisterClick} className="text-blue-500 hover:underline">
              Sign up to create an account
            </button>
        </div>
      </div>
    </div>
  );
}