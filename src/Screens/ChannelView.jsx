import { useState } from 'react';

export default function ChannelView({ channel, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderName: 'Alex',
      senderAvatar: 'AJ',
      text: 'Welcome to the team! 🎉',
      timestamp: '10:20 AM',
      isSelf: false,
    },
    {
      id: '2',
      senderName: 'Jane',
      senderAvatar: 'JD',
      text: 'Thank you! Excited to be here.',
      timestamp: '10:24 AM',
      isSelf: true,
      seen: true,
    },
  ]);

  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderName: 'Jane',
      senderAvatar: 'JD',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      seen: false,
    };

    setMessages([...messages, newMessage]);
    setText('');
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
            aria-label="Back to channels"
          >
            ←
          </button>
          <div className="flex items-center gap-1 font-bold text-gray-900">
            <span className="text-gray-400">#</span>
            <span>{channel?.name || 'general'}</span>
          </div>
        </div>
        <span className="text-lg">#️⃣</span>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <p className="font-semibold text-gray-800">Beginning of #{channel?.name || 'general'}</p>
            <p className="text-sm text-gray-500">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">{msg.senderName}</span>
                <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  msg.isSelf
                    ? 'bg-purple-100 text-purple-950 rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              {msg.isSelf && (
                <span className="mt-1 text-[10px] font-medium text-[#0CC8D4]">
                  {msg.seen ? '✓✓ Seen' : '✓ Sent'}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-3 bg-white">
        <button type="button" className="text-xl text-gray-500 hover:text-gray-700">
          😊
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message #${channel?.name || 'general'}`}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}