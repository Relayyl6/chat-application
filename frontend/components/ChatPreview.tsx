"use client"

import { useState } from 'react'
import Header from './Header';
import ChatCard from './ChatCard'
import ChatCardSkeleton from './ChatCardSkeleton'
import { useAppContext } from '@/context/useContext';
import { useChannels } from '@/hooks/useChannels';
import { useRouter } from 'next/navigation';
import { socketActions } from '@/lib/socket';
import { getChannelAvatar } from '@/lib/tools';

type Tab = 'dms' | 'channels';

const ChatPreview = () => {
  const router = useRouter();
  const { people, setActiveChannelId } = useAppContext();
  const { channels, channelsLoading, loadChannels } = useChannels();

  const currentUserId = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')._id
    : '';

  const [isLoading] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [tab, setTab] = useState<Tab>('dms');
  const [something, setSomething] = useState(false);
  const [another, setAnother] = useState(true);
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [members, setMembers] = useState<Member[]>([]);  // ✅ Member[] not string[]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleChannelCreated = async (channelId: string) => {
    try {
      await loadChannels();
      setName("");
      setExtraInfo("");
      setUserId("");
      setMode("dm");
      setMembers([]);
      setSomething(false);
      setActiveChannelId(channelId);
      socketActions.joinChannel(channelId);
      router.push(`/chat/chatsection/${channelId}`);
    } catch (error) {
      console.error('Error handling channel creation:', error);
    }
  };

  const filteredPeople = people.order.filter((id: string) => {
    const person = people.byId[id];
    const search = searchValue.toLowerCase().trim();
    return (
      person.title.toLowerCase().includes(search) ||
      person.firstLine.toLowerCase().includes(search)
    );
  });

  const filteredChannels = (channels || []).filter((channel) => {
    const search = searchValue.toLowerCase().trim();
    const displayName = channel.name ?? '';
    const preview = channel.lastMessageAt?.content ?? '';
    return (
      displayName.toLowerCase().includes(search) ||
      preview.toLowerCase().includes(search)
    );
  });

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
        onChannelCreated={handleChannelCreated}
      />

      <div className='w-full h-px bg-gray-700 border-border-strong border' />

      <div className='flex flex-row mt-2 gap-1 rounded-lg bg-bg-input p-1'>
        <button
          onClick={() => setTab('dms')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150
            ${tab === 'dms' ? 'bg-btn-light-text text-white' : 'text-gray-400 hover:text-white'}`}
        >
          DMs
        </button>
        <button
          onClick={() => setTab('channels')}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150
            ${tab === 'channels' ? 'bg-btn-light-text text-white' : 'text-gray-400 hover:text-white'}`}
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
                [...Array(8)].map((_, i) => <ChatCardSkeleton key={i} />)
              ) : filteredPeople.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 flex items-center justify-center">No chats found</p>
              ) : (
                filteredPeople.map((id: string) => {
                  const person = people.byId[id];
                  return (
                    <div className='flex flex-row justify-between box-border m-1 bg-bg-input rounded-md' key={id}>
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
                [...Array(5)].map((_, i) => <ChatCardSkeleton key={i} />)
              ) : filteredChannels.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 flex items-center justify-center">No channels found</p>
              ) : (
                filteredChannels.map((channel) => {
                  // Derive display name properly
                  const displayName = channel.type === 'direct'
                    ? channel.members
                        .filter(m => m.userId._id !== currentUserId)
                        .map(m => m.userId.username)
                        .join(', ') || 'Direct Message'
                    : channel.name ?? 'Unnamed Channel';

                  // Derive avatar using utility
                  const avatar = getChannelAvatar(channel, currentUserId);

                  // Use correct field name lastMessageAt
                  const preview = channel.lastMessageAt?.content ?? '';
                  const date = channel.lastMessageAt?.sendAt ?? channel.updatedAt;

                  // ✅ Sum unread counts for current user
                  const unreadCount = channel.members
                    .find(m => m.userId._id === currentUserId)
                    ?.unreadCount ?? 0;

                  return (
                    <div
                      className='flex flex-row justify-between box-border m-1 bg-bg-input rounded-md cursor-pointer'
                      key={channel._id}
                      onClick={() => handleChannelClick(channel._id)}
                    >
                      <ChatCard
                        id={channel._id}
                        name={displayName}
                        avatar={avatar}
                        lastMessage={preview}
                        date={date}
                        unreadCount={unreadCount}
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