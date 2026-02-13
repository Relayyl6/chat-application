
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SocketProvider } from '@/context/SocketContext';
import { useChannels } from '@/hooks/useChannels';
import { useMessages } from '@/hooks/useMessages';
import { socketActions } from '@/lib/socket';
import ChannelList from './ChannelList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatContent() {
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const { channels, loading: channelsLoading } = useChannels();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(currentChannelId);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !currentChannelId) {
      setCurrentChannelId(channels[0]._id);
    }
  }, [channels, currentChannelId]);

  // Join channel socket room when selected
  useEffect(() => {
    if (currentChannelId) {
      socketActions.joinChannel(currentChannelId);
    }
  }, [currentChannelId]);

  const handleSelectChannel = (channelId: string) => {
    setCurrentChannelId(channelId);
  };

  return (
    <div className="flex h-screen">
      <ChannelList
        channels={channels}
        activeChannelId={currentChannelId}
        onSelectChannel={handleSelectChannel}
      />
      
      <div className="flex flex-1 flex-col">
        {currentChannelId ? (
          <>
            <MessageList messages={messages} loading={messagesLoading} />
            <MessageInput channelId={currentChannelId} onSendMessage={sendMessage} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <SocketProvider>
      <ChatContent />
    </SocketProvider>
  );
}
