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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Login failed');
    return data;
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Registration failed');
    return data;
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/current`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data;
  },

  async updateProfile(username: string, avatar?: string) {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, avatar })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async changeStatus(status: 'online' | 'offline' | 'away') {
    const response = await fetch(`${API_URL}/auth/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to change status');
    return data;
  },

  // ===== CHANNELS =====
  async getChannels() {
    const response = await fetch(`${API_URL}/channels`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch channels');
    return data;
  },

  async createChannel(type: 'direct' | 'group' | 'channel', name: string, userIds: string[], description?: string, avatar?: string) {
    const response = await fetch(`${API_URL}/channels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, name, userIds, description, avatar })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create channel');
    return data;
  },

  async getChannel(channelId: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch channel');
    return data;
  },

  async renameChannel(channelId: string, name: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}/rename`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to rename channel');
    return data;
  },

  async searchChannels(query: string) {
    const response = await fetch(`${API_URL}/channels/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to search channels');
    return data;
  },

  // ===== CHANNEL MEMBERS =====
  async addMembers(channelId: string, userIds: string[]) {
    const response = await fetch(`${API_URL}/channels/${channelId}/add-members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add members');
    return data;
  },

  async removeMember(channelId: string, userId: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}/${userId}/remove-member`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to remove member');
    return data;
  },

  async leaveChannel(channelId: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to leave channel');
    return data;
  },

  async getChannelMembers(channelId: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}/members`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch members');
    return data;
  },

  async updateMemberRole(channelId: string, memberId: string, role: 'admin' | 'member') {
    const response = await fetch(`${API_URL}/channels/${channelId}/members/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, role })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update member role');
    return data;
  },

  // ===== MESSAGES =====
  async getMessages(channelId: string, page: number = 1, limit: number = 50) {
    const response = await fetch(`${API_URL}/messages/${channelId}?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');
    return data;
  },

  async sendMessage(channelId: string, content: string, attachments?: any[], replyTo?: string) {
    const response = await fetch(`${API_URL}/messages/${channelId}/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, attachments, replyTo })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  async markMessagesAsRead(channelId: string) {
    const response = await fetch(`${API_URL}/messages/${channelId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark messages as read');
    return data;
  },

  async editMessage(channelId: string, messageId: string, content: string) {
    const response = await fetch(`${API_URL}/messages/${channelId}/${messageId}/edit`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to edit message');
    return data;
  },

  async deleteMessage(channelId: string, messageId: string) {
    const response = await fetch(`${API_URL}/messages/${channelId}/${messageId}/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete message');
    return data;
  },

  async reactToMessage(channelId: string, messageId: string, emoji: string) {
    const response = await fetch(`${API_URL}/messages/${channelId}/${messageId}/react`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add reaction');
    return data;
  },

  async searchMessages(channelId: string, query: string, page: number = 1, limit: number = 50) {
    const response = await fetch(`${API_URL}/messages/${channelId}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to search messages');
    return data;
  }
};