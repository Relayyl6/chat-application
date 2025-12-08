// import ChatCard from '@/components/ChatCard'
import ChatCard from '@/components/ChatCard'
import { people } from '@/utils/names'
import React from 'react'

const page = () => {
  const todayDate = new Date().toISOString();
  return (
    <div className='absolute left-15 min-h-screen w-full top-11 p-2'>
      {
        people.map((person: {id: number, title: string, firstLine: string}) => (
          <div className='flex flex-row justify-between w-full m-2 px-2 bg-white' key={person.id}>
              <ChatCard
                name={person.title}
                firstLine={person.firstLine}
                date={todayDate}
              />
          </div>
        ))
      }
    </div>
  )
}

export default page