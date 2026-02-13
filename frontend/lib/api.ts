const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // Channels
  async getChannels() {
    const response = await fetch(`${API_URL}/channels`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch channels');
    return data;
  },

  async createChannel(type: 'direct' | 'group', name: string, userIds: string[], description?: string) {
    const response = await fetch(`${API_URL}/channels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, name, userIds, description })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getChannelDetails(channelId: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Messages
  async getMessages(channelId: string, before?: number, limit = 50) {
    let url = `${API_URL}/messages/${channelId}?limit=${limit}`;
    if (before) url += `&before=${before}`;

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async markMessagesAsRead(channelId: string, messageAutoId: number) {
    const response = await fetch(`${API_URL}/messages/${channelId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messageAutoId })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Channel Members
  async addMembers(channelId: string, userIds: string[]) {
    const response = await fetch(`${API_URL}/channels/${channelId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async removeMember(channelId: string, userId: string) {
    const response = await fetch(`${API_URL}/channels/${channelId}/members`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  }
};