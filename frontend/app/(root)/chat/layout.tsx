"use client"

import { ChatPreview } from '@/components/SSRaugmentations/ClientChatPreview'
import React from 'react'
import { usePathname } from 'next/navigation'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  // hasChatSelected = true when URL is /chat/chatsection/[id]
  // i.e. pathname has more than just /chat
  const hasChatSelected = pathname !== '/chat' && pathname.includes('/chatsection/');

  return (
    <main className="bg-bg-inner min-h-0 flex-1 rounded-tl-lg rounded-bl-lg p-2">
      <div className="flex flex-row h-full md:bg-bg-main w-full gap-2 rounded-xl rounded-bl-lg">

        {/* Preview: always on desktop, hidden on mobile when chat is open */}
        <div className={`${hasChatSelected ? 'hidden md:flex' : 'flex'} w-full md:w-auto shrink-0`}>
          <ChatPreview />
        </div>

        {/* Chat: always on desktop, only shows on mobile when chat is open */}
        <div className={`${hasChatSelected ? 'flex' : 'hidden md:flex'} w-full min-h-0 overflow-hidden`}>
          {children}
        </div>

      </div>
    </main>
  )
}

export default Layout