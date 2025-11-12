import React from 'react'

const Header = ({ text, onClick, onPress }) => {
  return (
    <div className='flex flex-row justify-between'>
        <h2 className='font-normal leading-1'>{text}</h2>
        <div className='px-2'>
            <button onClick={onClick} className='bg-red-200'>X</button>
            <button onClick={onPress} className='bg-red-200'>X</button>
        </div>
    </div>
  )
}

export default Header