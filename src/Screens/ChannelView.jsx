import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "🚀", "🙌", "✨"];

export default function ChannelView({ channel, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Listen for real-time channel messages 
  useEffect(() => {
    if (!channel?.id) return;

    const q = query(
      collection(db, "messages"),
      where("channelId", "==", channel.id),
      orderBy("timestamp", "asc")
    );

    // includeMetadataChanges ensures local writes show immediately without needing to re-enter
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => {
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
        setMessages(fetchedMessages);
      }
    );

    return () => unsubscribe();
  }, [channel?.id, user?.uid]);

  // 2. Auto-scroll to bottom whenever new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text.trim();
    setText("");
    setShowEmojiPicker(false);

    try {
      await addDoc(collection(db, "messages"), {
        channelId: channel.id,
        senderId: user?.uid || "anonymous",
        senderName: user?.fullName || user?.displayName || "User",
        text: messageText,
        timestamp: serverTimestamp(),
        seen: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
            aria-label="Back to channels"
          >
            ←
          </button>
          <div className="flex items-center gap-1 font-bold text-gray-900">
            <span className="text-gray-400">#</span>
            <span>{channel?.name || "general"}</span>
          </div>
        </div>
        <span className="text-lg">#️⃣</span>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <p className="font-semibold text-gray-800">
              Beginning of #{channel?.name || "general"}
            </p>
            <p className="text-sm text-gray-500">
              Send a message to start the conversation.
            </p>
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

      {/* Input Composer with Active Emoji Picker */}
      <div className="relative">
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
            placeholder={`Message #${channel?.name || "general"}`}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}