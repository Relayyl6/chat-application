"use client"

import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'

interface Props {
  message: MessageProps[],
  setMessage: Dispatch<SetStateAction<MessageProps[]>>
}

const InputSection = ({ message, setMessage }: Props) => {
  const [ text, setText ] = useState<string | undefined>("");

  const addItem = () => {
    const newItem: MessageProps = {
      alias: "me",
      timestamp: new Date().toLocaleTimeString(),
      text: text
    }
    setMessage(prev => [...prev, newItem]);
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    // Call your send message function here
    // handleSendMessage(); // for when teh backend is done
    addItem()
  }
}

  return (
    <div className='sticky bottom-0 w-full p-2 flex flex-row bg-green-400 gap-2 rounded-br-xl'>
      <input
          value={text}
          placeholder='Input your chat message'
          className='text-black placeholder:text-gray-600 bg-red-600 outline-none w-full py-1 px-3 rounded-full font-medium size-xl'
          onChange={
            (event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)
          }
          onKeyDown={handleKeyDown}
      />
      <button onClick={addItem} className="bg-violet-600 px-3 rounded-lg hover:brightness-75 focus:bg-black">
        <p>Send</p>
      </button>
    </div>
  )
}

export default InputSection