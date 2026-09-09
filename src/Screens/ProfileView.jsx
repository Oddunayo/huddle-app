export default function ProfileView({ user, onLogout }) {
  const name = user?.fullName || "Jane Doe";
  const initials = user?.initials || "JD";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">You</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0CC8D4] text-xs font-bold text-white">
          {initials}
        </div>
      </header>

      {/* Profile Content Area */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        {/* Large Avatar Circle with Online Dot */}
        <div className="relative mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0CC8D4] text-2xl font-bold text-white shadow-sm">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-[#0CC8D4]"></span>
        </div>

        {/* User Name & Status */}
        <h2 className="text-xl font-bold text-gray-900">{name}</h2>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-[#0CC8D4]">
          <span className="text-xs">●</span>
          <span>Online</span>
        </div>

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          className="mt-8 rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
