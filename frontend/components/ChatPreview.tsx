import React, { useState } from 'react'
import Header from './Header';

const ChatPreview = () => {

    const chatHistory = [];

    const [ something, setSomething ] = useState(true);
    const [ another, setAnother ] = useState(true);

  return (
    <main className='flex w-[300px] min-w-[250px] max-w-sm h-full border-r border-gray-600 bg-gray-800 p-3'>
      <Header text="Chat" onClick={() => setAnother(!something)} onPress={() => setSomething(!another)} />
    </main>
  )
}

export default ChatPreview