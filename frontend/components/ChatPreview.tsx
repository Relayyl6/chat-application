"use client"

import { useEffect, useState } from 'react'
import Header from './Header';
// import Chats from './Chats';
// import { people } from '@/utils/names'
import ChatCard from './ChatCard'
import { useAppContext } from '@/context/useContext';

const ChatPreview = () => {
    const [todayDate, setTodayDate] = useState("");

    useEffect(() => {
      setTodayDate(new Date().toISOString());
    }, []);

    // const chatHistory = [];
    const { people } = useAppContext();
    const [ name, setName ] = useState<string>("");
    const [ firstLine, setFirstLine ] = useState<string>("")
    const [ something, setSomething ] = useState(false);
    const [ another, setAnother ] = useState(true);
    const [ searchValue, setSearchValue ] = useState<string>("");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
    }

  return (
    <main className='flex flex-col w-[350px] min-w-[300px] sm:w-[400px] sm:min-w-[350px] max-w-sm max-md:rounded-r-lg bg-gray-800 p-3 rounded-tl-xl'>
      <Header
        text="Chat"
        onClick={() => setAnother(prev => !prev)}
        onPress={() => setSomething(prev => !prev)}
        something={something}
        searchValue={searchValue}
        handleChange={handleChange}
        title={name}
        firstLine={firstLine}
        setFirstLine={setFirstLine}
        setName={setName}
      />
      
      <div className='w-full h-px bg-gray-700'/>
      <div className='mt-2 flex-1 min-h-0 h-full'>
        <div className='mt-2 bg-green-800 flex flex-col w-full h-full overflow-y-auto no-scrollbar'>
          {
            people.order.map((id: string) => {
              const person = people.byId[id];
              return (
                <div className='flex flex-row justify-between box-border m-1 bg-white' key={id}>
                  <ChatCard
                    id={id}
                    name={person.title}
                    date={person.message?.at(-1)?.timestamp ?? todayDate}
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