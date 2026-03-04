"use client"

import React, { useEffect, useRef, useMemo, useState } from 'react'
import ChatHeader from '@/components/ChatHeader'
import ChatBubble from '@/components/ChatBubble'
import InputSection from '@/components/InputSection'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/useContext'
import { useMessages } from '@/hooks/useMessages'
import { socketActions } from '@/lib/socket'
import { DNA } from 'react-loader-spinner'

const Page = () => {
  const params = useParams();
  const chatId = params.id as string;
  const [searchResults, setSearchResults] = useState<typeof socketMessages>([]);

  const {
    messagesByChat,
    setMessagesByChat,
    people,
    channels,
  } = useAppContext();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentUserId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}').id
      : '';

  // ─── Detect channel type ──────────────────────────────────────────────────
  const channel = channels.find(c => c._id === chatId);
  const isChannel = Boolean(channel);
  const isGroup = channel?.type === 'group';
  const isDirect = channel?.type === 'direct';
  const person = !isChannel ? people.byId[chatId] : undefined;

  // ─── Socket-backed messages ───────────────────────────────────────────────
  const {
    messages: socketMessages,
    loading: socketLoading,
    sendMessage,
    searchMessages,
    editMessage,
    deleteMessage,
    reactToMessage,
  } = useMessages(isChannel ? chatId : null);

  // ─── DM messages from context ─────────────────────────────────────────────
  const dmMessages = useMemo(
    () => messagesByChat[chatId] ?? [],
    [messagesByChat, chatId]
  );

  useEffect(() => {
    if (isChannel) socketActions.joinChannel(chatId);
  }, [isChannel, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [socketMessages, dmMessages]);

  // ─── Per-sender colour for group chats ────────────────────────────────────
  const senderColors = ['bg-violet-500', 'bg-blue-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
  const senderColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    channel?.members.forEach((m, i) => {
      map[m.userId._id] = senderColors[i % senderColors.length];
    });
    return map;
  }, [channel]);

  // ─── Loading guard ────────────────────────────────────────────────────────
  if (!isChannel && !person) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <DNA height={80} width={80} visible ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass="" />
      </div>
    );
  }

  // ─── Derive header info ────────────────────────────────────────────────────
  const getTitle = () => {
    if (!isChannel) return person!.title;

    // Named group channel
    if (isGroup && channel!.name) return channel!.name;

    // Direct channel — show the other person's name
    if (isDirect) {
      const other = channel!.members.find(
        m => m.userId._id !== currentUserId
      );
      return other?.userId.username ?? 'Direct Message';
    }

    // Fallback: comma-separated member names
    return channel!.members
      .filter(u => u.userId._id !== currentUserId)
      .map(u => u.userId.username)
      .join(', ') || 'Chat';
  };

  const getSubTitle = () => {
    if (!isChannel) return person!.firstLine;

    if (isGroup) {
      const memberCount = channel!.members.length;
      return `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
    }

    if (isDirect) {
      const other = channel!.members.find(u => u.userId._id !== currentUserId);
      return other?.userId.status ?? 'offline';
    }

    return '';
  };

  const title = getTitle();
  const subTitle = getSubTitle();

  // ─── Colour map ───────────────────────────────────────────────────────────
  const aliasBgMap: Record<string, string> = {
    you: 'bg-violet-500',
    ai: 'bg-purple-500',
    me: 'bg-green-500',
  };

  return (
    <div className="flex flex-col p-2 gap-2 w-full h-full max-md:hidden rounded-xl">
      <ChatHeader
        title={title}
        subTitle={subTitle}
        id={chatId}
        isChannel={isChannel}
        onSearch={async (query) => {
          if (isChannel && searchMessages) {
            try {
              const results = await searchMessages(query);
              setSearchResults(results);
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

            {/* ─── Channel (group or direct) messages ──────────────────── */}
            {isChannel && (
              <>
                {socketLoading && !searchResults.length && (
                  <div className="flex justify-center py-4">
                    <DNA height={40} width={40} visible ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass="" />
                  </div>
                )}

                {(searchResults.length > 0 ? searchResults : socketMessages).map((msg) => {
                  const isMe = msg.senderId._id === currentUserId;
                  const bubbleColor = isMe
                    ? 'bg-green-500'
                    : isGroup
                      ? senderColorMap[msg.senderId._id] ?? 'bg-violet-500'
                      : 'bg-violet-500';

                  return (
                    <div
                      key={msg._id || msg.tempId}
                      className={`flex w-full px-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Show avatar/name for group messages from others */}
                      {isGroup && !isMe && (
                        <div className="flex flex-col items-center mr-2 mt-1">
                          <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                            {msg.senderId.username?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col max-w-[70%]">
                        {/* Sender name for group messages */}
                        {isGroup && !isMe && (
                          <span className="text-xs text-gray-400 mb-0.5 ml-1">
                            {msg.senderId.username}
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
              </>
            )}

            {/* ─── Legacy DM messages from context ─────────────────────── */}
            {!isChannel && dmMessages.map((t: MessageProps) => (
              <div
                key={t.timestamp as string}
                className={`flex w-full px-2 mb-1 ${t.alias === "me" ? "justify-start" : "justify-end"}`}
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