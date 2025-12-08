"use client"

import React, { useEffect, useState } from 'react'
import { people } from '@/utils/names'
import ChatHeader from '@/components/ChatHeader'
import ChatBubble from '@/components/ChatBubble'
import InputSection from '@/components/InputSection'
import { useParams } from 'next/navigation'


const Page = () => {
    // const { id } = await params; // how to do it in a server component with props { params }: Props
    const params = useParams();
    const { id } = params;
    const person: Item = people.find(person => person.id === parseInt(id as string)) as Item;
    const { id: userId, title, firstLine } = person;
    const [ message, setMessage ] = useState<MessageProps[]>([]);
    const [ item, setItem ] = useState<MessageContainerProp[]>([]);
    Object.assign(item, {
      ...(userId && { id: userId }),
      ...(title && { title }),
      ...(firstLine && { firstLine }),
      ...(message && { message })
    })
    useEffect(() => {
      Object.assign(item, {
        ...(message && { message })
      })
    }, [message, item])
  return (
    <div className="flex flex-col p-2 gap-2 w-full">
      <ChatHeader
        title={item?.[0]?.title}
        subTitle={item?.[0]?.firstLine}
        id={parseInt(id as string)}
      />
      <div className="flex-1 min-h-0 h-full relative">
        {item && (
          <div className='w-full h-full gap-1 flex flex-col relative overflow-y-auto no-scrollbar bg-blue-500 pt-2 rounded-br-xl'>
            {item?.[0]?.message?.map(
              (t: MessageProps) => (
                  <div key={t.timestamp} className={`flex w-full px-2 justify-center ${t.alais === "me" ? "justify-start" : "justify-end"}`}>
                    <ChatBubble message={t?.text} />
                  </div>
              ))}
            <InputSection
              message={message}
              setMessage={setMessage}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Page