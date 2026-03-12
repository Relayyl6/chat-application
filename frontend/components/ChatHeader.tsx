'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const ChatHeader = ({
    title,
    subTitle,
    id,
    onSearch,
    isChannel
}: Props & { onSearch?: (query: string) => void; isChannel?: boolean }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) onSearch(searchQuery);
  };

  return (
    <div className='flex justify-between items-center mx-auto px-2 py-1 md:px-2 md:py-1.5 w-full bg-black rounded-tr-lg isolate'>
      <div className='flex justify-center items-center gap-2'>

        {/* ← Back arrow — mobile only */}
        <button
          onClick={() => router.back()}
          className='md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-700 text-white shrink-0'
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className='aspect-square rounded-full bg-gray-700 size-10 shrink-0' />
        <div className='flex flex-col gap-0.5 h-full'>
          <p className='font-bold text-base leading-tight'>{title}</p>
          {subTitle && (
            <p className="text-sm font-normal truncate max-w-[200px] md:max-w-[400px]">{subTitle}</p>
          )}
        </div>
      </div>

      <div className='flex flex-row gap-1 items-center'>
        {isChannel && (
          <form onSubmit={handleSearch} className='flex items-center gap-1'>
            {showSearch && (
              <input
                type='text'
                placeholder='Search messages...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='bg-gray-700 text-white rounded px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 md:w-auto'
                autoFocus
              />
            )}
            <button
              type='button'
              onClick={() => setShowSearch(!showSearch)}
              title='Search messages'
              className='bg-gray-800 hover:bg-gray-600 py-2 px-3 rounded-md text-lg'
            >
              🔍
            </button>
          </form>
        )}

        {id && (
          <div className="hidden md:flex border border-black relative">
            <p className='bg-gray-800 py-2 px-3 hover:bg-gray-600 rounded-l-md cursor-pointer'>👥</p>
            <div className='w-px h-8/12 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white' />
            <p className='bg-gray-800 py-2 px-3 hover:bg-gray-600 rounded-r-md cursor-pointer'>⚙️</p>
          </div>
        )}
        <p className='hidden md:flex hover:bg-gray-600 py-2 px-3 justify-center items-center border-none rounded-md cursor-pointer text-lg'>☎️</p>
      </div>
    </div>
  )
}

export default ChatHeader