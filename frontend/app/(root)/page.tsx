import React from 'react'
import ChatScreen from '../screens/CallScreen'

const Page = () => {
  return (
    <main className="absolute left-15 min-h-screen bg-red-200 w-full top-14 rounded-tl-lg p-2">
      {/* <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className='absolute p-8 rounded-lg max-w-lg w-full'>
          <h3 className="font-bold text-3xl text-white">This is the central panel for the We Chat application</h3>
        </div>
      </div> */}
      <ChatScreen />
    </main>
  )
}

export default Page