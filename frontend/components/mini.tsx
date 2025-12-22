"use client"

import { useAppContext } from '@/context/useContext';
import { useMemo } from 'react';

const Mini = ({
  id: chatId,
  time,
  date
}: {
  id: number,
  time?: boolean | undefined,
  date?: string
}) => {
    const { messagesByChat } = useAppContext();
    const messages = useMemo(() => messagesByChat[chatId] ?? [],
      [messagesByChat, chatId]
    )

    const lastMsg = messages.at(-1)?.text;
    const lastTime = messages.at(-1)?.timestamp;

    // Show time if available and time=true, otherwise show date
    if (time && lastTime) {
        return <p>{lastTime}</p>
    }
    
    if (!time && lastMsg) {
        return <p>{lastMsg}</p>
    }
    
    // Fallback to showing the date
    return (
        <p>
            {date ? new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }) : 'No date'}
        </p>
    )
}

export default Mini