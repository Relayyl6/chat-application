import React from 'react'

const ChatBubble = ({ message }: { message: string | undefined}) => {
  return (
    <div className='flex p-2 w-fit min-w-[150px] max-w-sm rounded-lg bg-white'>
        <p className='font-stretch-normal font-normal font-sans'>{message}</p>
    </div>
  )
}

export default ChatBubble