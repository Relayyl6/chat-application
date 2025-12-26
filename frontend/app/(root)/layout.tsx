import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'
// import ReactNode from 'react'

export default function Layout({children}: Readonly<{ children: React.ReactNode }>) { 
    return (
        <main className='backdrop-blur-xl flex flex-col relative h-screen overflow-hidden'>
            <NavBar />
            <div className='flex flex-row flex-1 min-h-0'>
                <Sidebar />
                <section className="flex flex-1 min-h-0">
                  {children}   {/* ← THIS AREA CHANGES BASED ON PAGE */}
                </section>
            </div>
        </main>
    )
};