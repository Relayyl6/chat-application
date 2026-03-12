"use client"

import React, { useState } from 'react'
import { useSocketContext } from '@/context/SocketContext'
import { useAppContext } from '@/context/useContext'
import { useRouter } from 'next/navigation'

const statusConfig = {
  connected:   { label: 'Connected',    dot: 'bg-green-400',                  text: 'text-green-400'  },
  connecting:  { label: 'Connecting...', dot: 'bg-yellow-400 animate-pulse',  text: 'text-yellow-400' },
  away:        { label: 'Away',          dot: 'bg-orange-400',                 text: 'text-orange-400' },
  offline:     { label: 'Not connected', dot: 'bg-gray-400',                  text: 'text-gray-400'   },
} as const;

const NavBar = () => {
  const { isConnected } = useSocketContext();
  const { user, logout } = useAppContext();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasNotifications] = useState(false); // wire to real notifications later

  const status = !isConnected
    ? statusConfig.offline
    : user?.status === 'away'
      ? statusConfig.away
      : statusConfig.connected;

  return (
    <main className='shrink-0 w-full backdrop-blur-xl bg-black/50 relative z-[100]'>
      <nav className='flex flex-row justify-between h-12 items-center px-3'>

        {/* LEFT — brand + connection status */}
        <div className='flex flex-row gap-2 items-center'>
          <h3 className='bg-blue-500 px-2 py-1 font-semibold text-xl rounded-lg text-white select-none'>
            We Chat
          </h3>
          <div className='flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 cursor-default transition-colors'>
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
            <span className={`font-medium text-sm hidden sm:block ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* RIGHT — notifications + user pill */}
        <div className='flex items-center gap-2'>

          {/* Notification bell */}
          <button
            className='relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors'
            title='Notifications'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasNotifications && (
              <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full' />
            )}
          </button>

          {/* User pill */}
          {user && (
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(p => !p)}
                className='flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors'
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username}
                    className='w-7 h-7 rounded-full object-cover ring-2 ring-white/20' />
                ) : (
                  <div className='w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20'>
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
                {/* Name — hidden on small screens */}
                <span className='text-white text-sm font-medium hidden sm:block'>
                  {user.username}
                </span>
                {/* Status dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
              </button>

              {/* Dropdown menu — fixed so it escapes all stacking contexts */}
              {showUserMenu && (
                <>
                  <div className='fixed inset-0 z-999' onClick={() => setShowUserMenu(false)} />
                  <div className='fixed top-12 right-3 z-1000 bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-48 py-1 overflow-hidden'>
                    <div className='px-3 py-2.5 border-b border-white/10 flex items-center gap-2'>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username}
                          className='w-8 h-8 rounded-full object-cover' />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold'>
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <p className='text-white text-sm font-semibold truncate'>{user.username}</p>
                        <p className='text-gray-400 text-xs truncate'>{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { router.push('/settings'); setShowUserMenu(false); }}
                      className='w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 transition-colors'
                    >
                      <span>⚙️</span> Settings
                    </button>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className='w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors'
                    >
                      <span>🚪</span> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </nav>
    </main>
  )
}

export default NavBar