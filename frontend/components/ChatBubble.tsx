import React from 'react'

const ChatBubble = ({ message, className }: { message: string | undefined, className: string}) => {
  return (
    <div className={`flex p-2 w-fit min-w-[150px] max-w-sm rounded-lg bg-white ${className}`}>
        <p className='font-stretch-normal font-normal font-sans'>{message}</p>
    </div>
  )
}

export default ChatBubble