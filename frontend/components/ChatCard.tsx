import Link from 'next/link'
import React from 'react'
import Mini from './mini'

const ChatCard = ({ name, date, id, avatar, lastMessage, unreadCount }: ChatCardProps) => {
  return (
    <Link
      href={`/chat/chatsection/${id}`}
      className='px-2 py-2 backdrop-blur-sm hover:bg-gray-500 border border-border-subtle rounded-md flex flex-row items-center justify-start gap-2 w-full max-w-[350px] box-border flex-1'
    >
      {/* ✅ Avatar — real image or fallback initial */}
      <div className='aspect-square rounded-full size-12 bg-gray-600 overflow-hidden shrink-0'>
        {avatar ? (
          <img src={avatar} alt={name} className='w-full h-full object-cover' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-white font-bold text-lg'>
            {name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <div className='flex flex-col gap-0.5 h-fit w-full min-w-0'>
        {/* Name + timestamp */}
        <div className='flex justify-between gap-2 w-full'>
          <h4 className='text-sm leading-6 font-semibold text-black truncate grow'>{name}</h4>
          <span className='text-xs text-gray-500 shrink-0'>
            <Mini id={id} time={true} date={date} />
          </span>
        </div>

        {/* Last message + unread badge */}
        <div className='flex flex-row justify-between items-center gap-2'>
          <p className='text-xs text-gray-500 truncate grow'>
            {lastMessage || 'No messages yet'}
          </p>
          {unreadCount && unreadCount > 0 ? (
            <span className='bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default ChatCard;