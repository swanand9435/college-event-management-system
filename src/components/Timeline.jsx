import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Timeline({ timeline }) {
    const containerRef = useRef(null)
    const stagesRef = useRef([])

    useEffect(() => {
        if (!containerRef.current) return

        const stages = stagesRef.current

        stages.forEach((stage, index) => {
            if (!stage) return

            gsap.fromTo(
                stage,
                {
                    opacity: 0,
                    x: index % 2 === 0 ? -50 : 50,
                },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: stage,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            )
        })

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [timeline])

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500'
            case 'active':
                return 'bg-neon-cyan animate-pulse'
            case 'upcoming':
            default:
                return 'bg-white/30'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return '✓'
            case 'active':
                return '●'
            case 'upcoming':
            default:
                return '○'
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div ref={containerRef} className="relative py-8">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan via-electric-purple to-aurora-blue transform -translate-x-1/2" />

            {/* Timeline Stages */}
            <div className="space-y-12">
                {timeline.map((item, index) => (
                    <div
                        key={index}
                        ref={(el) => (stagesRef.current[index] = el)}
                        className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                            }`}
                    >
                        {/* Content Card */}
                        <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                            <div className="glass-card p-5 inline-block">
                                <div className="flex items-center gap-2 mb-2 justify-end">
                                    {index % 2 !== 0 && (
                                        <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                                    )}
                                    <h4 className="font-display font-semibold text-lg text-white">
                                        {item.stage}
                                    </h4>
                                    {index % 2 === 0 && (
                                        <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                                    )}
                                </div>
                                <p className="text-neon-cyan text-sm font-medium">
                                    {formatDate(item.date)}
                                </p>
                            </div>
                        </div>

                        {/* Center Dot */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-4 border-deep-black ${item.status === 'completed'
                                        ? 'bg-green-500 text-white'
                                        : item.status === 'active'
                                            ? 'bg-neon-cyan text-deep-black animate-pulse-glow'
                                            : 'bg-white/10 text-white/50 border-white/20'
                                    }`}
                            >
                                {getStatusIcon(item.status)}
                            </div>
                        </div>

                        {/* Empty space for other side */}
                        <div className="w-5/12" />
                    </div>
                ))}
            </div>
        </div>
    )
}
