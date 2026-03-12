'use client';

import { useEffect, useState } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { socketActions } from '@/lib/socket';

export const useMessages = (channelId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const { socket } = useSocketContext();

  // ─── Load messages when channel changes ──────────────────────────────────
  useEffect(() => {
    if (!channelId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const msgs = await api.getMessages(channelId, 1, 50);
        setMessages(msgs);
        setPage(1);
        if (msgs.length > 0) await api.markMessagesAsRead(channelId);
      } catch (error) {
        console.error('[useMessages] Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [channelId]);

  // ─── Socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId || !socket) return;

    console.log(`[useMessages] Attaching socket listeners for channel: ${channelId}`);

    const onMessageSent = (message: any) => {
      if (message.channelId !== channelId) return;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const isOwnMessage = message.senderId?._id === currentUser._id || 
                           message.senderId === currentUser._id;
      setMessages(prev => {
        // Already have this DB message (own message replaced via HTTP) — ignore
        if (message._id && prev.some(m => m._id === message._id)) return prev;
        // Own message with tempId match — replace optimistic
        if (isOwnMessage && message.tempId && prev.some(m => m.tempId === message.tempId)) {
          return prev.map(m =>
            m.tempId === message.tempId ? { ...message, status: 'sent' } : m
          );
        }
        // Someone else's message — append
        if (!isOwnMessage) return [...prev, { ...message, status: 'sent' }];
        // Own message but no tempId match — ignore (HTTP already handled it)
        return prev;
      });
      api.markMessagesAsRead(channelId).catch(() => {});
    };

    // FIX 1: server emits { channelId, messageId, content, updatedAt }
    // Update by messageId, not by trying to use updated.content from HTTP
    const onMessageEdited = (data: any) => {
      if (data.channelId !== channelId) return;
      setMessages(prev =>
        prev.map(m => m._id === data.messageId
          ? { ...m, content: data.content, updatedAt: data.updatedAt }
          : m
        )
      );
    };

    const onMessageDeleted = (data: any) => {
      if (data.channelId !== channelId) return;
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    };

    // Server now sends fully grouped reactions array — just replace directly
    const onMessageReactionAdded = (data: any) => {
      if (data.channelId !== channelId) return;
      setMessages(prev =>
        prev.map(m => m._id === data.messageId
          ? { ...m, reactions: data.reactions }
          : m
        )
      );
    };

    const onMessagesRead = (data: any) => {
      if (data.channelId !== channelId) return;
      setMessages(prev =>
        prev.map(m => ({ ...m, readBy: data.readBy ?? m.readBy }))
      );
    };

    socket.on('message:sent',           onMessageSent);
    socket.on('message:edited',         onMessageEdited);
    socket.on('message:deleted',        onMessageDeleted);
    socket.on('message:reaction-added', onMessageReactionAdded);
    socket.on('messages:read',          onMessagesRead);

    return () => {
      socket.off('message:sent',           onMessageSent);
      socket.off('message:edited',         onMessageEdited);
      socket.off('message:deleted',        onMessageDeleted);
      socket.off('message:reaction-added', onMessageReactionAdded);
      socket.off('messages:read',          onMessagesRead);
    };
  }, [channelId, socket]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  let messageCounter = 0;

  const sendMessage = async (content: string, attachments?: any[], replyTo?: string) => {
    if (!channelId) return;
    const tempId = Date.now();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    messageCounter += 1;
    const optimisticMessage: Message = {
      _id: '',
      channelId,
      senderId: currentUser,
      content,
      type: attachments?.length ? 'file' : 'text',
      autoId: messageCounter,
      readBy: [currentUser._id],
      deliveredTo: [currentUser._id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sending',
      tempId,
      attachments,
      replyTo,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Always persist via HTTP and replace optimistic immediately from response
      const saved = await api.sendMessage(channelId, content, attachments, replyTo, tempId);
      if (saved) {
        setMessages(prev => prev.map(m =>
          m.tempId === tempId ? { ...saved, status: 'sent', tempId } : m
        ));
      }
    } catch (error) {
      console.error('[useMessages] Failed to send message:', error);
      // Mark optimistic as failed
      setMessages(prev => prev.map(m =>
        m.tempId === tempId ? { ...m, status: 'failed' } : m
      ));
    }
  };

  // FIX 1: don't update state from HTTP response — let the socket event do it.
  // HTTP call just persists to DB; socket broadcast updates all clients including sender.
  const editMessage = async (messageId: string, content: string) => {
    if (!channelId) return;
    try {
      await api.editMessage(channelId, messageId, content);
      // Don't touch messages state here — onMessageEdited socket handler will fire
      // and update the content for all clients including the editor.
    } catch (error) {
      console.error('[useMessages] Failed to edit message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!channelId) return;
    try {
      await api.deleteMessage(channelId, messageId);
      // onMessageDeleted socket handler will fire and remove from state
    } catch (error) {
      console.error('[useMessages] Failed to delete message:', error);
      throw error;
    }
  };

  // FIX 4: HTTP call persists; socket event updates state for all clients.
  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!channelId) return;
    try {
      await api.reactToMessage(channelId, messageId, emoji);
      // onMessageReactionAdded socket handler updates state locally
    } catch (error) {
      console.error('[useMessages] Failed to react to message:', error);
      throw error;
    }
  };

  const searchMessages = async (query: string) => {
    if (!channelId) return [];
    try {
      return await api.searchMessages(channelId, query, 1, 50);
    } catch (error) {
      console.error('[useMessages] Failed to search messages:', error);
      throw error;
    }
  };

  const loadMoreMessages = async () => {
    if (!channelId || messages.length === 0) return;
    try {
      const nextPage = page + 1;
      const older = await api.getMessages(channelId, nextPage, 50);
      if (older.length > 0) {
        setMessages(prev => [...older, ...prev]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('[useMessages] Failed to load more messages:', error);
    }
  };

  return { messages, loading, sendMessage, editMessage, deleteMessage, reactToMessage, searchMessages, loadMoreMessages };
};