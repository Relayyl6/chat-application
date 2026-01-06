"use client"

import React, { useEffect, useRef, useMemo, useState } from 'react'
// import { people } from '@/utils/names'
import ChatHeader from '@/components/ChatHeader'
import ChatBubble from '@/components/ChatBubble'
import InputSection from '@/components/InputSection'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/context/useContext'
import { useMounted } from '@/hooks/useMounted'
import { DNA } from 'react-loader-spinner'
// import useMounted from '@/hooks/useMounted'


const Page = () => {
    // const { id } = await params; // how to do it in a server component with props { params }: Props
    const params = useParams();
    const chatId = params.id as string
    const { messagesByChat, setMessagesByChat, people } = useAppContext();
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const mounted = useMounted()

    const messages = useMemo(() => messagesByChat[chatId] ?? [],
      [messagesByChat, chatId]
    )

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

  if (!mounted) return (
    <div className="flex items-center justify-center w-full h-full">
      <DNA
        height={80}
        width={80}
        wrapperStyle={{}}
        wrapperClass="dna-wrapper"
        visible={true}
        ariaLabel='dna-loading'
      />
    </div>
  )

    // const person = people.order.find(p => p === chatId);
    const person = people.byId[chatId]
    // Handle case where person is not found
    if (!person) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-white text-xl">
            <DNA
              height={80}
              width={80}
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
              visible={true}
              ariaLabel='dna-loading'
            />
          </p>
        </div>
      );
    }
    const { id: userId, title, firstLine } = person!;

    const aliasBgMap: Record<user, string> = {
      you: 'bg-violet-500',
      ai: 'bg-purple-500',
      me: 'bg-green-500',
    };

    // console.log(aliasBgMap["you" as user])
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
                )
              )}
              <div ref={bottomRef} />
            </div>
            <InputSection
              message={messages}
              setMessage={(updater: unknown) =>
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
              activePersonId={chatId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Page