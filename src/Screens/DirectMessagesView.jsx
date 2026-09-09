export default function DirectMessagesView({ user }) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Direct messages</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
          {user?.initials || "JD"}
        </div>
      </header>

      {/* Empty State Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-2xl text-purple-600">
          ✉️
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          No conversations yet
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Start a direct message with a teammate.
        </p>
      </div>
    </div>
  );
}
