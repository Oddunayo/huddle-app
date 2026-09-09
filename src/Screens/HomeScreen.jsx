import { useState } from 'react';
import ChannelView from './ChannelView';
import DirectMessagesView from './DirectMessagesView';
import ProfileView from './ProfileView';
import CreateChannelModal from '../Components/CreateChannelModal';

export default function HomeScreen({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'messages' | 'you'
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [channels, setChannels] = useState([
    { id: 'general', name: 'general', lastMessage: 'Welcome to the team! 🎉', unread: false },
    { id: 'random', name: 'random', lastMessage: 'Anyone up for lunch?', unread: false },
    { id: 'project-updates', name: 'project-updates', lastMessage: 'Sprint review at 3pm', unread: false },
  ]);

  const handleCreateChannel = (newChannel) => {
    setChannels((prev) => [...prev, newChannel]);
  };

  // If a channel is actively selected, show ChannelView full screen
  if (selectedChannel) {
    return (
      <ChannelView
        channel={selectedChannel}
        onBack={() => setSelectedChannel(null)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="text-lg font-bold text-gray-900">Huddle</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Channel '+' Icon */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-700 hover:bg-purple-100 hover:text-purple-600"
            title="Create channel"
          >
            +
          </button>

          {/* User Avatar Badge */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0CC8D4] text-xs font-bold text-white">
            {user?.initials || 'JD'}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'channels' && (
          <div className="p-4">
            <h2 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Channels
            </h2>

            <div className="space-y-1">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch)}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <span className="text-gray-400">#</span>
                      <span>{ch.name}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{ch.lastMessage}</p>
                  </div>
                  {ch.unread && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0CC8D4]"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && <DirectMessagesView user={user} />}

        {activeTab === 'you' && <ProfileView user={user} onLogout={onLogout} />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="flex border-t border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex flex-1 flex-col items-center py-2.5 text-xs font-semibold ${
            activeTab === 'channels' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-base mb-0.5">💬</span>
          <span>Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-1 flex-col items-center py-2.5 text-xs font-semibold ${
            activeTab === 'messages' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-base mb-0.5">✉️</span>
          <span>Messages</span>
        </button>

        <button
          onClick={() => setActiveTab('you')}
          className={`flex flex-1 flex-col items-center py-2.5 text-xs font-semibold ${
            activeTab === 'you' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-base mb-0.5">👤</span>
          <span>You</span>
        </button>
      </nav>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  );
}