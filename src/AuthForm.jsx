import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { InputField } from "./Components/InputField";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export default function AuthForm({ onBack, onSuccess, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    isPasswordValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const allValid = Object.values(checks).every(Boolean);
    if (!allValid) {
      setErrorMessage("Please fulfill all password requirements.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // 2. Save user profile document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName: formData.name,
        email: formData.email,
        status: "Online",
        createdAt: new Date().toISOString()
      });

      const nameToUse = formData.name || "";
      const nameParts = nameToUse.trim().split(" ");
      const userInitials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameToUse.substring(0, 2). toUpperCase();

      if (onSuccess) {
        onSuccess({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: formData.name,
          fullName: formData.name,
          initials: userInitials,
      });
      }
    } catch (error) {
      setErrorMessage(error.message.replace("Firebase: ", ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-sm text-left space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="text-gray-500 text-sm">Join your team on Huddle.</p>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Full name"
          type="text"
          name="name"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          placeholder="you@team.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />

        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
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
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs space-y-2">
          <p className="font-semibold tracking-wider text-gray-400 uppercase text-[10px]">
            Password Requirements
          </p>
          <ul className="space-y-1">
            <li
              className={`flex items-center gap-2 ${checks.length ? "text-green-600" : "text-gray-400"}`}
            >
              <span>{checks.length ? "✓" : "•"}</span> 8+ characters
            </li>
            <li
              className={`flex items-center gap-2 ${checks.upper ? "text-green-600" : "text-gray-400"}`}
            >
              <span>{checks.upper ? "✓" : "•"}</span> Uppercase (A-Z)
            </li>
            <li
              className={`flex items-center gap-2 ${checks.lower ? "text-green-600" : "text-gray-400"}`}
            >
              <span>{checks.lower ? "✓" : "•"}</span> Lowercase (a-z)
            </li>
            <li
              className={`flex items-center gap-2 ${checks.number ? "text-green-600" : "text-gray-400"}`}
            >
              <span>{checks.number ? "✓" : "•"}</span> Number (0-9)
            </li>
            <li
              className={`flex items-center gap-2 ${checks.special ? "text-green-600" : "text-gray-400"}`}
            >
              <span>{checks.special ? "✓" : "•"}</span> Special (!@#...)
            </li>
          </ul>
        </div>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full font-semibold py-3.5 px-4 rounded-full transition duration-200 mt-2 ${
            isFormValid && !isLoading
              ? "bg-[#5C54E5] hover:bg-[#4B43D1] text-white cursor-pointer shadow-xs"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-xs text-gray-500 pt-1">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLoginClick || onBack}
            className="text-[#5C54E5] font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
