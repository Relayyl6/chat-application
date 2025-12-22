import React from 'react'

const ChatBubble = ({ 
  message,
  timestamp,
  className
}: {
  message: string | undefined,
  timestamp: string,
  className: string
}) => {
  return (
    <div className={`relative flex flex-col gap-4 p-2 w-fit min-w-[150px] max-w-sm rounded-lg bg-white ${className}`}>
        <p className='font-stretch-normal font-normal font-sans text-black mb-1'>{message}</p>

        <p className="absolute bottom-0 right-2 text-gray-900 font-mono font-small text-[12px]">{timestamp}</p>
    </div>
  )
}

export default ChatBubble