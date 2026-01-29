import React from 'react'

const ChatHeader = ({
    title,
    subTitle,
    id
}: Props) => {
  return (
    <div className='flex justify-between items-center mx-auto px-2 py-1 md:px-2 md:py-1.5 w-full bg-black rounded-tr-lg'>
        <div className='flex justify-center items-center gap-2'>
            <div className='aspect-square rounded-full bg-gray-700 size-12' />
            <div className='flex flex-col gap-0.5 h-full'>
                <p className='font-bold text-lg'>{title}</p>
                {
                    subTitle && (
                        <p className="text-base font-normal truncate w-[400px]">{subTitle}</p>
                    )
                }
            </div>
        </div>

        <div className='md:flex flex-row gap-1 hidden'>
            {id && (
                <div className="flex border border-black relative">
                    <p className='bg-gray-800 py-2 px-3 hover:bg-gray-600 rounded-l-md'>X</p>
                    <div className='w-px h-8/12 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white' />
                    <p className='bg-gray-800 py-2 px-3 hover:bg-gray-600 rounded-r-md'>X</p>
                </div>
            )}
            <p className=' hover:bg-gray-600 py-2 px-3 flex justify-center items-center border-none rounded-md'>X</p>
        </div>
    </div>
  )
}

export default ChatHeader