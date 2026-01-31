"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'
import Logout from '@mui/icons-material/Logout';
import { Account } from '@toolpad/core/Account';
import { AppProvider, Session } from '@toolpad/core/AppProvider';
import { BottomItem, TopItem } from '@/utils/names';

const demoSession = {
  user: {
    name: 'Bharat Kashyap',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  },
};

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
  const [session, setSession] = React.useState<Session | null>(demoSession);
    
    const [ toggle, setToggle ] = useState<boolean>(true);

    const authentication = React.useMemo(() => {
      return {
        signIn: () => {
          setSession({
            user: {
              name: 'Bharat Kashyap',
              email: 'bharatkashyap@outlook.com',
              image: 'https://avatars.githubusercontent.com/u/19550456',
            },
          });
        },
        signOut: () => {
          setSession(null);
        },
      };
    }, []);
    
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean); // removes empty strings
    // segments = ["chat", "chatsection", "vavrvservaer"]

    const section = segments[0] || null;

  return (
    <main className={`${toggle ? "w-[70px]" : "w-[200px]"} duration-500 ease-in-out z-30 backdrop-blur-xl bg-bg-main px-1 relative flex flex-col justify-between`}>
      <div className='flex flex-col z-40 justify-between px-1 mt-3 gap-2'>
          <button className='hover:bg-gray-500 w-10 rounded-lg p-2 text-white flex items-center justify-center mb-2' onClick={() => setToggle(!toggle)}>
              <AnimatedHamburgerMenu
                  isOpen={!toggle}
                  size={18}
                  color='#ffffff'
              />
          </button>
          <div className='flex flex-col relative'>
              {TopItem.map(({id, title, expandedTitle, ref}) => (
                  <Link key={id} href={ref} className={`${section === ref ? "bg-gray-500 text-black" : ""} p-2 relative rounded-sm mb-2 cursor-pointer`}>
                      <div className='absolute bg-blue-800 h-4 rounded-lg w-0.5 flex top-1/2 -translate-y-1/2 left-0' />
                      <div className='flex flex-row gap-3'>
                        <span className="bg-blue-primary w-8 text-white dark:text-black">
                          {title}
                        </span>
                        {!toggle &&
                          <span className="text-white dark:text-black truncate">
                            {expandedTitle}
                          </span>
                        }
                      </div>
                  </Link>
              ))}
              <div className='bg-gray-500 h-px w-full' />
              <div className='flex flex-row relative gap-3 py-2 hover:bg-gray-500 mt-2 rounded-xl items-center justify-center'>
                <div>{!toggle && <span className={`${!toggle ? "opacity-100" : "opacity-0"} duration-200 ease-in-out`}>Chat with AI</span>}</div>
              </div>
          </div>
      </div>

        <div className=''>
          <div className="flex flex-col">
            {BottomItem.map(({id, title, expandedTitle}) => (
              <div key={id} className='hover:bg-gray-500 p-2 relative rounded-sm mb-2 cursor-pointer even:border-b even:border-white'>
                  <div className='absolute bg-blue-800 h-4 rounded-lg w-0.5 flex top-1/2 -translate-y-1/2 left-0' />
                  <div className='flex flex-row gap-3'>
                    <span className="bg-blue-primary w-8">
                      {title}
                    </span>
                    {!toggle && 
                      <span className="truncate">
                        {expandedTitle}
                      </span>}
                  </div>
              </div>
            ))}
          </div>
        </div>


        {
          !toggle ? (
            <AppProvider authentication={authentication} session={session} >
              {/* preview-start */}
              <Account
                slotProps={{
                  signInButton: {
                    color: 'success',
                  },
                  signOutButton: {
                    color: 'success',
                    startIcon: <Logout />,
                  },
                  preview: {
                    variant: 'expanded',
                    slotProps: {
                      avatarIconButton: {
                        sx: {
                          width: 'fit-content',
                          margin: 'auto',
                        },
                      },
                      avatar: {
                        variant: 'rounded',
                      },
                    },
                  },
                }}
              />
              {/* preview-end */}
            </AppProvider>
          ) : (
            <AppProvider authentication={authentication} session={session}>
              {/* preview-start */}
              <Account />
              {/* preview-end */}
            </AppProvider>
          )
        }
    </main>
  )
}

export default Sidebar