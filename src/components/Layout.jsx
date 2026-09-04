import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

// Routes that get a fixed, footer-free "app" shell instead of the normal
// scrolling page — used for focused, session-like screens like the
// workshop lesson player.
const IMMERSIVE_PREFIXES = ['/atolyeler/kurs/']

export function Layout() {
  const { pathname } = useLocation()
  const immersive = IMMERSIVE_PREFIXES.some((p) => pathname.startsWith(p))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`agora-gradient-page lg:pl-60 ${immersive ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen flex flex-col'}`}>
      <Navbar />
      <main className={immersive ? 'flex-1 min-h-0 pt-16 lg:pt-0' : 'flex-1 pt-16 lg:pt-0'}>
        <Outlet />
      </main>
      {!immersive && <Footer />}
    </div>
  )
}
