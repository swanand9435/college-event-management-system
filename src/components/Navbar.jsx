import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [indicatorStyle, setIndicatorStyle] = useState({})
    const navRef = useRef(null)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        updateIndicator()
    }, [location.pathname])

    const updateIndicator = () => {
        if (!navRef.current) return

        const activeLink = navRef.current.querySelector(
            `a[href="${location.pathname}"]`
        )

        if (activeLink) {
            setIndicatorStyle({
                left: activeLink.offsetLeft,
                width: activeLink.offsetWidth,
            })
        }
    }

    const handleMouseEnter = (e) => {
        setIndicatorStyle({
            left: e.currentTarget.offsetLeft,
            width: e.currentTarget.offsetWidth,
        })
    }

    const handleMouseLeave = () => {
        updateIndicator()
    }

    return (
        <>
            {/* NAVBAR */}
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>

                <div className="navbar-container">

                    {/* LOGO */}
                    <Link to="/" className="navbar-logo">

                        <div className="navbar-logo-box">
                            <img
                                src="/images/famt-logo.png"
                                alt="FAMT Logo"
                            />
                        </div>

                        <div className="navbar-brand">
                            <span>FAMT</span>
                            <strong>ARENA</strong>
                        </div>

                    </Link>


                    {/* DESKTOP NAVIGATION */}
                    <div
                        ref={navRef}
                        className="desktop-nav"
                        onMouseLeave={handleMouseLeave}
                    >

                        {/* ACTIVE INDICATOR */}
                        <div
                            className="nav-indicator"
                            style={{
                                left: indicatorStyle.left || 0,
                                width: indicatorStyle.width || 0,
                                opacity: indicatorStyle.width ? 1 : 0,
                            }}
                        />

                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onMouseEnter={handleMouseEnter}
                                className={
                                    location.pathname === item.path
                                        ? 'nav-link active'
                                        : 'nav-link'
                                }
                            >
                                {item.name}
                            </Link>
                        ))}

                    </div>


                    {/* MOBILE BUTTON */}
                    <button
                        className="mobile-menu-button"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </div>

            </nav>


            {/* MOBILE OVERLAY */}
            <div
                className={`mobile-overlay ${
                    mobileMenuOpen ? 'open' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
            />


            {/* MOBILE MENU */}
            <div
                className={`mobile-menu ${
                    mobileMenuOpen ? 'open' : ''
                }`}
            >

                <div className="mobile-menu-header">

                    <div className="mobile-menu-title">
                        <span>FAMT</span>
                        <strong>ARENA</strong>
                    </div>

                    <button
                        className="mobile-close"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        ×
                    </button>

                </div>


                <div className="mobile-nav-links">

                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={
                                location.pathname === item.path
                                    ? 'mobile-nav-link active'
                                    : 'mobile-nav-link'
                            }
                        >
                            <span>{item.name}</span>
                            <span>↗</span>
                        </Link>
                    ))}

                </div>


                <div className="mobile-menu-footer">
                    <span>FINOLEX ACADEMY OF MANAGEMENT & TECHNOLOGY</span>
                    <span>RATNAGIRI • MAHARASHTRA</span>
                </div>

            </div>
        </>
    )
}