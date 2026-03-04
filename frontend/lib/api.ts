const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chat-app-backend-5rha.onrender.com';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // ===== AUTHENTICATION =====
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Login failed');
    return data.data;
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Registration failed');
    return data.data;
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/api/auth/current`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data.data;
  },

  async updateProfile(username: string, avatar?: string) {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, avatar })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    return data.data;
  },

  async changeStatus(status: 'online' | 'offline' | 'away') {
    const response = await fetch(`${API_URL}/api/auth/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to change status');
    return data.data;
  },

  // ===== CHANNELS =====
  async getChannels() {
    const response = await fetch(`${API_URL}/api/channels`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch channels');
    return data.data;
  },

  async createChannel(type: 'direct' | 'group' | 'channel', name: string, userIds: string[], description?: string, avatar?: string) {
    const response = await fetch(`${API_URL}/api/channels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, name, userIds, description, avatar })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create channel');
    return data.data;
  },

  async getChannel(channelId: string) {
    const response = await fetch(`${API_URL}/api/channels/${channelId}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch channel');
    return data.data;
  },

  async renameChannel(channelId: string, name: string) {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/rename`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to rename channel');
    return data.data;
  },

  async searchChannels(query: string) {
    const response = await fetch(`${API_URL}/api/channels/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to search channels');
    return data.data;
  },

  // ===== CHANNEL MEMBERS =====
  async addMembers(channelId: string, userIds: string[]) {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/add-members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add members');
    return data.data;
  },

  async removeMember(channelId: string, userId: string) {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/${userId}/remove-member`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to remove member');
    return data.data;
  },

  async leaveChannel(channelId: string) {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to leave channel');
    return data.data;
  },

  async getChannelMembers(channelId: string) {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/members`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch members');
    return data.data;
  },

  async updateMemberRole(channelId: string, memberId: string, role: 'admin' | 'member') {
    const response = await fetch(`${API_URL}/api/channels/${channelId}/members/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, role })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update member role');
    return data.data;
  },

  // ===== MESSAGES =====
  async getMessages(channelId: string, page: number = 1, limit: number = 50) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');
    return data.data;
  },

  async sendMessage(channelId: string, content: string, attachments?: any[], replyTo?: string) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, attachments, replyTo })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    return data.data;
  },

  async markMessagesAsRead(channelId: string) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark messages as read');
    return data.data;
  },

  async editMessage(channelId: string, messageId: string, content: string) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}/${messageId}/edit`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to edit message');
    return data.data;
  },

  async deleteMessage(channelId: string, messageId: string) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}/${messageId}/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete message');
    return data.data;
  },

  async reactToMessage(channelId: string, messageId: string, emoji: string) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}/${messageId}/react`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add reaction');
    return data.data;
  },

  async searchMessages(channelId: string, query: string, page: number = 1, limit: number = 50) {
    const response = await fetch(`${API_URL}/api/messages/${channelId}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to search messages');
    return data.data;
  }
};