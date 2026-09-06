import { useState } from "react";
import "./index.css";
import AuthForm from "./AuthForm";
import SuccessScreen from "./successScreen";
import LoginForm from "./LoginForm";

function App() {
  // Home page
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {currentPage === "home" && (
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold text-blue-500">Huddle 💬</h1>
          <p className="text-gray-600">
            A medium to connect to teams in real time. Simple, fast and
            organised channel messaging platform.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setCurrentPage("register")}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
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
          onLoginSuccess={() => alert("Login successful! Redirecting to Main Huddle Interface...")}
        />
      )}
    </div>
  );
}

export default App;
