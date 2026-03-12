'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatBubbleProps {
  messageId?: string;
  message?: string;
  timestamp: Date | string | number;
  className?: string;
  isOwn?: boolean;
  channelId?: string;
  onEdit?: (content: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onReact?: (emoji: string) => Promise<void> | void;
  reactions?: Array<{ emoji: string; count: number; userIds: string[] }>;
}

export const formatTime = (date: Date | string | number): string => {
  if (typeof date === 'string' && date.includes(':')) {
    const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i;
    const match = date.match(timePattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const isPM = match[4]?.toUpperCase() === 'PM';
      if (isPM && hours !== 12) hours += 12;
      else if (!isPM && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }
  let dateObj: Date;
  if (date instanceof Date) dateObj = date;
  else if (typeof date === 'number') dateObj = date < 10000000000 ? new Date(date * 1000) : new Date(date);
  else dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '--:--';
  return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
};

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const ChatBubble = ({
  messageId,
  message,
  timestamp,
  className,
  isOwn = false,
  channelId,
  onEdit,
  onDelete,
  onReact,
  reactions = [],
}: ChatBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message || '');
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emojiRef = useRef<HTMLDivElement>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMovedRef = useRef(false); // cancel long press if finger moves

  // Sync editText when message prop updates (after socket confirms edit)
  useEffect(() => {
    if (!isEditing) setEditText(message || '');
  }, [message, isEditing]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentUserId =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')._id
      : '';

  // ─── Long press handlers (mobile) ──────────────────────────────────────
  const handleTouchStart = () => {
    touchMovedRef.current = false;
    longPressRef.current = setTimeout(() => {
      if (!touchMovedRef.current) setShowActions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const handleTouchMove = () => {
    touchMovedRef.current = true;
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  // ─── Actions ────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editText.trim() || !onEdit) return;
    setIsLoading(true);
    try {
      await onEdit(editText.trim());
      setIsEditing(false);
    } catch (e) {
      console.error('Edit failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReact = async (emoji: string) => {
    if (!onReact) return;
    setShowEmojiPicker(false);
    setShowActions(false);
    try {
      await onReact(emoji);
    } catch (e) {
      console.error('React failed:', e);
    }
  };

  return (
    <div
      className={`relative flex flex-col gap-1 p-2 w-fit min-w-[150px] max-w-sm rounded-lg ${className}`}
      // Desktop: hover to show actions
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
      // Mobile: long press to show actions
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Overlay to dismiss actions on mobile tap-outside */}
      {showActions && (
        <div
          className='fixed inset-0 z-30 md:hidden'
          onClick={() => { setShowActions(false); setShowEmojiPicker(false); }}
        />
      )}

      {/* Action toolbar */}
      {showActions && !isEditing && (
        <div className={`absolute -top-9 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 bg-gray-800 rounded-lg p-1 z-40 shadow-lg`}>
          <div className="relative" ref={emojiRef}>
            <button
              onClick={() => setShowEmojiPicker(p => !p)}
              title="React"
              className="text-white hover:bg-gray-700 rounded px-2 py-1 text-sm"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className={`absolute top-8 ${isOwn ? 'right-0' : 'left-0'} bg-white rounded-lg shadow-xl p-2 flex gap-1 z-50`}>
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="text-lg hover:scale-125 transition-transform px-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isOwn && (
            <>
              <button
                onClick={() => { setIsEditing(true); setShowActions(false); }}
                title="Edit"
                className="text-white hover:bg-gray-700 rounded px-2 py-1 text-sm"
                disabled={isLoading}
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                title="Delete"
                className="text-white hover:bg-red-600 rounded px-2 py-1 text-sm"
                disabled={isLoading}
              >
                {isLoading ? '...' : '🗑️'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Message content or edit input */}
      {isEditing ? (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') { setEditText(message || ''); setIsEditing(false); }
            }}
            className="bg-white text-black rounded px-2 py-1 text-sm w-full"
            autoFocus
          />
          <div className="flex gap-1">
            <button onClick={handleSaveEdit} disabled={isLoading}
              className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setEditText(message || ''); setIsEditing(false); }}
              className="bg-gray-500 text-white px-2 py-0.5 rounded text-xs hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="font-normal font-sans text-black mb-4 break-words">{message || ''}</p>
      )}

      {/* Reaction pills — tapping opens emoji picker on mobile too */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {reactions.map((reaction, idx) => {
            const hasReacted = Array.isArray(reaction.userIds) && reaction.userIds.includes(currentUserId);
            return (
              <button
                key={idx}
                onClick={() => {
                  // On mobile tap: open emoji picker to change/add reaction
                  setShowActions(true);
                  setShowEmojiPicker(true);
                }}
                onMouseUp={(e) => {
                  // On desktop: clicking pill re-sends same emoji (toggle) 
                  // only if it wasn't a long-press trigger
                  e.stopPropagation();
                  handleReact(reaction.emoji);
                }}
                className={`rounded-full px-2 py-0.5 text-xs border transition-colors
                  ${hasReacted
                    ? 'bg-blue-200 border-blue-400 text-blue-800'
                    : 'bg-gray-200 border-transparent hover:bg-gray-300'
                  }`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            );
          })}
        </div>
      )}

      <p className="absolute bottom-1 right-2 text-gray-700 font-mono text-[10px] opacity-70">
        {formatTime(timestamp)}
      </p>
    </div>
  );
};

export default ChatBubble;