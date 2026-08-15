import Landing from './pages/Landing'
import Cultural from './pages/Cultural'
import Sports from './pages/Sports'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Footer from './components/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Gallery from './pages/Gallery'
import Schedule from './pages/Schedule'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen bg-deep-black">
      <ScrollToTop />

      {/* Show navbar only on FAMT Arena landing page */}
      

      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/technical" element={<Home />} />
          <Route path="/cultural" element={<Cultural />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Only show footer if not on admin page */}
      {location.pathname === '/' && <Footer />}
    </div>
  )
}
