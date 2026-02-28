import React from 'react'

interface ChatBubbleProps {
  message: string;
  timestamp: Date | string | number;
  className?: string | undefined;
}

export const formatTime = (date: Date | string | number): string => {
  // If it's already a time string like "2:33:18 PM", just return it or reformat it
  if (typeof date === 'string' && date.includes(':')) {
    // Check if it's already a time string (HH:MM or H:MM AM/PM)
    const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i;
    const match = date.match(timePattern);
    
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const isPM = match[4]?.toUpperCase() === 'PM';
      
      // Convert 12-hour to 24-hour format
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }
  
  // Handle Date objects and timestamps
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = date < 10000000000 ? new Date(date * 1000) : new Date(date);
  } else {
    dateObj = new Date(date);
  }
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid timestamp:', date);
    return '--:--';
  }
  
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

const ChatBubble = ({ 
  message,
  timestamp,
  className
}: ChatBubbleProps) => {
  // console.log(className)
  

  return (
    <div className={`relative flex flex-col gap-4 p-2 w-fit min-w-[150px] max-w-sm rounded-lg ${className}`}>
        <p className='font-stretch-normal font-normal font-sans text-black mb-1'>
          {message}
        </p>

        <p className={`absolute bottom-0 ${className === "bg-green-500" ? "right-2" : "left-2"} text-gray-900 font-mono font-small text-[12px]`}>
          {formatTime(timestamp)}
        </p>
    </div>
  )
}

export default ChatBubble