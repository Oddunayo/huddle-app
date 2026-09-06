import  { useState } from 'react'

function App() {
// Home page
const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {currentPage === 'home' && (
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold text-blue-500">huddle 💬</h1>
          <p className="text-gray-600">A medium to connect to teams in real time. Simple, fast and organised channel messaging platform.</p>

          <div className="flex flex-col gap-3">
            <button 
            onClick={() => setCurrentPage('register')}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Create an Account
          </button>
            <button 
            onClick={() => setCurrentPage('login')}
            className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </div>
        </div>
      )}
            {/* Placeholder for Authentication Forms */}
      {currentPage === 'register' && (
        <div>
          <p className="text-gray-600"> Registration form goes here </p>
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-sm text-blue-500 underline mt-4"
          >
           ⬅ Back to Home
          </button>
        </div>
      )}

      {currentPage === 'login' && (
        <div>
          <p className="text-gray-600"> Login form goes here </p>
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-sm text-blue-500 underline mt-4"
          >
           ⬅ Back to Home
          </button>
        </div>
      )}
    </div>
  )
}

export default App
