"use client"

import React, { useEffect, useRef, useMemo, useState } from 'react'
import ChatHeader from '@/components/ChatHeader'
import ChatBubble from '@/components/ChatBubble'
import InputSection from '@/components/InputSection'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/useContext'
import { useMessages } from '@/hooks/useMessages'
import { useSocketContext } from '@/context/SocketContext'
import { socketActions } from '@/lib/socket'
import { DNA } from 'react-loader-spinner'

// Safe helper — senderId can be populated { _id, username } or a raw string
const getSenderId = (senderId: any): string =>
  typeof senderId === 'object' ? senderId?._id ?? '' : senderId ?? '';

const getSenderUsername = (senderId: any): string =>
  typeof senderId === 'object' ? senderId?.username ?? '?' : '?';

const Page = () => {
  const params = useParams();
  const chatId = params.id as string;
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { onUserStatus, onUserOffline, onUserOnline, onTyping } = useSocketContext();

  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { messagesByChat, setMessagesByChat, people, channels } = useAppContext();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [channelsSettled, setChannelsSettled] = useState(false);

  const currentUserId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')._id ?? ''
      : '';

  const channel = channels.find(c => c._id === chatId);
  const person = people.byId?.[chatId];

  useEffect(() => {
    setChannelsSettled(false);
    setLiveStatus(null);
    setTypingUsers([]);
    const t = setTimeout(() => setChannelsSettled(true), 2000);
    return () => clearTimeout(t);
  }, [chatId]);

  useEffect(() => {
    if (channels.length > 0 || channel) setChannelsSettled(true);
  }, [channels, channel]);

  // Seed liveStatus from channel data
  useEffect(() => {
    if (channel?.type === 'direct') {
      const other = channel.members.find(m => getSenderId(m.userId) !== currentUserId);
      if (other) setLiveStatus(other.userId?.status ?? 'offline');
    }
  }, [channel, currentUserId]);

  // Online / offline / status socket events
  useEffect(() => {
    const other = channel?.members.find(m => getSenderId(m.userId) !== currentUserId);
    const otherId = other ? getSenderId(other.userId) : null;

    const unsub1 = onUserStatus((data: { userId: string; status: string }) => {
      if (channel?.type !== 'direct' || !otherId) return;
      if (otherId === data.userId) setLiveStatus(data.status);
    });
    const unsub2 = onUserOnline((data: { userId: string }) => {
      if (otherId === data.userId) setLiveStatus('online');
    });
    const unsub3 = onUserOffline((data: { userId: string }) => {
      if (otherId === data.userId) setLiveStatus('offline');
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [channel, currentUserId, onUserStatus, onUserOnline, onUserOffline]);

  // Typing indicator
  useEffect(() => {
    const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

    const unsub = onTyping((data: { channelId: string; userId: string; username: string; isTyping: boolean }) => {
      if (data.channelId !== chatId || data.userId === currentUserId) return;
      if (data.isTyping) {
        setTypingUsers(prev => prev.includes(data.username) ? prev : [...prev, data.username]);
        if (typingTimers[data.userId]) clearTimeout(typingTimers[data.userId]);
        typingTimers[data.userId] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }, 3000);
      } else {
        if (typingTimers[data.userId]) clearTimeout(typingTimers[data.userId]);
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    return () => { unsub(); Object.values(typingTimers).forEach(clearTimeout); };
  }, [chatId, currentUserId, onTyping]);

  const isChannel = channel ? true : person ? false : true;
  const isGroup = channel?.type === 'group';
  const isDirect = channel?.type === 'direct';

  const {
    messages: socketMessages,
    loading: socketLoading,
    sendMessage,
    searchMessages,
    editMessage,
    deleteMessage,
    reactToMessage,
  } = useMessages(isChannel && (Boolean(channel) || channelsSettled) ? chatId : null);

  const dmMessages = useMemo(
    () => messagesByChat[chatId] ?? [],
    [messagesByChat, chatId]
  );

  useEffect(() => {
    if (isChannel && channel) socketActions.joinChannel(chatId);
  }, [isChannel, channel, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socketMessages, dmMessages]);

  const senderColors = ['bg-violet-500', 'bg-blue-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
  const senderColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    channel?.members.forEach((m, i) => {
      map[getSenderId(m.userId)] = senderColors[i % senderColors.length];
    });
    return map;
  }, [channel]);

  const dataResolved = Boolean(channel || person);
  if (!dataResolved && !channelsSettled) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <DNA height={80} width={80} visible ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass="" />
      </div>
    );
  }

  const getTitle = () => {
    if (!isChannel) return person!.title;
    if (isGroup && channel!.name) return channel!.name;
    if (isDirect) {
      const other = channel!.members.find(m => getSenderId(m.userId) !== currentUserId);
      return getSenderUsername(other?.userId) !== '?' ? getSenderUsername(other?.userId) : 'Direct Message';
    }
    return channel!.members
      .filter(u => getSenderId(u.userId) !== currentUserId)
      .map(u => getSenderUsername(u.userId))
      .join(', ') || 'Chat';
  };

  const getSubTitle = () => {
    if (!isChannel) return person!.firstLine;
    if (isGroup) {
      if (typingUsers.length > 0)
        return typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.join(', ')} are typing...`;
      return `${channel!.members.length} member${channel!.members.length !== 1 ? 's' : ''}`;
    }
    if (isDirect) {
      if (typingUsers.length > 0) return 'typing...';
      return liveStatus ?? channel!.members.find(u => getSenderId(u.userId) !== currentUserId)?.userId?.status ?? 'offline';
    }
    return '';
  };

  const title = channel || person ? getTitle() : 'Loading...';
  const subTitle = channel || person ? getSubTitle() : '';

  const aliasBgMap: Record<string, string> = {
    you: 'bg-violet-500',
    ai: 'bg-purple-500',
    me: 'bg-green-500',
  };

  return (
    <div className="flex flex-col p-2 gap-2 w-full h-full rounded-xl">
      <ChatHeader
        title={title}
        subTitle={subTitle}
        id={chatId}
        isChannel={isChannel}
        onSearch={async (query) => {
          if (isChannel && searchMessages) {
            try {
              const results = await searchMessages(query);
              setSearchResults(results ?? []);
            } catch (error) {
              console.error('Search failed:', error);
            }
          }
        }}
      />

      <div className="flex-1 min-h-0 h-full relative rounded-xl">
        <div className='w-full h-full gap-1 flex flex-col relative bg-bg-main pt-2 rounded-xl'>
          <div className="overflow-y-auto no-scrollbar gap-2 flex-1 px-2">

            {searchResults.length > 0 && (
              <div className='bg-blue-100 text-blue-900 rounded p-3 mb-4 text-sm'>
                🔍 Found {searchResults.length} results. Clear search to see all messages.
              </div>
            )}

            {isChannel && (
              <>
                {socketLoading && !searchResults.length && (
                  <div className="flex justify-center py-4">
                    <DNA height={40} width={40} visible ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass="" />
                  </div>
                )}

                {(searchResults.length > 0 ? searchResults : socketMessages).map((msg) => {
                  const senderId = getSenderId(msg.senderId);
                  const isMe = senderId === currentUserId;
                  const bubbleColor = isMe
                    ? 'bg-green-500'
                    : isGroup
                      ? senderColorMap[senderId] ?? 'bg-violet-500'
                      : 'bg-violet-500';

                  return (
                    <div
                      key={msg._id || msg.tempId}
                      className={`flex w-full px-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {isGroup && !isMe && (
                        <div className="flex flex-col items-center mr-2 mt-1">
                          <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                            {getSenderUsername(msg.senderId)[0]?.toUpperCase() ?? '?'}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col max-w-[70%]">
                        {isGroup && !isMe && (
                          <span className="text-xs text-gray-400 mb-0.5 ml-1">
                            {getSenderUsername(msg.senderId)}
                          </span>
                        )}
                        <ChatBubble
                          messageId={msg._id}
                          message={msg.content}
                          timestamp={msg.createdAt as unknown as Date}
                          className={bubbleColor}
                          isOwn={isMe}
                          channelId={chatId}
                          onEdit={async (content) => {
                            try { if (editMessage) await editMessage(msg._id, content); }
                            catch (e) { console.error('Edit failed:', e); }
                          }}
                          onDelete={async () => {
                            try { if (deleteMessage) await deleteMessage(msg._id); }
                            catch (e) { console.error('Delete failed:', e); }
                          }}
                          onReact={async (emoji) => {
                            try { if (reactToMessage) await reactToMessage(msg._id, emoji); }
                            catch (e) { console.error('React failed:', e); }
                          }}
                          reactions={msg.reactions}
                        />
                      </div>
                    </div>
                  );
                })}

                {typingUsers.length > 0 && (
                  <div className="flex justify-start px-2 mb-1">
                    <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 italic">
                      {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing`
                        : `${typingUsers.join(', ')} are typing`}
                      <span className="animate-pulse"> ...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {!isChannel && dmMessages.map((t: MessageProps) => (
              <div
                key={t.timestamp as string}
                className={`flex w-full px-2 mb-1 ${t.alias === 'me' ? 'justify-start' : 'justify-end'}`}
              >
                <ChatBubble
                  message={t.text || ''}
                  timestamp={t?.timestamp as unknown as Date}
                  className={`${aliasBgMap[t.alias as string] ?? 'bg-white'}`}
                />
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <InputSection
            message={dmMessages}
            setMessage={(updater: unknown) =>
              setMessagesByChat(prev => {
                const current = prev[chatId] ?? [];
                const nextMessages =
                  typeof updater === 'function' ? updater(current) : updater;
                return { ...prev, [chatId]: nextMessages };
              })
            }
            activePersonId={chatId}
            isChannel={isChannel}
            sendMessage={isChannel ? sendMessage : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;