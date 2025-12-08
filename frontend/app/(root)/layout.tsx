import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'
// import ReactNode from 'react'

export default function Layout({children}: Readonly<{ children: React.ReactNode }>) { 
    return (
        <main className='backdrop-blur-xl flex flex-col relative'>
            <NavBar />
            <div className='flex flex-row'>
                <Sidebar />
                <section className="flex flex-1">
                  {children}   {/* ← THIS AREA CHANGES BASED ON PAGE */}
                </section>
            </div>
        </main>
    )
};