"use client"

import { useState } from 'react'
import Header from './Header';
// import Chats from './Chats';
// import { people } from '@/utils/names'
import ChatCard from './ChatCard'
import { useAppContext } from '@/context/useContext';

const ChatPreview = () => {

    // const chatHistory = [];
    const { people } = useAppContext();

    const [ something, setSomething ] = useState(true);
    const [ another, setAnother ] = useState(true);
    const [ searchValue, setSearchValue ] = useState<string>("");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
    }
    const todayDate = new Date().toISOString();

  return (
    <main className='flex flex-col w-[350px] min-w-[300px] sm:w-[400px] sm:min-w-[350px] max-w-sm max-md:rounded-r-lg bg-gray-800 p-3 rounded-tl-xl'>
      <Header
        text="Chat"
        onClick={() => setAnother(!something)}
        onPress={() => setSomething(!another)}
        searchValue={searchValue}
        handleChange={handleChange}
      />
      <div className='w-full h-px bg-gray-700'/>
      <div className='mt-2 flex-1 min-h-0 h-full'>
        <div className='mt-2 bg-green-800 flex flex-col w-full h-full overflow-y-auto no-scrollbar'>
          {
            people.map(({ title, id }) => {
              return (
                <div className='flex flex-row justify-between box-border m-1 bg-white' key={id}>
                  <ChatCard
                    name={title}
                    date={todayDate}
                    id={id}
                  />
                </div>
              )
            })
          }
        </div>
      </div>
    </main>
  )
}

export default ChatPreview