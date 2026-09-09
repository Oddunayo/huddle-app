import { useState } from 'react';
import { ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { InputField } from './Components/InputField';

export default function ForgotPassword({ onBack, onVerificationSuccess }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = (e) => {
    e.preventDefault();
    if (!email) return;
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      setSuccessMessage('A reset code has been sent to your email.');
    }, 1200);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!code) return;
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Code verified! Redirecting...');
      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-sm text-left space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to sign in</span>
      </button>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Reset password</h2>
        <p className="text-gray-500 text-sm">
          {step === 'email'
            ? "Enter your email address and we'll send you a reset code."
            : `Enter the verification code sent to ${email}`}
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Success Notification using CheckCircle2 */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700 border border-green-100">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Step 1: Request Email */}
      {step === 'email' && (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="you@team.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            error={errorMessage}
          />

          <button
            type="submit"
            disabled={!email.trim() || isLoading}
            className={`w-full font-semibold py-3.5 px-4 rounded-full transition duration-200 mt-2 flex items-center justify-center gap-2 ${
              email.trim() && !isLoading
                ? 'bg-[#5C54E5] hover:bg-[#4B43D1] text-white cursor-pointer shadow-xs'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              'Send reset code'
            )}
          </button>
        </form>
      )}

      {/* Step 2: Verify Code */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <InputField
            label="Verification Code"
            type="text"
            name="code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            required
            icon={<KeyRound className="w-4 h-4 text-gray-400" />}
          />

          <button
            type="submit"
            disabled={!code.trim() || isLoading}
            className={`w-full font-semibold py-3.5 px-4 rounded-full transition duration-200 mt-2 flex items-center justify-center gap-2 ${
              code.trim() && !isLoading
                ? 'bg-[#5C54E5] hover:bg-[#4B43D1] text-white cursor-pointer shadow-xs'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          <p className="text-center text-xs text-gray-500 pt-1">
            Didn't receive a code?{' '}
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setSuccessMessage(null);
              }}
              className="text-[#5C54E5] font-semibold hover:underline cursor-pointer"
            >
              Resend
            </button>
          </p>
        </form>
      )}
    </div>
  );
}