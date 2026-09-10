import { useState, useEffect } from "react";
import "./index.css";
import AuthForm from "./AuthForm";
import SuccessScreen from "./successScreen";
import LoginForm from "./LoginForm";
import ForgotPassword from "./ForgotPassword";
import ResetPasswordForm from "./ResetPasswordForm";
import { MessageSquare } from "lucide-react";
import Carousel from "./Components/Carousel";
import HomeScreen from "./Screens/HomeScreen";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically restore session across page reloads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          const fullName = userData.fullName || firebaseUser.displayName || "User";
          const initials = fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName,
            initials,
            ...userData,
          });
          setCurrentPage("channels");
        } catch (error) {
          console.error("Error restoring session:", error);
        }
      } else {
        setUser(null);
        setCurrentPage("home");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    const fullName = userData?.fullName || userData?.displayName || "User";
    const initials = fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    setUser({
      ...userData,
      fullName,
      initials,
    });
    setCurrentPage("channels");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentPage("home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5C54E5] border-t-transparent"></div>
      </div>
    );
  }

  // If logged in, display HomeScreen
  if (currentPage === "channels" && user) {
    return <HomeScreen user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {currentPage === "home" && (
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-sm text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6 fill-[#5C54E5] text-[#5C54E5]" />
            <h1 className="text-xl font-black tracking-wider text-gray-900">
              HUDDLE
            </h1>
          </div>

          <Carousel />

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to Huddle
            </h2>
            <p className="text-gray-500 text-sm">
              A simple way for teams to chat, collaborate, and get things done.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setCurrentPage("register")}
              className="w-full bg-[#5C54E5] hover:bg-[#4B43D1] text-white font-semibold py-3.5 px-4 rounded-2xl transition duration-200 cursor-pointer"
            >
              Create Account
            </button>
            <button
              onClick={() => setCurrentPage("login")}
              className="w-full bg-white border-2 border-[#5C54E5] hover:bg-purple-50 text-[#332AD5] font-semibold py-3.5 px-4 rounded-2xl transition duration-200 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {currentPage === "register" && (
        <AuthForm
          onBack={() => setCurrentPage("home")}
          onSuccess={() => setCurrentPage("success")}
          onLoginClick={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "success" && (
        <SuccessScreen onContinue={() => setCurrentPage("login")} />
      )}

      {currentPage === "login" && (
        <LoginForm
          onBack={() => setCurrentPage("home")}
          onRegisterClick={() => setCurrentPage("register")}
          onForgotPasswordClick={() => setCurrentPage("forgot-password")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === "forgot-password" && (
        <ForgotPassword
          onBack={() => setCurrentPage("login")}
          onVerificationSuccess={() => setCurrentPage("reset-password")}
        />
      )}

      {currentPage === "reset-password" && (
        <ResetPasswordForm onResetSuccess={() => setCurrentPage("login")} />
      )}
    </div>
  );
}

export default App;