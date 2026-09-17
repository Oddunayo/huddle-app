import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "🚀", "🙌", "✨"];

export default function ChannelView({ channel, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const channelId = channel?.id;
  const userId = user?.uid;

  // Helper function to update read timestamp
  const markChannelAsRead = useCallback(() => {
    if (channelId && userId) {
      localStorage.setItem(
        `lastRead_channel_${userId}_${channelId}`,
        String(new Date().getTime())
      );
    }
  }, [channelId, userId]);

  // 1. Listen for real-time channel messages & reactions
  useEffect(() => {
    if (!channelId || !userId) return;

    markChannelAsRead();

    const q = query(
      collection(db, "messages"),
      where("channelId", "==", channelId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          reactions: data.reactions || {},
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
      markChannelAsRead();
    });

    return () => unsubscribe();
  }, [channelId, markChannelAsRead, userId, user?.uid]);

  // 2. Listen for active typing users in Firestore
  useEffect(() => {
    if (!channelId || !userId) return;

    const typingRef = collection(db, "channels", channelId, "typing");
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const activeTypers = snapshot.docs
        .map((d) => d.data())
        .filter((typer) => typer.uid !== userId);
      setTypingUsers(activeTypers);
    });

    return () => unsubscribe();
  }, [channelId, userId]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing status updates
  const handleTyping = (e) => {
    const val = e.target.value;
    setText(val);

    if (!channelId || !userId) return;

    const userTypingRef = doc(db, "channels", channelId, "typing", userId);

    if (val.trim()) {
      setDoc(userTypingRef, {
        uid: userId,
        name: user?.fullName || user?.displayName || "Someone",
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        deleteDoc(userTypingRef);
      }, 2000);
    } else {
      deleteDoc(userTypingRef);
    }
  };

  // Toggle emoji reactions on a message
  const handleToggleReaction = async (msgId, emoji) => {
    if (!userId) return;

    const msgRef = doc(db, "messages", msgId);
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg) return;

    const currentReactions = targetMsg.reactions || {};
    const existingUsers = currentReactions[emoji] || [];

    let updatedUsers;
    if (existingUsers.includes(userId)) {
      updatedUsers = existingUsers.filter((id) => id !== userId);
    } else {
      updatedUsers = [...existingUsers, userId];
    }

    const updatedReactions = {
      ...currentReactions,
      [emoji]: updatedUsers,
    };

    if (updatedUsers.length === 0) {
      delete updatedReactions[emoji];
    }

    setActiveReactionMsgId(null);

    try {
      await updateDoc(msgRef, {
        reactions: updatedReactions,
      });
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !channelId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (channelId && userId) {
      deleteDoc(doc(db, "channels", channelId, "typing", userId));
    }

    const messageText = text.trim();
    setText("");
    setShowEmojiPicker(false);

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      channelId: channel.id,
      senderId: user?.uid || "anonymous",
      senderName: user?.fullName || user?.displayName || "You",
      text: messageText,
      reactions: {},
      isSelf: true,
      timeString: "Just now",
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await addDoc(collection(db, "messages"), {
        channelId: channel.id,
        senderId: user?.uid || "anonymous",
        senderName: user?.fullName || user?.displayName || "User",
        text: messageText,
        reactions: {},
        timestamp: serverTimestamp(),
      });

      const channelRef = doc(db, "channels", channel.id);
      await updateDoc(channelRef, {
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });

      markChannelAsRead();
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert optimistic update if write fails
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 shrink-0 z-40">
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
              className={`group relative flex flex-col ${
                msg.isSelf ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-gray-400">
                  {msg.timeString}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  msg.isSelf
                    ? "bg-purple-100 text-purple-950 rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.text}

                {/* Hover trigger button for reactions */}
                <button
                  onClick={() =>
                    setActiveReactionMsgId(
                      activeReactionMsgId === msg.id ? null : msg.id
                    )
                  }
                  className="absolute -top-3 right-2 hidden group-hover:flex items-center justify-center rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-xs shadow-sm hover:bg-gray-50 cursor-pointer"
                >
                  😊+
                </button>
              </div>

              {/* Quick Reaction Picker Popup */}
              {activeReactionMsgId === msg.id && (
                <div className="mt-1 flex gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-md z-30">
                  {EMOJIS.slice(0, 5).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(msg.id, emoji)}
                      className="p-1 text-sm hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Rendered Reaction Badges */}
              {Object.keys(msg.reactions).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(msg.reactions).map(([emoji, users]) => {
                    const hasReacted = users.includes(userId);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(msg.id, emoji)}
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium cursor-pointer ${
                          hasReacted
                            ? "border-purple-300 bg-purple-50 text-purple-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{users.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Banner */}
      <div className="px-4 py-1 text-xs text-gray-500 italic h-5 shrink-0">
        {typingUsers.length > 0 && (
          <span>
            {typingUsers.map((u) => u.name).join(", ")}{" "}
            {typingUsers.length === 1 ? "is typing..." : "are typing..."}
          </span>
        )}
      </div>

      {/* Input Composer */}
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
          className="flex items-center gap-2 p-3 bg-white"
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
            onChange={handleTyping}
            placeholder={"Message #" + (channel?.name || "general")}
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

