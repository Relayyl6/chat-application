"use client"

import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import apiHandling from './apiHandling';
import { useAppContext } from '@/context/useContext';
import TroubleShoot from './troubleshoot';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DNA } from 'react-loader-spinner';

const InputSection = ({
  message,
  setMessage,
  activePersonId
 }: InputProps) => {
  const router = useRouter()
  const [ text, setText ] = useState<string | undefined>("");
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState("");
  const { aiChatMessage, setPeople } = useAppContext();
  const onNewMessage = (personId: string, text: string) => {
    setPeople(prev => {
      const person = prev.byId[personId];
      // console.log(personId)
      if (!person) {
        console.warn("onNewMessage called with invalid ID:", personId);
        return prev;  
      };

      const newMessage: MessageProps = {
        alias: "me",
        text,
        timestamp: Date.now()
      };

      const prevMessage = person.message ?? []

      return {
        byId: {
          ...prev.byId,
          [personId]: {
            ...person,
            message : [...prevMessage, newMessage]
          }
        },
        order: [
          personId,
          ...prev.order.filter(id => id !== personId)
        ]
      }
    })
  }

  const addItem = async () => {
    const userMessage: MessageProps = {
      alias: "me",
      timestamp: Date.now(),
      text: text
    }
    setMessage((prev: MessageProps[]) => [...prev, userMessage]);
    // console.log(message);
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
          timestamp : Date.now()
        };

        setMessage((prev: MessageProps[]) => [...prev, aiMessage]);
      } else {
        const response = await apiHandling<GenerateResponse>('/generate', 'POST', {
          message : text,
        }); // when talkign to ai

        chatResponse = {
          alias : 'you',
          text : response.result,
          timestamp : Date.now()
        };

        setMessage((prev: MessageProps[]) => [...prev, chatResponse]);
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
        timestamp: Date.now(),
      };
      setMessage((prev: MessageProps[]) => [...prev, errorMessage]);
      setError(`Error: ${message}`);
      // router.push("/Error?code=UNAUTHORIZED")
    } finally {
      setIsLoading(false)
      setText('');
      setError("")
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
    <div className='w-full p-4 px-5 flex flex-row bg-transparent gap-2 rounded-br-xl'>
      <input
        value={text}
        placeholder="Input your chat message"
        className="
          text-black placeholder:text-gray-600 bg-bg-inner outline-none w-full py-2 px-3 rounded-full font-medium text-xl
          transition-transform duration-150 ease-out
          focus:scale-102 focus:-translate-y-0.5 focus:shadow-md
        "
        onChange={(event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={addItem} className="bg-btn-light-text px-3 rounded-lg hover:brightness-75 focus:bg-black">
        <div>
          {!isLoading ?
            <p>{`Send`}</p>: (
              <div className="flex justify-center">
                {/* <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" /> */}
                <div className="flex items-center justify-center w-full h-full">
                  <DNA
                    height={30}
                    width={30}
                    wrapperStyle={{}}
                    wrapperClass="dna-wrapper"
                    visible={true}
                    ariaLabel='dna-loading'
                  />
                </div>
              </div>
            )
          }
        </div>
      </button>
    </div>
  )
}

export default InputSection