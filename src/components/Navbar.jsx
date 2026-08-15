import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

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
        const activeLink = navRef.current.querySelector(`a[href="${location.pathname}"]`)
        if (activeLink) {
            const { offsetLeft, offsetWidth } = activeLink
            setIndicatorStyle({
                left: offsetLeft,
                width: offsetWidth,
            })
        }
    }

    const handleMouseEnter = (e) => {
        const { offsetLeft, offsetWidth } = e.target
        setIndicatorStyle({
            left: offsetLeft,
            width: offsetWidth,
        })
    }

    const handleMouseLeave = () => {
        updateIndicator()
    }

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center">
                                <span className="font-display font-bold text-deep-black text-lg">B</span>
                            </div>
                            <span className="font-display font-bold text-xl tracking-wider text-white group-hover:text-neon-cyan transition-colors">
                                FAMT ARENA
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div
                            ref={navRef}
                            className="hidden md:flex items-center gap-12 relative"
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Animated Indicator */}
                            <div
                                className="absolute bottom-0 h-1 rounded-full bg-gradient-to-r from-neon-cyan via-white to-electric-purple transition-all duration-300 ease-out shadow-[0_0_20px_rgba(0,245,255,0.8)]"
                                style={{
                                    left: indicatorStyle.left || 0,
                                    width: indicatorStyle.width || 0,
                                    opacity: indicatorStyle.width ? 1 : 0,
                                    transform: indicatorStyle.width ? 'scaleX(1)' : 'scaleX(0)',
                                }}
                            />

                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onMouseEnter={handleMouseEnter}
                                    className={`px-4 py-2 font-medium text-sm tracking-wide transition-colors relative ${location.pathname === item.path
                                        ? 'text-neon-cyan'
                                        : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>



                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-white hover:text-neon-cyan transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <span className="font-display font-bold text-xl text-neon-cyan">MENU</span>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-white hover:text-neon-cyan transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-4 py-3 rounded-lg text-lg font-medium transition-all ${location.pathname === item.path
                                    ? 'bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>


                </div>
            </div>
        </>
    )
}
