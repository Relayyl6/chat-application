import Link from 'next/link'
import React from 'react'

interface ChatCardProps {
    name: string,
    firstLine: string,
    date: string,
    id?: number
}

const ChatCard = ({ name, firstLine, date, id }: ChatCardProps) => {
  return (
    <Link href={`/chat/chatsection/${id}`} className='px-1 py-1 backdrop-blur-sm hover:bg-gray-500 rounded-md flex flex-row items-center justify-start gap-2 w-full max-w-[350px] box-border flex-1'>
        <div className='aspect-square rounded-full size-14 bg-gray-600' />
        <div className='flex flex-col gap-1 h-fit w-full'>
            <div className='flex justify-between gap-2 w-full line-clamp-1'>
                <h4 className='text-14 leading-6 font-semibold text-black truncate grow'>{name}</h4>
                <h3 className='text-base font-sans text-gray-700 flex justify-end shrink-0'>{new Date(date).toLocaleDateString("en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                })}
                </h3>
            </div>
            <div className='flex flex-row justify-between items-center gap-2'>
                <h3 className='text-base font-mono truncate w-full max-w-[200px]'>{firstLine}</h3>
                <p className='p-1 flex items-center justify-center'>X</p>
            </div>
        </div>
    </Link>
  )
}

export default ChatCard