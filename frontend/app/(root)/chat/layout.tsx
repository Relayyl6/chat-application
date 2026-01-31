// import { ChatPreview } from '@/components/ClientChatPreview'
import { ChatPreview } from '@/components/SSRaugmentations/ClientChatPreview'
import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-bg-inner min-h-0 flex-1 rounded-tl-lg rounded-bl-lg p-2">
      <div className="flex flex-row h-full md:bg-bg-main w-full gap-2 rounded-xl rounded-bl-lg">
        <ChatPreview />
        <div className="flex w-full min-h-0">
          {children}
        </div>
      </div>
    </main>
  )
}

export default Layout