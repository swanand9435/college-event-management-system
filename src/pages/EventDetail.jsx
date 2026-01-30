import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import eventsData from '../data/events.json'

// Collapsible Section Component
function CollapsibleSection({ title, icon, children, defaultOpen = false, highlight = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const contentRef = useRef(null)
    const [height, setHeight] = useState(defaultOpen ? 'auto' : 0)

    useEffect(() => {
        if (isOpen) {
            const contentHeight = contentRef.current?.scrollHeight
            setHeight(contentHeight)
            // After transition, set to auto for dynamic content
            const timer = setTimeout(() => setHeight('auto'), 300)
            return () => clearTimeout(timer)
        } else {
            // First set to actual height, then to 0 for smooth animation
            const contentHeight = contentRef.current?.scrollHeight
            setHeight(contentHeight)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setHeight(0)
                })
            })
        }
    }, [isOpen])

    return (
        <div className={`collapsible-section ${highlight ? 'highlight-section' : ''}`}>
            <button
                className="collapsible-header"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="collapsible-title">
                    <span className="collapsible-icon">{icon}</span>
                    <h3>{title}</h3>
                </div>
                <svg
                    className={`chevron-icon ${isOpen ? 'rotate' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className="collapsible-content"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
            >
                <div ref={contentRef} className="collapsible-inner">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default function EventDetail() {
    const { id } = useParams()
    const event = eventsData.find((e) => e.id === id)
    const pageRef = useRef(null)

    useEffect(() => {
        // GSAP animations on page load
        if (pageRef.current) {
            gsap.fromTo(
                '.event-detail-animate',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out',
                }
            )
        }
    }, [id])

    if (!event) {
        return (
            <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
                <div className="text-center event-detail-animate">
                    <div className="text-8xl mb-6">🔍</div>
                    <h1 className="font-display text-4xl text-white mb-4">Event Not Found</h1>
                    <p className="text-white/60 mb-8">The event you're looking for doesn't exist.</p>
                    <Link to="/events" className="btn-primary">
                        Browse Events
                    </Link>
                </div>
            </div>
        )
    }

    // Format theme as array for consistent handling
    const themes = Array.isArray(event.theme) ? event.theme : (event.theme ? [event.theme] : [])
    const hasThemes = themes.length > 0
    const hasRules = event.rules && event.rules.length > 0
    const hasPrizes = event.prizeDetails && Object.keys(event.prizeDetails).length > 0
    const hasVenue = event.venueDate && (event.venueDate.venue || event.venueDate.date)
    const hasCoordinator = event.coordinator && (event.coordinator.name || event.coordinator.phone)

    // Format phone number for tel link
    const formatPhoneLink = (phone) => {
        if (!phone) return null
        // Handle multiple phone numbers
        const phones = phone.split('/').map(p => p.trim())
        return phones
    }

    return (
        <div ref={pageRef} className="min-h-screen bg-deep-black pt-24 pb-16">
            {/* Hero Section with Background */}
            <section className="event-detail-hero">
                <div className="event-detail-hero-bg">
                    {event.poster && (
                        <img
                            src={event.poster}
                            alt=""
                            className="event-detail-hero-image"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    )}
                    <div className="event-detail-hero-overlay"></div>
                </div>

                {/* Back Button */}
                <Link to="/events" className="event-detail-back-btn event-detail-animate">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Events</span>
                </Link>

                {/* Centered Event Title */}
                <div className="event-detail-title-container event-detail-animate">
                    <span className="event-detail-parent-tag">{event.parentEvent}</span>
                    <h1 className="event-detail-title">{event.name}</h1>
                    <div className="event-detail-title-underline"></div>
                </div>
            </section>

            {/* Main Content */}
            <section className="event-detail-content">
                {/* Description Card */}
                <div className="event-detail-card event-detail-animate">
                    <div className="event-detail-description">
                        <p>{event.description}</p>
                    </div>

                    {/* BrainByte Placeholder */}
                    {!event.detailsAvailable && (
                        <div className="event-detail-placeholder">
                            <div className="placeholder-icon">🚀</div>
                            <h3>Coming Soon</h3>
                            <p>Details will be updated soon. Stay tuned!</p>
                        </div>
                    )}

                    {/* Register Button - Top */}
                    {event.detailsAvailable && (
                        <div className="event-detail-cta-top">
                            <a
                                href={event.formLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary event-detail-register-btn"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Register Now
                            </a>
                        </div>
                    )}
                </div>

                {/* Collapsible Sections Grid */}
                {event.detailsAvailable && (
                    <div className="event-detail-sections-grid">
                        {/* Left Column */}
                        <div className="event-detail-column">
                            {/* Theme Section */}
                            {hasThemes && (
                                <div className="event-detail-animate">
                                    <CollapsibleSection title="Theme" icon="🎨" defaultOpen={true}>
                                        <ul className="theme-list">
                                            {themes.map((theme, index) => (
                                                <li key={index} className="theme-item">
                                                    <span className="theme-bullet">◆</span>
                                                    <span>{theme}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                </div>
                            )}

                            {/* Rules Section */}
                            {hasRules && (
                                <div className="event-detail-animate">
                                    <CollapsibleSection title="Rules" icon="📋" defaultOpen={true}>
                                        <ul className="rules-list">
                                            {event.rules.map((rule, index) => (
                                                <li key={index} className="rule-item">
                                                    <span className="rule-number">{index + 1}</span>
                                                    <span>{rule}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="event-detail-column">
                            {/* Prizes Section */}
                            {hasPrizes && (
                                <div className="event-detail-animate">
                                    <CollapsibleSection title="Prizes" icon="🏆" defaultOpen={true} highlight={true}>
                                        <div className="prizes-container">
                                            {event.prizeDetails.first && (
                                                <div className="prize-item prize-first">
                                                    <div className="prize-medal">🥇</div>
                                                    <div className="prize-info">
                                                        <span className="prize-label">1st Place</span>
                                                        <span className="prize-value">{event.prizeDetails.first}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {event.prizeDetails.second && (
                                                <div className="prize-item prize-second">
                                                    <div className="prize-medal">🥈</div>
                                                    <div className="prize-info">
                                                        <span className="prize-label">2nd Place</span>
                                                        <span className="prize-value">{event.prizeDetails.second}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {event.prizeDetails.third && (
                                                <div className="prize-item prize-third">
                                                    <div className="prize-medal">🥉</div>
                                                    <div className="prize-info">
                                                        <span className="prize-label">3rd Place</span>
                                                        <span className="prize-value">{event.prizeDetails.third}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}

                            {/* Venue & Date Section */}
                            {hasVenue && (
                                <div className="event-detail-animate">
                                    <CollapsibleSection title="Venue & Date" icon="📍" defaultOpen={true}>
                                        <div className="venue-container">
                                            {event.venueDate.venue && (
                                                <div className="venue-item">
                                                    <svg className="venue-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{event.venueDate.venue}</span>
                                                </div>
                                            )}
                                            {event.venueDate.date && (
                                                <div className="venue-item">
                                                    <svg className="venue-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="venue-date-highlight">{event.venueDate.date}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}

                            {/* Coordinator Contact Section */}
                            {hasCoordinator && (
                                <div className="event-detail-animate">
                                    <CollapsibleSection title="Coordinator" icon="📞" defaultOpen={true}>
                                        <div className="coordinator-container">
                                            {event.coordinator.name && (
                                                <div className="coordinator-item">
                                                    <svg className="coordinator-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="coordinator-name">{event.coordinator.name}</span>
                                                </div>
                                            )}
                                            {event.coordinator.phone && (
                                                <div className="coordinator-phones">
                                                    {formatPhoneLink(event.coordinator.phone).map((phone, index) => (
                                                        <a
                                                            key={index}
                                                            href={`tel:+91${phone.replace(/\s/g, '')}`}
                                                            className="coordinator-phone-link"
                                                        >
                                                            <svg className="coordinator-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            <span>+91 {phone}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Eligibility Badge */}
                {event.eligibility && event.detailsAvailable && (
                    <div className="event-detail-eligibility event-detail-animate">
                        <span className="eligibility-icon">✅</span>
                        <span className="eligibility-text">Eligibility: {event.eligibility}</span>
                    </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="event-detail-actions event-detail-animate">
                    {event.detailsAvailable && (
                        <a
                            href={event.formLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary event-detail-action-btn"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Register for {event.name}
                        </a>
                    )}
                    <Link to="/events" className="btn-secondary event-detail-action-btn">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Events
                    </Link>
                </div>
            </section>
        </div>
    )
}
