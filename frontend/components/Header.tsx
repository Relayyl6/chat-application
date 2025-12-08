import React from 'react'

interface Props {
  text: string,
  onClick: () => void,
  onPress: () => void,
  searchValue: string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Header = ({ text, onClick, onPress, searchValue, handleChange }: Props) => {
  
  return (
    <div className='flex flex-col bg-red-800 relative rounded-t-lg'>
      <div className='flex flex-row justify-between w-full items-center p-3'>
        <h2 className='font-semibold text-[18px] leading-6 text-white'>{text}</h2>
        <div className='px-2 flex justify-between gap-2'>
            <button onClick={onClick} className='bg-red-200 px-2'>X</button>
            <button onClick={onPress} className='bg-red-200 px-2'>X</button>
        </div>
      </div>
      
      <div className='flex items-center justify-center'>
        <input
          value={searchValue}
          autoFocus
          onChange={handleChange}
          placeholder='Search or start a new chat'
          className='w-11/12 mb-1 focus:border-b-blue-900 hover:border-b-blue-900 text-black font-medium px-2 py-0.5 border border-gray-900/50 rounded-sm outline-none'
        />
      </div>
    </div>
  )
}

export default Header