
'use client';

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelList({ channels, activeChannelId, onSelectChannel }: ChannelListProps) {
  return (
    <div className="h-full w-64 border-r bg-gray-50">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">Channels</h2>
      </div>
      
      <div className="overflow-y-auto">
        {channels.map((channel) => (
          <div
            key={channel._id}
            onClick={() => onSelectChannel(channel._id)}
            className={`cursor-pointer border-b p-4 hover:bg-gray-100 ${
              activeChannelId === channel._id ? 'bg-blue-100' : ''
            }`}
          >
            <div className="font-semibold">
              {channel.name || 'Direct Message'}
            </div>
            {channel.lastMessage && (
              <div className="truncate text-sm text-gray-600">
                {channel.lastMessage.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}