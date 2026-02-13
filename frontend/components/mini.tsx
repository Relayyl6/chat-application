"use client"

import { useAppContext } from '@/context/useContext';
import { useMemo } from 'react';
import { formatTime } from './ChatBubble';

const Mini = ({
  id: chatId,
  time,
  date
}: {
  id: string,
  time?: boolean | undefined,
  date?: string | Date
}) => {
    const { messagesByChat } = useAppContext();
    const messages = useMemo(() => messagesByChat[chatId] ?? [],
      [messagesByChat, chatId]
    )

    const lastMsg = messages.at(-1)?.text;
    const lastTime = messages.at(-1)?.timestamp;

    // Show time if available and time=true, otherwise show date
    if (time && lastTime) {
        return <p className='text-xs text-gray-500'>{formatTime(lastTime)}</p>
    }
    
    // Show last message text
    if (!time && lastMsg) {
        return <p className='text-sm text-gray-600 truncate'>{lastMsg}</p>
    }
    
    // Fallback to showing the date
    return (
        <p>
            {date ? new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }) : <p className="text-xs">No date</p>}
        </p>
    )
}

export default Mini