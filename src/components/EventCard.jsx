import { useRef, useState } from 'react'

export default function EventCard({ event }) {
    const cardRef = useRef(null)
    const [transform, setTransform] = useState('')
    const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 })

    const handleMouseMove = (e) => {
        if (!cardRef.current) return

        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
        setGlowPosition({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
        })
    }

    const handleMouseLeave = () => {
        setTransform('')
    }

    return (
        <div
            ref={cardRef}
            className="event-card-uniform group relative overflow-hidden transition-all duration-300 ease-out bg-white/5 border border-white/10 hover:border-cyan-400/30"
            style={{
                transform,
                width: '100%',
                height: '300px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Glow Effect */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: `radial-gradient(400px circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(0, 245, 255, 0.1), transparent 40%)`,
                }}
            />

            {/* Vertical Layout: Fixed dimensions for perfect uniformity */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Poster Section - Exact dimensions */}
                <div
                    className="relative overflow-hidden bg-deep-black/50"
                    style={{
                        width: '100%',
                        height: '180px',
                        flexShrink: 0
                    }}
                >
                    {event.poster ? (
                        <img
                            src={event.poster}
                            alt={event.name}
                            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                // Show fallback if image fails
                                e.target.nextSibling.style.display = 'flex'
                            }}
                        />
                    ) : null}

                    {/* Fallback Placeholder */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-deep-black via-purple-900/20 to-deep-black flex items-center justify-center"
                        style={{ display: event.poster ? 'none' : 'flex' }}
                    >
                        <span className="font-display font-bold text-3xl text-white/20">
                            {event.name.charAt(0)}
                        </span>
                    </div>
                </div>

                {/* Content Section - Fixed dimensions */}
                <div
                    style={{
                        flex: 1,
                        height: '120px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    {/* Title container - Fixed height and positioning */}
                    <div
                        style={{
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}
                    >
                        <h3
                            className="font-display font-semibold text-white/90 group-hover:text-neon-cyan transition-colors"
                            style={{
                                fontSize: '14px',
                                lineHeight: '18px',
                                width: '100%',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {event.name}
                        </h3>
                    </div>

                    {/* Action Buttons - Fixed dimensions and spacing */}
                    <div
                        style={{
                            height: '36px',
                            display: 'grid',
                            gridTemplateColumns: event.showExploreOnly ? '1fr' : '1fr 1fr',
                            gap: '8px',
                            flexShrink: 0,
                            marginTop: 'auto'
                        }}
                    >
                        {event.showExploreOnly ? (
                            <a
                                href="/events"
                                className="btn-primary font-medium"
                                style={{
                                    width: '100%',
                                    height: '36px',
                                    padding: '0 8px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    borderRadius: '6px'
                                }}
                            >
                                <span>Explore</span>
                            </a>
                        ) : (
                            <>
                                <a
                                    href={event.formLink || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary font-medium"
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        padding: '0 8px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <span>Register</span>
                                </a>

                                <a
                                    href={`/events/${event.id}`}
                                    className="btn-secondary font-medium"
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        padding: '0 8px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <span>See Details</span>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
