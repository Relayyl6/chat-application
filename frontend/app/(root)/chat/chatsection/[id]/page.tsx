"use client"

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { people } from '@/utils/names'
import ChatHeader from '@/components/ChatHeader'
import ChatBubble from '@/components/ChatBubble'
import InputSection from '@/components/InputSection'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/useContext'


const Page = () => {
    // const { id } = await params; // how to do it in a server component with props { params }: Props
    const params = useParams();
    const chatId = params.id as string
    const { messagesByChat, setMessagesByChat } = useAppContext();
    const bottomRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      localStorage.setItem("messagesByChat", JSON.stringify(messagesByChat))
    }, [messagesByChat])

    const messages = useMemo(() => messagesByChat[chatId] ?? [],
      [messagesByChat, chatId]
    )

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const person = people.find(p => p.id === parseInt(chatId)) as Item

    // Handle case where person is not found
    if (!person) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-white text-xl">Chat not found</p>
        </div>
      );
    }
    const { id: userId, title, firstLine } = person!;

    const aliasBgMap: Record<user, string> = {
      you: 'bg-green-500',
      ai: 'bg-purple-500',
      me: 'bg-white',
    };


  return (
    <div className="flex flex-col p-2 gap-2 w-full h-full max-md:hidden">
      <ChatHeader
        title={title}
        subTitle={firstLine}
        id={userId}
      />
      <div className="flex-1 min-h-0 h-full relative">
        {messages && (
          <div className='w-full h-full gap-1 flex flex-col relative bg-blue-500 pt-2 rounded-br-xl'>
            <div className="overflow-y-auto no-scrollbar gap-2 flex-1 px-2">
              {messages?.map(
              (t: MessageProps) => (
                  <div key={t.timestamp} className={`flex w-full px-2 mb-1 ${t.alias === "me" ? "justify-start" : "justify-end"}`}>
                    <ChatBubble message={t?.text} timestamp={t?.timestamp} className={`${aliasBgMap[t.alias as user] ?? 'bg-white'}`} />
                  </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <InputSection
              message={messages}
              setMessage={(updater) =>
                setMessagesByChat(prev => {
                  const current = prev[chatId] ?? []
                  const nextMessages =
                    typeof updater === "function"
                      ? updater(current)
                      : updater
                  return {
                    ...prev,
                    [chatId]: nextMessages
                  }
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Page