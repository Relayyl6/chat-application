"use client"

import { useState } from 'react'
import Header from './Header';
import ChatCard from './ChatCard'
import ChatCardSkeleton from './ChatCardSkeleton'
import { useAppContext } from '@/context/useContext';
import { useRouter } from 'next/navigation';
import { socketActions } from '@/lib/socket';

// ─── Tab type ────────────────────────────────────────────────────────────────
type Tab = 'dms' | 'channels';

const ChatPreview = () => {
  const router = useRouter();
  const { people, channels, channelsLoading, setActiveChannelId } = useAppContext();

  const [isLoading] = useState(false); // DMs: already in context/localStorage, no spinner needed
  const [searchValue, setSearchValue] = useState<string>("");
  const [tab, setTab] = useState<Tab>('dms');

  // New-chat modal state (unchanged — passed to Header)
  const [something, setSomething] = useState(false);
  const [another, setAnother] = useState(true);
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [members, setMembers] = useState<string[]>([""]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // ─── Filtered DMs ──────────────────────────────────────────────────────────
  const filteredPeople = people.order.filter((id: string) => {
    const person = people.byId[id];
    const search = searchValue.toLowerCase().trim();
    return (
      person.title.toLowerCase().includes(search) ||
      person.firstLine.toLowerCase().includes(search)
    );
  });

  // ─── Filtered Channels ─────────────────────────────────────────────────────
  const filteredChannels = channels.filter((channel) => {
    const search = searchValue.toLowerCase().trim();
    const displayName = channel.name ?? 'Direct Message';
    const preview = channel.lastMessage?.content ?? '';
    return (
      displayName.toLowerCase().includes(search) ||
      preview.toLowerCase().includes(search)
    );
  });

  // ─── Channel click: join socket room + navigate ────────────────────────────
  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    socketActions.joinChannel(channelId);
    router.push(`/chat/chatsection/${channelId}`);
  };

  return (
    <main className='flex flex-col w-full min-w-full sm:w-[400px] sm:min-w-[350px] max-w-sm max-md:rounded-r-lg bg-bg-card p-3 rounded-tl-xl'>
      <Header
        text="Chat"
        onClick={() => setAnother(prev => !prev)}
        onPress={() => setSomething(prev => !prev)}
        something={something}
        searchValue={searchValue}
        handleChange={handleChange}
        title="New Chat"
        name={name}
        setName={setName}
        userId={userId}
        setUserId={setUserId}
        extraInfo={extraInfo}
        setExtraInfo={setExtraInfo}
        mode={mode}
        setMode={setMode}
        members={members}
        setMembers={setMembers}
      />

      <div className='w-full h-px bg-gray-700 border-border-strong border' />

      {/* ─── Tabs ──────────────────────────────────────────────────────────── */}
      <div className='flex flex-row mt-2 gap-1 rounded-lg bg-bg-input p-1'>
        <button
          onClick={() => setTab('dms')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150
            ${tab === 'dms'
              ? 'bg-btn-light-text text-white'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          DMs
        </button>
        <button
          onClick={() => setTab('channels')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150
            ${tab === 'channels'
              ? 'bg-btn-light-text text-white'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Channels
        </button>
      </div>

      <div className='mt-2 flex-1 min-h-0 h-full'>
        <div className='mt-2 bg-bg-card flex flex-col w-full h-full overflow-y-auto no-scrollbar'>

          {/* ─── DMs Tab ─────────────────────────────────────────────────── */}
          {tab === 'dms' && (
            <>
              {isLoading ? (
                [...Array(8)].map((_, index) => <ChatCardSkeleton key={index} />)
              ) : filteredPeople.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 flex items-center justify-center">
                  No chats found
                </p>
              ) : (
                filteredPeople.map((id: string) => {
                  const person = people.byId[id];
                  return (
                    <div
                      className='flex flex-row justify-between box-border m-1 bg-bg-input rounded-md'
                      key={id}
                    >
                      <ChatCard
                        id={id}
                        name={person.title}
                        date={person.message?.at(-1)?.timestamp ?? ""}
                      />
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ─── Channels Tab ────────────────────────────────────────────── */}
          {tab === 'channels' && (
            <>
              {channelsLoading ? (
                [...Array(5)].map((_, index) => <ChatCardSkeleton key={index} />)
              ) : filteredChannels.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 flex items-center justify-center">
                  No channels found
                </p>
              ) : (
                filteredChannels.map((channel) => {
                  const displayName = channel.name
                    ?? channel.users
                         .filter(u => u.userId.id !== JSON.parse(localStorage.getItem('user') || '{}').id)
                         .map(u => u.userId.username)
                         .join(', ')
                    ?? 'Direct Message';

                  const preview = channel.lastMessage?.content ?? '';
                  const date = channel.lastMessage?.sentAt ?? channel.updatedAt ?? '';

                  return (
                    <div
                      className='flex flex-row justify-between box-border m-1 bg-bg-input rounded-md cursor-pointer'
                      key={channel._id}
                      onClick={() => handleChannelClick(channel._id)}
                    >
                      {/* Reuse your ChatCard — same visual style */}
                      <ChatCard
                        id={channel._id}
                        name={displayName}
                        lastMessage={preview}
                        date={date}
                      />
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>
      </div>
    </main>
  );
};

export default ChatPreview;