"use client"

import React, { useEffect, useRef, useMemo, useState } from 'react'
import ChatHeader from '@/components/ChatHeader'
import ChatBubble from '@/components/ChatBubble'
import InputSection from '@/components/InputSection'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/useContext'
import { useSocketContext } from '@/context/SocketContext'
import { useMessages } from '@/hooks/useMessages'
import { socketActions } from '@/lib/socket'
import { DNA } from 'react-loader-spinner'

const Page = () => {
  const params = useParams();
  const chatId = params.id as string;

  const {
    messagesByChat,
    setMessagesByChat,
    people,
    channels,
  } = useAppContext();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ─── Detect whether this ID belongs to a channel or a DM ─────────────────
  const channel = channels.find(c => c._id === chatId);
  const isChannel = Boolean(channel);
  const person = !isChannel ? people.byId[chatId] : undefined;

  // ─── Channel: use socket-backed useMessages hook ──────────────────────────
  const {
    messages: socketMessages,
    loading: socketLoading,
    sendMessage: _sendMessage, // not used directly — InputSection calls socketActions
  } = useMessages(isChannel ? chatId : null);

  // ─── DM: use existing context messages ────────────────────────────────────
  const dmMessages = useMemo(
    () => messagesByChat[chatId] ?? [],
    [messagesByChat, chatId]
  );

  // Join socket channel room when navigating to a channel
  useEffect(() => {
    if (isChannel) {
      socketActions.joinChannel(chatId);
    }
  }, [isChannel, chatId]);

  // Scroll to bottom on any new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [socketMessages, dmMessages]);

  // ─── Loading / not-found guards ────────────────────────────────────────────
  if (!isChannel && !person) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <DNA
          height={80}
          width={80}
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
          visible={true}
          ariaLabel='dna-loading'
        />
      </div>
    );
  }

  // ─── Derive header info ────────────────────────────────────────────────────
  const currentUserId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}').id
      : '';

  const title = isChannel
    ? channel!.name ??
      channel!.users
        .filter(u => u.userId.id !== currentUserId)
        .map(u => u.userId.username)
        .join(', ') ??
      'Chat'
    : person!.title;

  const subTitle = isChannel
    ? channel!.type === 'group' ? 'Group' : 'Direct Message'
    : person!.firstLine;

  // ─── Alias colour map for DM bubbles ──────────────────────────────────────
  const aliasBgMap: Record<user, string> = {
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
      />

      <div className="flex-1 min-h-0 h-full relative rounded-xl">
        <div className='w-full h-full gap-1 flex flex-col relative bg-bg-main pt-2 rounded-xl'>

          {/* ─── Message list ──────────────────────────────────────────────── */}
          <div className="overflow-y-auto no-scrollbar gap-2 flex-1 px-2">

            {/* Channel messages — from socket */}
            {isChannel && (
              <>
                {socketLoading && (
                  <div className="flex justify-center py-4">
                    <DNA height={40} width={40} visible ariaLabel='dna-loading' wrapperStyle={{}} wrapperClass="" />
                  </div>
                )}
                {socketMessages.map((msg) => {
                  const isMe = msg.senderId.id === currentUserId;
                  return (
                    <div
                      key={msg._id || msg.tempId}
                      className={`flex w-full px-2 mb-1 ${isMe ? 'justify-start' : 'justify-end'}`}
                    >
                      <ChatBubble
                        message={msg.content}
                        timestamp={msg.createdAt as unknown as Date}
                        className={isMe ? 'bg-green-500' : 'bg-violet-500'}
                      />
                    </div>
                  );
                })}
              </>
            )}

            {/* DM messages — from context */}
            {!isChannel && dmMessages.map((t: MessageProps) => (
              <div
                key={t.timestamp as string}
                className={`flex w-full px-2 mb-1 ${t.alias === "me" ? "justify-start" : "justify-end"}`}
              >
                <ChatBubble
                  message={t.text}
                  timestamp={t?.timestamp as unknown as Date}
                  className={`${aliasBgMap[t.alias as user] ?? 'bg-white'}`}
                />
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* ─── Input ─────────────────────────────────────────────────────── */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Page;