"use client"

import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
import apiHandling from './apiHandling';
import { useAppContext } from '@/context/useContext';

interface Props {
  message: MessageProps[],
  setMessage: Dispatch<SetStateAction<MessageProps[]>>,
  activePersonId: number
}

const InputSection = ({
  message,
  setMessage,
  activePersonId
 }: Props) => {
  const [ text, setText ] = useState<string | undefined>("");
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState("");
  const { aiChatMessage, setPeople } = useAppContext();
  const onNewMessage = (personId: number, text: string) => {
  setPeople(prev => {
    const updated = prev.map(p =>
      p.id === personId
        ? { ...p, firstLine: text }
        : p
    );

    const active = updated.find(p => p.id === personId)!;
    const others = updated.filter(p => p.id !== personId);

    const reordered = [active, ...others];

    localStorage.setItem("people", JSON.stringify(reordered));
    return reordered;
  })};

  const addItem = async () => {
    const userMessage: MessageProps = {
      alias: "me",
      timestamp: new Date().toLocaleTimeString(),
      text: text
    }
    setMessage(prev => [...prev, userMessage]);
    onNewMessage(activePersonId, text as string);
    setIsLoading(true)
    try {
      let aiMessage: MessageProps;
      let chatResponse: MessageProps;

      if (aiChatMessage) {
        const response = await apiHandling<GenerateResponse>('/generate', 'POST', {
          message : text,
        }); // when talkign to ai

        aiMessage = {
          alias : 'ai',
          text : response.result,
          timestamp : new Date().toLocaleDateString()
        };

        setMessage(prev => [...prev, aiMessage]);
      } else {
        const response = await apiHandling<GenerateResponse>('/generate', 'POST', {
          message : text,
        }); // when talkign to ai

        chatResponse = {
          alias : 'you',
          text : response.result,
          timestamp : new Date().toLocaleDateString()
        };

        setMessage(prev => [...prev, chatResponse]);
      }

      
      // setInputText('')

      setText("")
      setIsLoading(false);
    } catch (error: unknown) {
      console.error('An error occurred:', error);

      let message = 'An unexpected error occurred';

      if (error instanceof Error) {
        message = error.message;
      }
    
      const errorMessage: MessageProps = {
        alias: 'you',
        text: `Error: ${message}`,
        timestamp: new Date().toLocaleTimeString(),
      };
    
      setMessage(prev => [...prev, errorMessage]);
      setError(`Error: ${message}`);
    } finally {
      setIsLoading(false)
      setText('');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Call the send message function here
      // handleSendMessage(); // for when teh backend is done
      addItem()
    }
  }

  return (
    <div className='sticky bottom-0 w-full p-2 flex flex-row bg-green-400 gap-2 rounded-br-xl'>
      <input
          value={text}
          placeholder='Input your chat message'
          className='text-black placeholder:text-gray-600 bg-red-600 outline-none w-full py-1 px-3 rounded-full font-medium size-xl'
          onChange={
            (event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)
          }
          onKeyDown={handleKeyDown}
      />
      <button onClick={addItem} className="bg-violet-600 px-3 rounded-lg hover:brightness-75 focus:bg-black">
        <div>
          {!isLoading ?
            "Send": (
              <div className="flex justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )
          }
        </div>
      </button>
    </div>
  )
}

export default InputSection