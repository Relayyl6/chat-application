// import ChatCard from '@/components/ChatCard'
import ChatCard from '@/components/ChatCard'
import ChatContent from '@/components/List/MainChatPage'
import { initialPeople } from '@/utils/names';
// import { people } from '@/utils/names'
import React from 'react'


const page = () => {
  const todayDate = Date.now().toISOString();
  // const { people } 
  return (
    <div className='absolute left-15 min-h-screen w-full top-11 p-2 mx-auto'>
      {/* {
        initialPeople.map((person: {id: number, title: string, firstLine: string}) => (
          <div className='flex flex-row justify-between w-full m-2 px-2 bg-white' key={person.id}>
            <ChatCard
              name={person.title}
              id={person.id}
              date={todayDate}
            />
          </div>
        ))
      } */}
      <ChatContent />
    </div>
  )
}

export default page