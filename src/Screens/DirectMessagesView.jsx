import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function DirectMessagesView({ user }) {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch user's existing conversations
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "directMessages"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(convList);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Open modal & fetch available teammates from Firestore
  const handleOpenUserList = async () => {
    setIsModalOpen(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== user?.uid); // Exclude yourself
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // 3. Start or select a conversation with a specific user
  const handleStartChat = async (selectedUser) => {
    setIsModalOpen(false);
    
    // Check if a conversation already exists
    const existing = conversations.find((c) =>
      c.participants?.includes(selectedUser.uid)
    );

    if (existing) {
      // Open existing conversation
      console.log("Opening existing conversation:", existing.id);
      return;
    }

    // Create a new direct message conversation document
    try {
      await addDoc(collection(db, "directMessages"), {
        participants: [user.uid, selectedUser.uid],
        recipientName: selectedUser.fullName || selectedUser.email,
        lastMessage: "Started a conversation",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar with New Message '+' button */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Direct messages</h1>
        <button
          onClick={handleOpenUserList}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white hover:bg-purple-700 cursor-pointer"
          title="New Direct Message"
        >
          +
        </button>
      </header>

      {/* Conversations List or Empty State */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center h-full px-6 text-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-2xl text-purple-600">
              ✉️
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              No conversations yet
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Start a direct message with a teammate.
            </p>
            <button
              onClick={handleOpenUserList}
              className="mt-4 rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 cursor-pointer"
            >
              Start a message
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {conv.recipientName || "Teammate"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-50">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teammates Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">New Message</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Select a teammate to chat with:</p>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {allUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No other users found.</p>
              ) : (
                allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u)}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left hover:bg-purple-50 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{u.fullName || "User"}</p>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}