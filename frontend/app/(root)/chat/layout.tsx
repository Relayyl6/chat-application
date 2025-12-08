import React from 'react'
import ChatPreview from "@/components/ChatPreview"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-red-200 flex-1 rounded-tl-lg rounded-bl-lg p-2">
      <div className="flex flex-row flex-1 bg-gray-700 w-full h-[90vh] gap-2 rounded-xl rounded-bl-lg">
        <ChatPreview />
        <div className="flex w-full">
          {children}
        </div>
      </div>
    </main>
  )
}

export default Layout