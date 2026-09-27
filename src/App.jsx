import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'

// ==========================================
// FAMT ARENA - MAIN
// ==========================================
import Landing from './pages/Landing'
import Cultural from './pages/Cultural'
import Sports from './pages/Sports'

// ==========================================
// TECHNICAL SECTION
// ==========================================
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'

// ==========================================
// CULTURAL / UTOPIA
// ==========================================
import CulturalEvents from './pages/CulturalEvents'
import EventDetails from './pages/EventDetails'
import EventRegistration from './pages/EventRegistration'
import RegistrationSuccess from './pages/RegistrationSuccess'

// ==========================================
// COMMON PAGES
// ==========================================
import Gallery from './pages/Gallery'
import Schedule from './pages/Schedule'
import About from './pages/About'
import Contact from './pages/Contact'

// ==========================================
// ADMIN
// ==========================================
import Admin from './pages/Admin'

// ==========================================
// USER
// ==========================================
import UserLogin from './pages/UserLogin'


// ==========================================
// SCROLL TO TOP ON PAGE CHANGE
// ==========================================
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}


// ==========================================
// MAIN APP
// ==========================================
export default function App() {

  // ----------------------------------------
  // LENIS SMOOTH SCROLL
  // ----------------------------------------
  useEffect(() => {

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    })

    let animationFrame

    const raf = (time) => {
      lenis.raf(time)
      animationFrame = requestAnimationFrame(raf)
    }

    animationFrame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(animationFrame)
      lenis.destroy()
    }

  }, [])


  return (
    <div className="min-h-screen bg-deep-black">

      {/* =====================================
          SCROLL RESET WHEN ROUTE CHANGES
          ===================================== */}
      <ScrollToTop />

      <main>

        <Routes>

          {/* =====================================
              FAMT ARENA - MAIN LANDING PAGE
              ===================================== */}

          <Route
            path="/"
            element={<Landing />}
          />


          {/* =====================================
              CULTURAL / UTOPIA
              ===================================== */}

          <Route
            path="/cultural"
            element={<Cultural />}
          />

          <Route
            path="/cultural/events"
            element={<CulturalEvents />}
          />

          <Route
            path="/cultural/events/:eventId"
            element={<EventDetails />}
          />

          <Route
            path="/cultural/events/:eventId/register"
            element={<EventRegistration />}
          />

          <Route
            path="/registration-success"
            element={<RegistrationSuccess />}
          />


          {/* =====================================
              TECHNICAL SECTION
              ===================================== */}

          <Route
            path="/technical"
            element={<Home />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetail />}
          />


          {/* =====================================
              SPORTS SECTION
              ===================================== */}

          {/* Public / Student Sports Page */}
          <Route
            path="/sports"
            element={<Sports />}
          />


          {/* =====================================
              USER LOGIN
              ===================================== */}

          <Route
            path="/user"
            element={<UserLogin />}
          />


          {/* =====================================
              COMMON PAGES
              ===================================== */}

          <Route
            path="/gallery"
            element={<Gallery />}
          />

          <Route
            path="/schedule"
            element={<Schedule />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />


          {/* =====================================
              ADMIN
              ===================================== */}

          <Route
            path="/admin"
            element={<Admin />}
          />


          {/* =====================================
              FALLBACK
              ===================================== */}

          <Route
            path="*"
            element={<Landing />}
          />

        </Routes>

      </main>

    </div>
  )
}