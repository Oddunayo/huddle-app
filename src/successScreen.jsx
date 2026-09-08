import { Check } from "lucide-react";

export default function SuccessScreen({ onContinue }) {
    return (
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm text-center space-y-6">
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 text-[#00D2D3]">
        <Check className="w-8 h-8 stroke-3" />
      </div>
                <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Account created!</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your account has been successfully created.
        </p>
      </div>
                <button
                    onClick={onContinue}
                    className="w-full bg-[#5C54E5] hover:bg-[#4B43D1] text-white font-semibold py-3.5 px-4 rounded-2xl transition duration-200 shadow-xs cursor-pointer"
                >
                    Continue to Sign in
                </button>
            </div>
    );
}