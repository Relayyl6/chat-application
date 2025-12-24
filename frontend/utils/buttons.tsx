import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Buttons = ({ icon, path }: { icon: string }) => {
    // const navigate = useNavigate
    const handleClick = () => {
    }
  return (
    <div className='flex size-full'>
        <button onClick={handlerClick}>
            <Image
        
            />
        </button>
    </div>
  )
}

export default Buttons