import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'

// ==========================================
// FAMT ARENA - MAIN
// ==========================================
import Landing from './pages/Landing'
import Cultural from './pages/Cultural'
import Sports from './pages/Sports'
import SportsRegistration from './pages/SportsRegistration'

// ==========================================
// TECHNICAL SECTION (NEW REBUILT MODULE)
// ==========================================
import Technical from './pages/Technical'
import TechnicalRegistration from './pages/TechnicalRegistration'
import TechnicalAdmin from './pages/TechnicalAdmin'

// ==========================================
// CULTURAL / UTOPIA
// ==========================================
import CulturalEvents from './pages/CulturalEvents'
import EventDetails from './pages/EventDetails'
import EventRegistration from './pages/EventRegistration'
import RegistrationSuccess from './pages/RegistrationSuccess'
import CulturalCommitteeRegistration from './pages/CulturalCommitteeRegistration'
import CulturalAdmin from './pages/CulturalAdmin'

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
            path="/cultural/committee/:committeeId"
            element={<CulturalCommitteeRegistration />}
          />

          <Route
            path="/cultural/admin"
            element={<CulturalAdmin />}
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
              TECHNICAL SECTION (REBUILT MODULE)
              ===================================== */}

          <Route
            path="/technical"
            element={<Technical />}
          />

          <Route
            path="/technical/admin"
            element={<TechnicalAdmin />}
          />

          <Route
            path="/technical/stabilia"
            element={<TechnicalRegistration />}
          />

          <Route
            path="/technical/brainbyte"
            element={<TechnicalRegistration />}
          />

          <Route
            path="/technical/kalakruti/:competitionSlug"
            element={<TechnicalRegistration />}
          />

          <Route
            path="/technical/register/:eventSlug"
            element={<TechnicalRegistration />}
          />

          {/* Compatibility routes */}
          <Route
            path="/events"
            element={<Technical />}
          />

          <Route
            path="/events/:id"
            element={<TechnicalRegistration />}
          />


          {/* =====================================
              SPORTS SECTION
              ===================================== */}

          {/* Public / Student Sports Page */}
          <Route
            path="/sports"
            element={<Sports />}
          />

          {/* Separate Sports Registration Page */}
          <Route
            path="/sports/register/:categoryId"
            element={<SportsRegistration />}
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