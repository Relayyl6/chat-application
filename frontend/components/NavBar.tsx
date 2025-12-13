"use client"

import React, { useState } from 'react'

type Connection = "connecting" | "connected" | "Not connected";
type Header = "exit" | "max" | "min"
interface Item {
    id: number
    title: Header
}

const NavBar = () => {
    const [connectionState, setConnectionState] = useState<Connection>("Not connected")
    const items: Item[] = [
        {id: 1, title: "min"},
        {id: 2, title: "max"},
        {id: 3, title: "exit"}
    ]

  return (
    <main className='shrink-0 w-full backdrop-blur-xl bg-black/50'>
        <nav className='flex flex-row justify-between h-12 items-center px-2'>
            {/* // ONE WINDOW */}
            <div className='flex flex-row gap-2 h-fit'>
                <h3 className='color-white bg-blue-500 px-2 py-1 font-semibold text-xl rounded-lg'>We Chat</h3>
                <div className='px-2 py-1 cursor-pointer hover:bg-gray-500 flex items-center justify-center rounded-lg   duration-300 ease-in-out'>
                    <h3 className='font-semibold text-white text-sm text-center flex justify-center'>{connectionState}</h3>
                </div>
            </div>

            <div className="flex items-center justify-center px-2">
                {items.map(({id, title}) => (
                    <div key={id} className='hover:bg-gray-500 p-1 m-1 last:hover:bg-red-700 cursor-pointer rounded-lg duration-200 ease-in-out'>
                        {title}
                    </div>
                ))}
            </div>
        </nav>
    </main>
  )
}

export default NavBar