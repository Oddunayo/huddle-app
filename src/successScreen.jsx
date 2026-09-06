export default function SuccessScreen({ onContinue }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl" >
                    🎈🎉
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-800">Account Created Successfully! 🎉</h2>
                <p className="text-gray-600">Your account creation is successful. You can now log in and start collaborating with your team on Huddle.</p>
                <button
                    onClick={onContinue}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                    Continue to Login
                </button>
            </div>
        </div>
    );
}