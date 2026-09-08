import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { InputField } from './InputField';

export default function ResetPasswordForm({ onResetSuccess }) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordValid = Object.values(checks).every(Boolean);
  const passwordsMatch =
    formData.password !== '' && formData.password === formData.confirmPassword;
  const isFormValid = isPasswordValid && passwordsMatch;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (onResetSuccess) {
        onResetSuccess();
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-sm text-left space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Create new password</h2>
        <p className="text-gray-500 text-sm">
          Your new password must be different from previous passwords.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <InputField
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Min. 8 chars, A-Z, 0-9, !@#..."
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 flex items-center"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Confirm Password */}
        <InputField
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Re-enter new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          required
          icon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 flex items-center"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {formData.confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
        )}

        {/* Password Requirements Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-semibold tracking-wider text-gray-400 uppercase text-[10px]">
            Password Requirements
          </p>
          <ul className="space-y-1">
            <li className={`flex items-center gap-2 ${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{checks.length ? '✓' : '•'}</span> 8+ characters
            </li>
            <li className={`flex items-center gap-2 ${checks.upper ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{checks.upper ? '✓' : '•'}</span> Uppercase (A-Z)
            </li>
            <li className={`flex items-center gap-2 ${checks.lower ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{checks.lower ? '✓' : '•'}</span> Lowercase (a-z)
            </li>
            <li className={`flex items-center gap-2 ${checks.number ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{checks.number ? '✓' : '•'}</span> Number (0-9)
            </li>
            <li className={`flex items-center gap-2 ${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{checks.special ? '✓' : '•'}</span> Special (!@#...)
            </li>
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full font-semibold py-3.5 px-4 rounded-full transition duration-200 mt-2 flex items-center justify-center gap-2 ${
            isFormValid && !isLoading
              ? 'bg-[#5C54E5] hover:bg-[#4B43D1] text-white cursor-pointer shadow-xs'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}