import { useAppContext } from '@/context/useContext'
import React from 'react'
import ContactForm from './ContactForm'
import { nanoid } from "nanoid";
// declare interface MessageContainerProp {
//   id?: number,
//   title: string,
//   firstLine: string,
//   message: MessageProps[] | []
// }

const Header = ({ text, onClick, onPress, searchValue, handleChange, something, title, firstLine, setName, setFirstLine }: HeaderProps) => {
  const { setPeople, people } = useAppContext()
  const addPerson = () => {
    const id = nanoid();
    // const updatedId = (people.at(-1)?.id ?? 0) + 1; // or with optional chaining const updatedId = people?.[people.length - 1]?.id ?? 0 + 1;
    setPeople(prev => ({
    byId: {
      ...prev.byId,
      [id]: {
        id,
        title,
        firstLine,
        message: []
      }
    },
    order: [...prev.order, id]
  }));
    setName("")
    setFirstLine("")
  }
  console.log(something)
  return (
    <div className='flex flex-col bg-red-800 relative rounded-t-lg'>
      <div className='flex flex-row justify-between w-full items-center p-3'>
        <h2 className='font-semibold text-[18px] leading-6 text-white'>{text}</h2>
        <div className='px-2 flex justify-between gap-2 relative'>
            <button onClick={onClick} className='bg-red-200 px-2'>X</button>
            <button onClick={onPress} className='bg-red-200 px-2 relative'>X</button>
            {
              something && (
                <div className="transition ease-in-out duration-500 absolute top-12 md:left-12 right-0 z-100">
                   <ContactForm name={title} firstLine={firstLine} setFirstLine={setFirstLine} setName={setName} onClick={addPerson}/>
                </div>
              )
            }
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