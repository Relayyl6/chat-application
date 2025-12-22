"use client"

import { useMemo } from 'react'
import { useAppContext } from '@/context/useContext';
import Mini from './mini';

const Messages = ({
  id: chatId
}: {
  id: number
}) => {
    // const [ lastMsg, setLastMsg ] = useState<string | undefined>(undefined);
    const { messagesByChat } = useAppContext();
    const messages = useMemo(() => messagesByChat[chatId] ?? [],
      [messagesByChat, chatId]
    )
    const lastMsg = messages.at(-1)?.text;

  return (
    <div>
        {lastMsg ? (
            <h3 className='text-base font-mono truncate w-full max-w-[200px]'>
              <Mini id={chatId} time={false} />
            </h3>
        ) : (
            <h3 className='text-base font-mono truncate w-full max-w-[200px]'>
                No data provided
            </h3>
        )}
    </div>
  )
}

export default Messages