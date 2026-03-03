"use client"

import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import apiHandling from './apiHandling';
import { useAppContext } from '@/context/useContext';
import { socketActions } from '@/lib/socket';
import { DNA } from 'react-loader-spinner';

const InputSection = ({
  message,
  setMessage,
  activePersonId,
  isChannel = false,
  sendMessage,
}: InputProps) => {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const { aiChatMessage, setPeople } = useAppContext();

  // Updates the people sidebar preview for DM chats
  const onNewMessage = (personId: string, text: string) => {
    setPeople(prev => {
      const person = prev.byId[personId];
      if (!person) {
        console.warn("onNewMessage called with invalid ID:", personId);
        return prev;
      }

      const newMessage: MessageProps = {
        alias: "me",
        text,
        timestamp: Date.now()
      };

      const prevMessages = person.message ?? [];

      return {
        byId: {
          ...prev.byId,
          [personId]: {
            ...person,
            message: [...prevMessages, newMessage]
          }
        },
        order: [
          activePersonId,
          ...prev.order.filter(id => id !== activePersonId)
        ]
      };
    });
  };

  const addItem = async () => {
    if (!text.trim()) return;

    // ── Channel path: use hook-based sendMessage with optimistic updates ────────
    if (isChannel) {
      if (sendMessage) {
        sendMessage(text.trim());
      }
      setText('');
      return;
    }

    // ── DM path: existing apiHandling logic (unchanged) ──────────────────────
    const userMessage: MessageProps = {
      alias: "me",
      timestamp: Date.now(),
      text,
    };

    setMessage((prev: MessageProps[]) => [...prev, userMessage]);
    onNewMessage(activePersonId, text);
    setIsLoading(true);

    try {
      const response = await apiHandling<GenerateResponse>('/generate', 'POST', {
        message: text,
      });

      const alias = aiChatMessage ? 'ai' : 'you';

      const replyMessage: MessageProps = {
        alias,
        text: response.result,
        timestamp: Date.now(),
      };

      setMessage((prev: MessageProps[]) => [...prev, replyMessage]);
    } catch (error: unknown) {
      console.error('An error occurred:', error);

      let errText = 'An unexpected error occurred';
      if (error instanceof Error) errText = error.message;

      const errorMessage: MessageProps = {
        alias: 'you',
        text: `Error: ${errText}`,
        timestamp: Date.now(),
      };

      setMessage((prev: MessageProps[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addItem();
    }
  };

  const handleAttachmentClick = () => {
    // Future: open file picker for attachments
    setShowAttachments(!showAttachments);
  };

  return (
    <div className='w-full p-4 px-5 flex flex-col bg-transparent gap-2 rounded-br-xl'>
      {/* Attachment preview (placeholder for future implementation) */}
      {showAttachments && (
        <div className='bg-gray-100 rounded p-2 text-sm text-gray-600'>
          <p>📎 Attachment support coming soon</p>
        </div>
      )}

      <div className='flex flex-row gap-2 items-center'>
        {/* Attachment button */}
        {isChannel && (
          <button
            onClick={handleAttachmentClick}
            title='Attach file'
            className='text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded'
          >
            📎
          </button>
        )}

        {/* Message input */}
        <input
          value={text}
          placeholder={isChannel ? "Type a message... (Shift+Enter for new line)" : "Input your chat message"}
          className="
            text-black placeholder:text-gray-600 bg-bg-inner outline-none w-full py-2 px-3 rounded-full font-medium text-xl
            transition-transform duration-150 ease-out
            focus:scale-102 focus:-translate-y-0.5 focus:shadow-md
          "
          onChange={(event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Send button */}
        <button
          onClick={addItem}
          disabled={isLoading || !text.trim()}
          className="bg-btn-light-text px-3 rounded-lg hover:brightness-75 focus:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isLoading ? (
            <p>Send</p>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <DNA
                height={30}
                width={30}
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
                visible={true}
                ariaLabel='dna-loading'
              />
            </div>
          )}
        </button>
      </div>

      {/* Channel-specific help text */}
      {isChannel && (
        <p className='text-xs text-gray-500'>💡 Hover over messages to edit, delete, or add reactions</p>
      )}
    </div>
  );
};

export default InputSection;