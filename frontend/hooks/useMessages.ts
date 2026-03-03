'use client';

import { useEffect, useState } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { socketActions } from '@/lib/socket';

export const useMessages = (channelId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { 
    onMessageSent, 
    onMessageEdited, 
    onMessageDeleted, 
    onMessageReactionAdded, 
    onMessagesRead 
  } = useSocketContext();

  // Load messages when channel changes
  useEffect(() => {
    if (!channelId) {
      console.log('[useMessages] No channelId provided');
      return;
    }

    console.log(`[useMessages] Loading messages for channel: ${channelId}`);
    
    const loadMessages = async () => {
      setLoading(true);
      try {
        console.log(`[useMessages] Fetching messages for channelId: ${channelId}`);
        const msgs = await api.getMessages(channelId, 1, 50);
        console.log(`[useMessages] Fetched ${msgs.length} messages`, msgs);
        setMessages(msgs);
        setPage(1);
        
        // Mark as read
        if (msgs.length > 0) {
          console.log(`[useMessages] Marking ${msgs.length} messages as read`);
          await api.markMessagesAsRead(channelId);
        }
      } catch (error) {
        console.error('[useMessages] Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [channelId]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!channelId) {
      console.log('[useMessages] No channelId for socket listeners');
      return;
    }

    console.log(`[useMessages] Setting up socket listeners for channel: ${channelId}`);

    const unsubscribeNew = onMessageSent((message) => {
      console.log('[useMessages] onMessageSent event received:', message);
      if (message.channelId === channelId) {
        console.log(`[useMessages] Adding new message to channel ${channelId}`);
        setMessages((prev) => {
          const updated = [...prev, message];
          console.log(`[useMessages] Messages count after add: ${updated.length}`);
          return updated;
        });
        
        // Mark as read if viewing this channel
        api.markMessagesAsRead(channelId);
      } else {
        console.log(`[useMessages] Message is for different channel: ${message.channelId} vs ${channelId}`);
      }
    });

    const unsubscribeEdited = onMessageEdited((data) => {
      console.log('[useMessages] onMessageEdited event received:', data);
      if (data.channelId === channelId) {
        console.log(`[useMessages] Editing message ${data.messageId} in channel ${channelId}`);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId ? { ...msg, content: data.content, updatedAt: data.updatedAt } : msg
          )
        );
      }
    });

    const unsubscribeDeleted = onMessageDeleted((data) => {
      console.log('[useMessages] onMessageDeleted event received:', data);
      if (data.channelId === channelId) {
        console.log(`[useMessages] Deleting message ${data.messageId} from channel ${channelId}`);
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
      }
    });

    const unsubscribeReaction = onMessageReactionAdded((data) => {
      console.log('[useMessages] onMessageReactionAdded event received:', data);
      if (data.channelId === channelId) {
        console.log(`[useMessages] Adding reaction to message ${data.messageId} in channel ${channelId}`);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, reactions: data.reactions }
              : msg
          )
        );
      }
    });

    const unsubscribeRead = onMessagesRead((data) => {
      console.log('[useMessages] onMessagesRead event received:', data);
      if (data.channelId === channelId) {
        console.log(`[useMessages] Updating read status for message ${data.messageId} in channel ${channelId}`);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, readBy: data.readBy }
              : msg
          )
        );
      }
    });

    return () => {
      console.log(`[useMessages] Cleaning up socket listeners for channel: ${channelId}`);
      unsubscribeNew();
      unsubscribeEdited();
      unsubscribeDeleted();
      unsubscribeReaction();
      unsubscribeRead();
    };
  }, [channelId, onMessageSent, onMessageEdited, onMessageDeleted, onMessageReactionAdded, onMessagesRead]);

  const sendMessage = (content: string, attachments?: any[], replyTo?: string) => {
    if (!channelId) {
      console.log('[useMessages] Cannot send message: no channelId');
      return;
    }

    console.log(`[useMessages] Sending message to channel ${channelId}:`, { content, attachments, replyTo });
    
    const tempId = Date.now();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Optimistic update
    const optimisticMessage: Message = {
      _id: '',
      channelId,
      senderId: currentUser,
      content,
      type: attachments && attachments.length > 0 ? 'file' : 'text',
      readBy: [currentUser.id],
      deliveredTo: [currentUser.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sending',
      tempId,
      attachments,
      replyTo
    };

    setMessages((prev) => {
      const updated = [...prev, optimisticMessage];
      console.log(`[useMessages] Optimistic update: messages count now ${updated.length}`);
      return updated;
    });

    // Send via socket
    socketActions.sendMessage(channelId, content, attachments, replyTo);
  };

  const editMessage = async (messageId: string, content: string) => {
    if (!channelId) {
      console.log('[useMessages] Cannot edit message: no channelId');
      return;
    }

    console.log(`[useMessages] Editing message ${messageId} in channel ${channelId}`);

    try {
      const updated = await api.editMessage(channelId, messageId, content);
      console.log('[useMessages] Message edited successfully:', updated);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, content: updated.content, updatedAt: updated.updatedAt } : msg
        )
      );
      socketActions.editMessage(channelId, messageId, content);
      return updated;
    } catch (error) {
      console.error('[useMessages] Failed to edit message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!channelId) {
      console.log('[useMessages] Cannot delete message: no channelId');
      return;
    }

    console.log(`[useMessages] Deleting message ${messageId} from channel ${channelId}`);

    try {
      await api.deleteMessage(channelId, messageId);
      console.log('[useMessages] Message deleted successfully');
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      socketActions.deleteMessage(channelId, messageId);
    } catch (error) {
      console.error('[useMessages] Failed to delete message:', error);
      throw error;
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!channelId) {
      console.log('[useMessages] Cannot react to message: no channelId');
      return;
    }

    console.log(`[useMessages] Adding reaction ${emoji} to message ${messageId} in channel ${channelId}`);

    try {
      const updated = await api.reactToMessage(channelId, messageId, emoji);
      console.log('[useMessages] Reaction added successfully:', updated);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: updated.reactions } : msg
        )
      );
      socketActions.reactToMessage(channelId, messageId, emoji);
      return updated;
    } catch (error) {
      console.error('[useMessages] Failed to react to message:', error);
      throw error;
    }
  };

  const searchMessages = async (query: string) => {
    if (!channelId) {
      console.log('[useMessages] Cannot search messages: no channelId');
      return [];
    }

    console.log(`[useMessages] Searching messages in channel ${channelId} for query: "${query}"`);

    try {
      const results = await api.searchMessages(channelId, query, 1, 50);
      console.log(`[useMessages] Search returned ${results.length} results`);
      return results;
    } catch (error) {
      console.error('[useMessages] Failed to search messages:', error);
      throw error;
    }
  };

  const loadMoreMessages = async () => {
    if (!channelId || messages.length === 0) {
      console.log('[useMessages] Cannot load more messages:', { hasChannelId: !!channelId, messageCount: messages.length });
      return;
    }

    console.log(`[useMessages] Loading more messages for channel ${channelId}, current page: ${page}`);

    try {
      const nextPage = page + 1;
      const olderMessages = await api.getMessages(channelId, nextPage, 50);
      console.log(`[useMessages] Loaded ${olderMessages.length} older messages from page ${nextPage}`);
      
      if (olderMessages.length > 0) {
        setMessages((prev) => {
          const updated = [...olderMessages, ...prev];
          console.log(`[useMessages] Total messages after loadMore: ${updated.length}`);
          return updated;
        });
        setPage(nextPage);
      } else {
        console.log('[useMessages] No more messages to load');
      }
    } catch (error) {
      console.error('[useMessages] Failed to load more messages:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    searchMessages,
    loadMoreMessages
  };
};