import { useState } from "react";
export default function CreateChannelModal({
  isOpen,
  onClose,
  onCreateChannel,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Channel name is required.");
      return;
    }

    // Return created channel object back to parent handler
    onCreateChannel({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name: name.trim().toLowerCase(),
      description: description.trim(),
      lastMessage: "Channel created",
      unread: false,
    });

    // Reset and dismiss modal
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl transition-all">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Create a channel
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. announcements"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-purple-500"
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description{" "}
              <span className="text-xs text-gray-400 font-normal">
                (Optional)
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
