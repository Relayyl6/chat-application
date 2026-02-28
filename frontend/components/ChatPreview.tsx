"use client"

import { useEffect, useState } from 'react'
import Header from './Header';
import ChatCard from './ChatCard'
import ChatCardSkeleton from './ChatCardSkeleton' // Import the skeleton
import { useAppContext } from '@/context/useContext';

const ChatPreview = () => {
    const { people } = useAppContext();
    const [ firstLine, setFirstLine ] = useState<string>("")
    const [ something, setSomething ] = useState(false);
    const [ another, setAnother ] = useState(true);
    const [ searchValue, setSearchValue ] = useState<string>("");
    const [ isLoading, setIsLoading ] = useState(true); // Add loading state
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
    }

    const [mode, setMode] = useState<"dm" | "group">("dm");
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [extraInfo, setExtraInfo] = useState("");
    const [members, setMembers] = useState<string[]>([""]);

    // 10-second timer for loading skeleton
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000); // 10 seconds

      // Cleanup function to clear timer if component unmounts
      return () => clearTimeout(timer);
    }, []); // Empty dependency array means this runs once on mount
    
    const filteredPeople = people.order.filter((id: string) => {
      const person = people.byId[id];
      const search = searchValue.toLowerCase().trim();

      return (
        person.title.toLowerCase().includes(search) ||
        person.firstLine.toLowerCase().includes(search)
      );
    });

  return (
    <main className='flex flex-col w-full min-w-full sm:w-[400px] sm:min-w-[350px] max-w-sm max-md:rounded-r-lg bg-bg-card p-3 rounded-tl-xl'>
      <Header
        text="Chat"
        onClick={() => setAnother(prev => !prev)}
        onPress={() => setSomething(prev => !prev)}
        something={something}
        searchValue={searchValue}
        handleChange={handleChange}
        title="New Chat"
        name={name}
        setName={setName}
        userId={userId}
        setUserId={setUserId}
        extraInfo={extraInfo}
        setExtraInfo={setExtraInfo}
        mode={mode}
        setMode={setMode}
        members={members}
        setMembers={setMembers}
      />

      <div className='w-full h-px bg-gray-700 border-border-strong border'/>
      
      <div className='mt-2 flex-1 min-h-0 h-full'>
        <div className='mt-2 bg-bg-card flex flex-col w-full h-full overflow-y-auto no-scrollbar'>
          {isLoading ? (
            // Show skeletons for 10 seconds
            <>
              {[...Array(8)].map((_, index) => (
                <ChatCardSkeleton key={index} />
              ))}
            </>
          ) : filteredPeople.length === 0 ? (
            <p className="text-gray-400 text-sm p-3 flex items-center justify-center">
              No chats found
            </p>
          ) : (
            filteredPeople.map((id: string) => {
              const person = people.byId[id];
              return (
                <div
                  className='flex flex-row justify-between box-border m-1 bg-bg-input rounded-md'
                  key={id}
                >
                  <ChatCard
                    id={id}
                    name={person.title}
                    date={person.message?.at(-1)?.timestamp ?? ""}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  )
}

export default ChatPreview