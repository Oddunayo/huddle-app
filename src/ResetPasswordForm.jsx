import {useState} from "react";
import { InputField } from './InputField';

export default function ResetPasswordForm({ onResetSuccess }) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const validatePassword = (password) => {
   if (!password) return false;
   if (password.length < 8) return "password must be at least 8 characters long.";
   if (!/[A-Z]/.test(password)) return "password must contain at least one uppercase letter.";
   if (!/[a-z]/.test(password)) return "password must contain at least one lowercase letter.";
   if (!/[0-9]/.test(password)) return "password must contain at least one number.";
   if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "password must contain at least one special character.";
   return null;
  }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!formData.password || !formData.confirmPassword) {
            setErrorMessage('Please fill in all fields.');
            return;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setErrorMessage(passwordError);
            return;
        }
        setSuccessMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
            if (onResetSuccess) {
                onResetSuccess();
            }
        }, 3000);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Create a New Password 🔑
                </h2>
                <p className="text-gray-600 text-center">
                    Please enter your new password below.
                </p>
                {errorMessage && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="....."
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="....."
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Create New Password
                    </button>
                </form>
            </div>
        </div>
    );
}