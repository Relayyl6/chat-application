"use client"

import React, { useState } from 'react'

interface HamburgerProps {
  isOpen: boolean;          // Your useState boolean
  size?: number;            // Size in pixels (default: 24)
  color?: string;           // Line color (default: 'currentColor')
  className?: string;       // Additional CSS classes
  animationDuration?: string; // Animation speed (default: '0.3s')
}

export const AnimatedHamburgerMenu = ({
  isOpen,
  size = 24,
  color = 'currentColor',
  className = '',
  animationDuration = '0.3s'
}: HamburgerProps ) => {
  return (
    <div 
        className={`relative cursor-pointer ${className}`} 
        style={{ width: size, height: size }}
        aria-label="Toggle menu">
      {/* Top line */}
      <span
        className="absolute left-0 block h-0.5 bg-current transform transition-all origin-center"
        style={{
          width: size,
          top: size * 0.25,
          transitionDuration: animationDuration,
          transform: isOpen
            ? `translateY(${size * 0.25}px) rotate(45deg)`
            : 'translateY(0) rotate(0)',
          backgroundColor: color
        }}
      />
      {/* Middle line */}
      <span
        className="absolute left-0 block h-0.5 bg-current transition-all"
        style={{
          width: size,
          top: size * 0.5,
          transitionDuration: animationDuration,
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          backgroundColor: color
        }}
      />
      {/* Bottom line */}
      <span
        className="absolute left-0 block h-0.5 bg-current transform transition-all origin-center"
        style={{
          width: size,
          top: size * 0.75,
          transitionDuration: animationDuration,
          transform: isOpen 
            ? `translateY(-${size * 0.25}px) rotate(-45deg)` 
            : 'translateY(0) rotate(0)',
          backgroundColor: color
        }}
      />
    </div>
  );
};

const Sidebar = () => {
    const [ toggle, setToggle ] = useState<boolean>(false);
    const TopItem = [
        {id: 1, title: "Ch", expandedTitle: "Chats"},
        {id: 2, title: "St", expandedTitle: "Status"},
        {id: 3, title: "Ca", expandedTitle: "Calls"}
    ]

  return (
    <main className={`${toggle ? "w-[60px]" : "w-[200px]"} duration-500 ease-in-out h-screen md:h-[95dvh] z-30 backdrop-blur-xl left-0 top-11 bg-black px-1 relative`}>
      <div className='flex flex-col z-40 justify-between px-1 mt-3 gap-2'>
          <button className='hover:bg-gray-500 w-10 rounded-lg p-2 text-white flex items-center justify-center' onClick={() => setToggle(!toggle)}>
              <AnimatedHamburgerMenu
                  isOpen={!toggle}
                  size={18}
                  color='#ffffff'
              />
          </button>
          <div className='flex flex-col relative'>
              {TopItem.map(({id, title, expandedTitle}) => (
                  <div key={id} className='hover:bg-gray-500 p-2 relative rounded-sm mb-2 cursor-pointer'>
                      <div className='absolute bg-blue-800 h-4 rounded-lg w-0.5 flex top-1/2 -translate-y-1/2 left-0' />
                      <div className='flex flex-row gap-3'>
                        <span className="bg-violet-700 w-8">
                          {title}
                        </span>
                        {!toggle && 
                          <span>
                            {expandedTitle}
                          </span>}
                      </div>
                  </div>
              ))}
              <div className='bg-gray-500 h-px w-full' />
              <div className='flex flex-row relative gap-3 py-2 hover:bg-gray-500 mt-2 rounded-xl items-center justify-center'>
                <div>{!toggle && <span className={`${!toggle ? "opacity-100" : "opacity-0"} duration-200 ease-in-out`}>Chat with AI</span>}</div>
              </div>
          </div>
      </div>

        <div className='absolute bottom-3'>
          <div className="flex flex-col">
            {TopItem.map(({id, title, expandedTitle}) => (
                      <div key={id} className='hover:bg-gray-500 p-2 relative rounded-sm mb-2 cursor-pointer'>
                          <div className='absolute bg-blue-800 h-4 rounded-lg w-0.5 flex top-1/2 -translate-y-1/2 left-0' />
                          <div className='flex flex-row gap-3'>
                            <span className="bg-violet-700 w-8">
                              {title}
                            </span>
                            {!toggle && 
                              <span>
                                {expandedTitle}
                              </span>}
                          </div>
                      </div>
                  ))}
          </div>
        </div>
    </main>
  )
}

export default Sidebar