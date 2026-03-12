import Sidebar, { MobileSidebar } from '@/components/Sidebar'
import NavBar from '@/components/NavBar'

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className='backdrop-blur-xl flex flex-col relative h-screen overflow-hidden'>
      <NavBar />

      <div className='flex flex-row flex-1 min-h-0'>
        <Sidebar />

        <section className="flex flex-1 min-h-0">
          {children}
        </section>
      </div>

      {/* Mobile floating sidebar */}
      <MobileSidebar />
    </main>
  )
}