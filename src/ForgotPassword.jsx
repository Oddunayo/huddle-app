import { useState } from 'react';

export default function ForgotPassword({ onBack, onVerificationSuccess }) {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleRequestCode = (e) => {
        e.preventDefault();
        if (!email) {
            setErrorMessage('Please enter your email address.');
            return;
        }
        setErrorMessage(null);
        console.log(`Requesting verification code for email: ${email}`);
        setStep('verify');
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        if (!code) {
            setErrorMessage('Please enter the verification code.');
            return;
        }
        setErrorMessage(null);
        console.log(`Verifying code: ${code}`);
        setSuccessMessage('Verification successful! You can now reset your password.');
        setTimeout(() => {
            onVerificationSuccess();
        }, 1500);
    };
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center space-y-6">
                <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
                    Back to Login
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                {successMessage && <p className="text-green-500">{successMessage}</p>}
                {step === 'email' && (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Request Verification Code
                        </button>
                    </form>
                )}
                {step === 'verify' && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter the verification code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Verify Code
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}