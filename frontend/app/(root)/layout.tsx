import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'
// import ReactNode from 'react'
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function Layout({children}: Readonly<{ children: React.ReactNode }>) { 
    // const user = await getUserFromCookie();
    // if (!user) {
    //     redirect("/log-in")
    // }
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