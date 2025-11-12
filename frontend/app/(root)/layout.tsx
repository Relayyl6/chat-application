import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'
// import ReactNode from 'react'

export default function Layout({children}: Readonly<{ children: React.ReactNode }>) { 
    return (
        <main className='backdrop-blur-xl relative h-screen w-screen overflow-hidden'>
            <NavBar />
            <div className='flex flex-row'>
                <Sidebar />
                {children}
            </div>
        </main>
    )
};