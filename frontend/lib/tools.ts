export const getChannelAvatar = (channel: Channel, currentUserId: string): string => {
  if (channel.type === 'direct') {
    const other = channel.members.find(m => m.userId._id !== currentUserId);
    const username = other?.userId.username ?? 'User';
    return other?.userId.avatar 
      ?? `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}&size=128`;
  }

  // Group or channel
  const name = channel.name ?? 'Group';
  return channel.avatar 
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
};