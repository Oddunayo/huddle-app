import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
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
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const convId = selectedConv?.id;
  const userId = user?.uid;

  const markDmAsRead = useCallback(() => {
    if (convId && userId) {
      localStorage.setItem(`lastRead_dm_${userId}_${convId}`, String(new Date().getTime()));
    }
  }, [convId, userId]);

  // 1. Fetch conversations list
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "directMessages"),
      where("participants", "array-contains", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [userId]);

  // 2. Real-time message streaming for DM
  useEffect(() => {
    if (!convId || !userId) return;

    markDmAsRead();

    const q = query(
      collection(db, "directMessages", convId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          reactions: data.reactions || {},
          isSelf: data.senderId === userId,
          timeString: data.timestamp?.toDate
            ? data.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
        };
      });
      setMessages(fetched);
      markDmAsRead();
    });

    return () => unsubscribe();
  }, [convId, markDmAsRead, userId]);

  // 3. Real-time typing status
  useEffect(() => {
    if (!convId || !userId) return;

    const typingRef = collection(db, "directMessages", convId, "typing");
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const activeTypers = snapshot.docs
        .map((d) => d.data())
        .filter((typer) => typer.uid !== userId);
      setTypingUsers(activeTypers);
    });

    return () => unsubscribe();
  }, [convId, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e) => {
    const val = e.target.value;
    setText(val);

    if (!convId || !userId) return;
    const userTypingRef = doc(db, "directMessages", convId, "typing", userId);

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

  const handleToggleReaction = async (msgId, emoji) => {
    if (!userId || !convId) return;

    const msgRef = doc(db, "directMessages", convId, "messages", msgId);
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg) return;

    const currentReactions = targetMsg.reactions || {};
    const existingUsers = currentReactions[emoji] || [];

    let updatedUsers = existingUsers.includes(userId)
      ? existingUsers.filter((id) => id !== userId)
      : [...existingUsers, userId];

    const updatedReactions = { ...currentReactions, [emoji]: updatedUsers };
    if (updatedUsers.length === 0) delete updatedReactions[emoji];

    setActiveReactionMsgId(null);

    try {
      await updateDoc(msgRef, { reactions: updatedReactions });
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const isConvUnread = (conv) => {
    if (selectedConv?.id === conv.id) return false;
    const lastRead = localStorage.getItem(`lastRead_dm_${userId}_${conv.id}`);
    if (!lastRead) return true;

    const convTime = conv.updatedAt?.toDate ? conv.updatedAt.toDate().getTime() : 0;
    return convTime > parseInt(lastRead, 10);
  };

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
    localStorage.setItem(`lastRead_dm_${userId}_${conv.id}`, String(new Date().getTime()));
  };

  const handleOpenUserList = async () => {
    setIsModalOpen(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.uid !== userId);
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleStartChat = async (selectedUser) => {
    setIsModalOpen(false);
    const existing = conversations.find((c) => c.participants?.includes(selectedUser.uid));

    if (existing) {
      handleSelectConversation(existing);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "directMessages"), {
        participants: [userId, selectedUser.uid],
        participantNames: {
          [userId]: user?.fullName || user?.displayName || "Teammate",
          [selectedUser.uid]: selectedUser.fullName || selectedUser.email || "Teammate",
        },
        lastMessage: "Started a conversation",
        updatedAt: serverTimestamp(),
      });

      handleSelectConversation({
        id: docRef.id,
        participants: [userId, selectedUser.uid],
        participantNames: {
          [userId]: user?.fullName || user?.displayName || "Teammate",
          [selectedUser.uid]: selectedUser.fullName || selectedUser.email || "Teammate",
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !convId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    deleteDoc(doc(db, "directMessages", convId, "typing", userId));

    const messageText = text.trim();
    setText("");
    setShowEmojiPicker(false);

    try {
      await addDoc(collection(db, "directMessages", convId, "messages"), {
        senderId: userId,
        senderName: user?.fullName || user?.displayName || "User",
        text: messageText,
        reactions: {},
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, "directMessages", convId), {
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });

      markDmAsRead();
    } catch (error) {
      console.error("Error sending DM:", error);
    }
  };

  if (selectedConv) {
    const recipientName = selectedConv.participantNames
      ? Object.entries(selectedConv.participantNames).find(([uid]) => uid !== userId)?.[1] || "Teammate"
      : selectedConv.recipientName || "Teammate";

    return (
      <div className="flex h-dvh max-h-dvh w-full min-h-0 flex-col bg-white overflow-hidden relative">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shrink-0 z-40">
          <button
            onClick={() => setSelectedConv(null)}
            className="rounded-full p-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            ←
          </button>
          <h1 className="font-bold text-gray-900">{recipientName}</h1>
        </header>

        {/* Message Feed */}
        <div className="flex-1 w-full min-h-0 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-gray-400">
              <p className="text-sm">This is the start of your direct message history.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`group relative flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {msg.isSelf ? "You" : recipientName}
                  </span>
                  <span className="text-[10px] text-gray-400">{msg.timeString}</span>
                </div>

                <div
                  className={`relative max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    msg.isSelf
                      ? "bg-purple-100 text-purple-950 rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}

                  {/* Reaction trigger */}
                  <button
                    onClick={() => setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)}
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

                {/* Reaction Badges */}
                {Object.keys(msg.reactions || {}).length > 0 && (
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

        {/* Typing Banner */}
        <div className="px-4 py-1 text-xs text-gray-500 italic h-5 shrink-0">
          {typingUsers.length > 0 && (
            <span>
              {typingUsers.map((u) => u.name).join(", ")}{" "}
              {typingUsers.length === 1 ? "is typing..." : "are typing..."}
            </span>
          )}
        </div>

        {/* Input Composer */}
        <div className="relative shrink-0 border-t border-gray-200 bg-white z-40">
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

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 bg-white">
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
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col bg-white overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 shrink-0">
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
            {conversations.map((conv) => {
              const hasUnread = isConvUnread(conv);
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className={`text-sm ${hasUnread ? "font-black text-gray-900" : "font-semibold text-gray-800"}`}>
                      {conv.participantNames
                        ? Object.entries(conv.participantNames).find(([uid]) => uid !== userId)?.[1] || "Teammate"
                        : conv.recipientName || "Teammate"}
                    </p>
                    <p className={`text-xs truncate max-w-50 ${hasUnread ? "font-bold text-purple-700" : "text-gray-500"}`}>
                      {conv.lastMessage || "Click to chat"}
                    </p>
                  </div>

                  {hasUnread && <span className="h-2.5 w-2.5 rounded-full bg-purple-600 shrink-0" />}
                </div>
              );
            })}
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