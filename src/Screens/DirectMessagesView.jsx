import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "🚀", "🙌", "✨"];

export default function DirectMessagesView({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Fetch conversations where current user is a participant
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

  // 2. Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConv?.id || !user?.uid) return;

    const q = query(
      collection(db, "directMessages", selectedConv.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isSelf: data.senderId === user?.uid,
          timeString: data.timestamp?.toDate
            ? data.timestamp.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just now",
        };
      });
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [selectedConv?.id, user?.uid]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Fetch teammates for new chat modal
  const handleOpenUserList = async () => {
    setIsModalOpen(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== user?.uid);
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleStartChat = async (selectedUser) => {
    setIsModalOpen(false);
    const existing = conversations.find((c) =>
      c.participants?.includes(selectedUser.uid)
    );

    if (existing) {
      setSelectedConv(existing);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "directMessages"), {
        participants: [user.uid, selectedUser.uid],
        participantNames: {
          [user.uid]: user.fullName || user.displayName || "Teammate",
          [selectedUser.uid]: selectedUser.fullName || selectedUser.email || "Teammate",
        },
        lastMessage: "Started a conversation",
        updatedAt: serverTimestamp(),
      });

      setSelectedConv({
        id: docRef.id,
        participants: [user.uid, selectedUser.uid],
        participantNames: {
          [user.uid]: user.fullName || user.displayName || "Teammate",
          [selectedUser.uid]: selectedUser.fullName || selectedUser.email || "Teammate",
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedConv?.id) return;

    const messageText = text.trim();
    setText("");
    setShowEmojiPicker(false);

    try {
      // Add message to subcollection
      await addDoc(
        collection(db, "directMessages", selectedConv.id, "messages"),
        {
          senderId: user?.uid,
          senderName: user?.fullName || user?.displayName || "User",
          text: messageText,
          timestamp: serverTimestamp(),
        }
      );

      // Update last message preview on parent conversation doc
      const convRef = doc(db, "directMessages", selectedConv.id);
      await updateDoc(convRef, {
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending DM:", error);
    }
  };

  // Active DM View
  if (selectedConv) {
    return (
      <div className="flex h-dvh min-h-0 flex-col bg-white overflow-hidden">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shrink-0 z-40">
          <button
            onClick={() => setSelectedConv(null)}
            className="rounded-full p-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            ←
          </button>
          <h1 className="font-bold text-gray-900">
            {selectedConv.participantNames
              ? Object.entries(selectedConv.participantNames).find(([uid]) => uid !== user?.uid)?.[1] || "Teammate"
              : selectedConv.recipientName || "Teammate"}
          </h1>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-gray-400">
              <p className="text-sm">This is the start of your direct message history.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {msg.timeString}
                  </span>
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    msg.isSelf
                      ? "bg-purple-100 text-purple-950 rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="relative shrink-0 border-t border-gray-200 bg-white">
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-4 z-10 flex gap-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 text-lg hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-gray-200 p-3 bg-white"
          >
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              😊
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Send a direct message..."
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Conversation List View
  return (
    <div className="flex h-dvh min-h-0 flex-col bg-white overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Direct messages</h1>
        <button
          onClick={handleOpenUserList}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white hover:bg-purple-700 cursor-pointer"
        >
          +
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-2xl text-purple-600">
              ✉️
            </div>
            <h2 className="text-lg font-bold text-gray-900">No conversations yet</h2>
            <button
              onClick={handleOpenUserList}
              className="mt-4 rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              Start a message
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {conv.participantNames
                      ? Object.entries(conv.participantNames).find(([uid]) => uid !== user?.uid)?.[1] || "Teammate"
                      : conv.recipientName || "Teammate"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-50">
                    {conv.lastMessage || "Click to chat"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">New Message</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {allUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No other users found.</p>
              ) : (
                allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u)}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left hover:bg-purple-50 transition cursor-pointer"
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
