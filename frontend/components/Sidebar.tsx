"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import Logout from '@mui/icons-material/Logout';
import { Account } from '@toolpad/core/Account';
import { AppProvider, Session } from '@toolpad/core/AppProvider';
import { BottomItem, TopItem } from '@/utils/names';
import { useAppContext } from '@/context/useContext';

export const AnimatedHamburgerMenu = ({
  isOpen,
  size = 24,
  color = 'currentColor',
  className = '',
  animationDuration = '0.3s'
}: HamburgerProps) => {
  return (
    <div className={`relative cursor-pointer ${className}`} style={{ width: size, height: size }} aria-label="Toggle menu">
      <span className="absolute left-0 block h-0.5 transform transition-all origin-center"
        style={{ width: size, top: size * 0.25, transitionDuration: animationDuration,
          transform: isOpen ? `translateY(${size * 0.25}px) rotate(45deg)` : 'translateY(0) rotate(0)',
          backgroundColor: color }} />
      <span className="absolute left-0 block h-0.5 transition-all"
        style={{ width: size, top: size * 0.5, transitionDuration: animationDuration,
          opacity: isOpen ? 0 : 1, transform: isOpen ? 'scale(0)' : 'scale(1)',
          backgroundColor: color }} />
      <span className="absolute left-0 block h-0.5 transform transition-all origin-center"
        style={{ width: size, top: size * 0.75, transitionDuration: animationDuration,
          transform: isOpen ? `translateY(-${size * 0.25}px) rotate(-45deg)` : 'translateY(0) rotate(0)',
          backgroundColor: color }} />
    </div>
  );
};

// ─── Sidebar panel (shared between desktop and mobile overlay) ────────────────
export const SidebarPanel = ({ onClose }: { onClose?: () => void }) => {
  const { user, logout } = useAppContext();
  const [toggle, setToggle] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (user) {
      setSession({
        user: { name: user.username, email: user.email,
          image: user.avatar ?? 'https://avatars.githubusercontent.com/u/19550456' },
      });
    } else {
      setSession(null);
    }
  }, [user]);

  const authentication = React.useMemo(() => ({
    signIn: () => {
      if (user) setSession({ user: { name: user.username, email: user.email,
        image: user.avatar ?? 'https://avatars.githubusercontent.com/u/19550456' } });
    },
    signOut: () => { setSession(null); logout(); },
  }), [user, logout]);

  const pathname = usePathname();
  const section = pathname.split('/').filter(Boolean)[0] || null;

  return (
    <div className={`
      ${toggle ? "w-[70px]" : "w-[200px]"}
      duration-500 ease-in-out h-full flex flex-col justify-between
      backdrop-blur-xl bg-bg-main px-1
    `}>
      <div className='flex flex-col z-40 justify-between px-1 mt-3 gap-2'>
        <button
          className='hover:bg-gray-500 w-10 rounded-lg p-2 text-white flex items-center justify-center mb-2'
          onClick={() => setToggle(!toggle)}
        >
          <AnimatedHamburgerMenu isOpen={!toggle} size={18} color='#ffffff' />
        </button>

        <div className='flex flex-col relative'>
          {TopItem.map(({ id, title, expandedTitle, ref }) => (
            <Link key={id} href={ref} onClick={onClose}
              className={`${section === ref ? "bg-gray-500 text-black" : ""} p-2 relative rounded-sm mb-2 cursor-pointer`}
            >
              <div className='absolute bg-blue-800 h-4 rounded-lg w-0.5 flex top-1/2 -translate-y-1/2 left-0' />
              <div className='flex flex-row gap-3'>
                <span className="bg-blue-primary w-8 text-white dark:text-black">{title}</span>
                {!toggle && <span className="text-white dark:text-black truncate">{expandedTitle}</span>}
              </div>
            </Link>
          ))}

          <div className='bg-gray-500 h-px w-full' />

          <div className='flex flex-row relative gap-3 py-2 hover:bg-gray-500 mt-2 rounded-xl items-center justify-center'>
            {!toggle && <span className="duration-200 ease-in-out">Chat with AI</span>}
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col">
          {BottomItem.map(({ id, title, expandedTitle }) => (
            <div key={id} className='hover:bg-gray-500 p-2 relative rounded-sm mb-2 cursor-pointer even:border-b even:border-white'>
              <div className='absolute bg-blue-800 h-4 rounded-lg w-0.5 flex top-1/2 -translate-y-1/2 left-0' />
              <div className='flex flex-row gap-3'>
                <span className="bg-blue-primary w-8">{title}</span>
                {!toggle && <span className="truncate">{expandedTitle}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!toggle ? (
        <AppProvider authentication={authentication} session={session}>
          <Account slotProps={{
            signInButton: { color: 'success' },
            signOutButton: { color: 'success', startIcon: <Logout /> },
            preview: { variant: 'expanded',
              slotProps: { avatarIconButton: { sx: { width: 'fit-content', margin: 'auto' } },
                avatar: { variant: 'rounded' } } },
          }} />
        </AppProvider>
      ) : (
        <AppProvider authentication={authentication} session={session}>
          <Account />
        </AppProvider>
      )}
    </div>
  );
};

// ─── Desktop sidebar (always visible, md+) ───────────────────────────────────
const Sidebar = () => (
  <div className="hidden md:block h-full">
    <SidebarPanel />
  </div>
);

// ─── Mobile sidebar (floating button + full-screen overlay) ──────────────────
export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button — bottom-left, mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-6 left-4 z-50 w-11 h-11 rounded-full bg-bg-main shadow-lg flex items-center justify-center border border-gray-600"
        aria-label="Open menu"
      >
        <AnimatedHamburgerMenu isOpen={false} size={16} color="#ffffff" />
      </button>

      {/* Overlay */}
      {open && (
        <>
          {/* Backdrop — tap to close */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar panel sliding in from left */}
          <div className="md:hidden fixed top-0 left-0 z-50 h-full animate-slide-in-left">
            <SidebarPanel onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;