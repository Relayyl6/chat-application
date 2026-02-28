// ChatCardSkeleton.tsx
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ChatCardSkeleton = () => {
  return (
    <div className='flex flex-row items-center gap-3 p-3 bg-bg-input rounded-md m-1'>
      {/* Avatar skeleton */}
      <Skeleton circle width={48} height={48} />
      
      <div className='flex-1'>
        {/* Name skeleton */}
        <Skeleton width="60%" height={16} className="mb-2" />
        {/* Message preview skeleton */}
        <Skeleton width="80%" height={14} />
      </div>
      
      {/* Timestamp skeleton */}
      <div className='gap-4 flex-col'>
        <Skeleton width={40} height={12} />
        <Skeleton width={40} height={12} />
      </div>
    </div>
  )
}

export default ChatCardSkeleton