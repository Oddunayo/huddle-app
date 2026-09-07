import { useState } from "react";
import "./index.css";
import AuthForm from "./AuthForm";
import SuccessScreen from "./successScreen";
import LoginForm from "./LoginForm"
import ForgotPassword from "./ForgotPassword";
import ResetPasswordForm from "./ResetPasswordForm";
import {MessagesSquare} from "lucide-react"
import Carousel from "./Carousel";

function App() {
  // Home page
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {currentPage === "home" && (
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <MessagesSquare className="w-8 h-8 text-blue-500" strokeWidth={2.5}/>
             <h1 className="text-3xl font-bold text-gray-900">HUDDLE</h1>
          </div>

          <Carousel />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Huddle</h2>
            <p className="text-gray-500 text-sm px-2">
              A simple way for teams to chat, collaborate, and get things done.
             </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setCurrentPage("register")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Create an Account
            </button>
            <button
              onClick={() => setCurrentPage("login")}
              className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
      {/* Placeholder for Authentication Forms */}
      {currentPage === "register" && (
        <AuthForm
          onBack={() => setCurrentPage("home")}
          onSuccess={() => setCurrentPage("success")}
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
          onLoginSuccess={() => setCurrentPage("channels")}
        />
      )}

      {currentPage === "forgot-password" && (
        <ForgotPassword
          onBack={() => setCurrentPage("login")}
          onVerificationSuccess={() => setCurrentPage("reset-password")}
        />
      )}

      {currentPage === "reset-password" && (
        <ResetPasswordForm
          onResetSuccess={() => setCurrentPage("login")}
        />
      )}
    </div>
  );
}

export default App;
