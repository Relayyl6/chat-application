"use client"

import { useState } from 'react'
import Header from './Header';
import ChatCard from './ChatCard'
import ChatCardSkeleton from './ChatCardSkeleton'
import { useAppContext } from '@/context/useContext';
import { useRouter } from 'next/navigation';
import { socketActions } from '@/lib/socket';
import { getChannelAvatar } from '@/lib/tools';

type Tab = 'dms' | 'channels';

const ChatPreview = () => {
  const router = useRouter();
  const {
    dmChannels,
    groupChannels,
    channelsLoading,
    loadChannels,
    setActiveChannelId,
  } = useAppContext();

  const currentUserId = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')._id
    : '';

  const [searchValue, setSearchValue] = useState('');
  const [tab, setTab] = useState<Tab>('dms');
  const [something, setSomething] = useState(false);
  const [another, setAnother] = useState(true);
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  const handleChannelCreated = async (channelId: string) => {
    try {
      await loadChannels();
      setName('');
      setExtraInfo('');
      setUserId('');
      setMode('dm');
      setMembers([]);
      setSomething(false);
      setActiveChannelId(channelId);
      socketActions.joinChannel(channelId);
      router.push(`/chat/chatsection/${channelId}`);
    } catch (error) {
      console.error('Error handling channel creation:', error);
    }
  };

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    socketActions.joinChannel(channelId);
    router.push(`/chat/chatsection/${channelId}`);
  };

  // Filter by search query
  const search = searchValue.toLowerCase().trim();

  const filteredDms = dmChannels.filter(c => {
    const name = c.members
      .filter(m => m.userId._id !== currentUserId)
      .map(m => m.userId.username)
      .join(', ');
    const preview = c.lastMessageAt?.content ?? '';
    return name.toLowerCase().includes(search) || preview.toLowerCase().includes(search);
  });

  const filteredGroups = groupChannels.filter(c => {
    const preview = c.lastMessageAt?.content ?? '';
    return (c.name ?? '').toLowerCase().includes(search) || preview.toLowerCase().includes(search);
  });

  const renderChannelCard = (channel: Channel) => {
    const displayName = channel.type === 'direct'
      ? channel.members
          .filter(m => m.userId._id !== currentUserId)
          .map(m => m.userId.username)
          .join(', ') || 'Direct Message'
      : channel.name ?? 'Unnamed Channel';

    const avatar = getChannelAvatar(channel, currentUserId);
    const preview = channel.lastMessageAt?.content ?? '';
    const date = channel.lastMessageAt?.sendAt ?? channel.updatedAt;
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
  };

  return (
    <main className='flex flex-col w-full md:w-[350px] md:min-w-[350px] md:max-w-sm bg-bg-card p-3 md:rounded-tl-xl'>
      <Header
        text="Chat"
        onClick={() => setAnother(prev => !prev)}
        onPress={() => setSomething(prev => !prev)}
        something={something}
        searchValue={searchValue}
        handleChange={e => setSearchValue(e.target.value)}
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
              {channelsLoading ? (
                [...Array(5)].map((_, i) => <ChatCardSkeleton key={i} />)
              ) : filteredDms.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 flex items-center justify-center">
                  {search ? 'No results found' : 'No direct messages yet'}
                </p>
              ) : (
                filteredDms.map(renderChannelCard)
              )}
            </>
          )}

          {/* ─── Channels Tab ────────────────────────────────────────────── */}
          {tab === 'channels' && (
            <>
              {channelsLoading ? (
                [...Array(5)].map((_, i) => <ChatCardSkeleton key={i} />)
              ) : filteredGroups.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 flex items-center justify-center">
                  {search ? 'No results found' : 'No group channels yet'}
                </p>
              ) : (
                filteredGroups.map(renderChannelCard)
              )}
            </>
          )}

        </div>
      </div>
    </main>
  );
};

export default ChatPreview;