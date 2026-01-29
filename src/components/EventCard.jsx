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
            className="group relative rounded-xl overflow-hidden transition-all duration-300 ease-out bg-white/5 border border-white/10 hover:border-cyan-400/30 w-full h-full flex flex-col"
            style={{ transform }}
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

            {/* Poster Section (Compact 16:9) */}
            <div className="relative aspect-video overflow-hidden w-full bg-deep-black/50 shrink-0">
                {event.poster ? (
                    <img
                        src={event.poster}
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
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
                    <span className="font-display font-bold text-4xl text-white/20">
                        {event.name.charAt(0)}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col items-center text-center">
                <div className="flex-1 w-full flex items-center justify-center mb-6 min-h-[3.5rem]">
                    <h3 className="font-display font-semibold text-lg text-white/90 group-hover:text-neon-cyan transition-colors w-full line-clamp-2">
                        {event.name}
                    </h3>
                </div>

                {/* Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                    <a
                        href={event.formLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full !px-3 !py-3 !text-xs md:!text-sm !gap-2 justify-center"
                    >
                        <span>Register</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>

                    <a
                        href={`/events/${event.id}`}
                        className="btn-secondary w-full !px-3 !py-3 !text-xs md:!text-sm !gap-2 justify-center"
                    >
                        <span>Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    )
}
