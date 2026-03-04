import { useAppContext } from '@/context/useContext'
import React from 'react'
import ContactForm from './ContactForm'

const Header = ({
  text,
  onClick,
  onPress,
  searchValue,
  handleChange,
  something,
  title,
  userId,
  setUserId,
  mode,
  setMode,
  members,
  setMembers,
  name,
  setName,
  extraInfo,
  setExtraInfo,
  onChannelCreated
}: HeaderProps) => {   // ✅ onChannelCreated now in HeaderProps, no inline extension needed
  const { setPeople } = useAppContext();

  return (
    <div className='flex flex-col bg-red-800 relative rounded-t-lg'>
      <div className='flex flex-row justify-between w-full items-center p-3'>
        <h2 className='font-semibold text-[35px] leading-6 text-text-main'>{text}</h2>
        <div className='px-2 flex justify-between gap-2 relative'>
          <button onClick={onClick} className='bg-red-200 px-2'>X</button>
          <button onClick={onPress} className='bg-red-200 px-2 relative'>X</button>
          {something && (
            <div className="transition ease-in-out duration-500 absolute top-12 md:left-12 right-0 z-100">
              <ContactForm
                name={name}
                setName={setName}
                userId={userId}
                setUserId={setUserId}
                extraInfo={extraInfo}
                setExtraInfo={setExtraInfo}
                mode={mode}
                setMode={setMode}
                members={members}          // ✅ now Member[] matches ContactProp
                setMembers={setMembers}    // ✅ now Member[] matches ContactProp
                onClick={onChannelCreated}
                closeModal={onPress}
              />
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center justify-center'>
        <input
          value={searchValue}
          autoFocus
          onChange={handleChange}
          placeholder='Search or start a new chat'
          className='w-11/12 mb-1 focus:border-b-input-border-focus hover:border-b-input-border text-text-main font-medium px-2 py-0.5 border border-gray-900/50 rounded-sm outline-none placeholder:text-text-placeholder'
        />
      </div>
    </div>
  );
};

export default Header;