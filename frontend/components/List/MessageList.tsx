
'use client';

import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading messages...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isMyMessage = message.senderId.id === currentUser.id;

        return (
          <div
            key={message._id || message.tempId}
            className={`mb-4 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 ${
                isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {!isMyMessage && (
                <div className="mb-1 text-xs font-semibold">{message.senderId.username}</div>
              )}
              <div>{message.content}</div>
              <div className="mt-1 text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
                {message.status === 'sending' && ' • Sending...'}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}