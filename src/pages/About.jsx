import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import teamData from '../data/team.json'

gsap.registerPlugin(ScrollTrigger)

// Node with box for Core and Secretaries
function BoxedNode({ title, subtitle, people }) {
    return (
        <div className="relative group w-64">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-cyan/5 to-electric-purple/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative h-24 bg-deep-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 group-hover:border-neon-cyan/50 transition-all duration-300 flex flex-col justify-center">
                <h3
                    className="font-display font-bold text-white text-center uppercase tracking-wide mb-1"
                    style={{ fontSize: '14px' }}
                >
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-white/40 text-center mb-1" style={{ fontSize: '12px' }}>{subtitle}</p>
                )}
                <p className="text-white/80 text-center leading-relaxed" style={{ fontSize: '12px' }}>{people}</p>
            </div>
        </div>
    )
}

// Borderless node for committees - just text
function TextNode({ title, people }) {
    return (
        <div className="relative text-center w-full flex flex-col items-center">
            <h3
                className="font-display font-bold text-white uppercase tracking-wide mb-1 whitespace-nowrap"
                style={{ fontSize: '14px' }}
            >
                {title}
            </h3>
            <p
                className="text-white/70 leading-tight text-center max-w-[200px]"
                style={{ fontSize: '12px' }}
            >
                {people}
            </p>
        </div>
    )
}

export default function About() {
    const containerRef = useRef(null)

    useEffect(() => {
        gsap.fromTo(
            '.org-node',
            { opacity: 0, y: 15 },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                },
            }
        )

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill())
        }
    }, [])

    const row1 = teamData.committees.slice(0, 4)
    const row2 = teamData.committees.slice(4, 7)
    const row3 = teamData.committees.slice(7, 11)

    const formatCoHeads = (coHeads) => {
        if (!coHeads || coHeads.length === 0) return '—'
        return coHeads.join(', ')
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-deep-black pt-24 pb-16">
            {/* Subtle background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-electric-purple/3 rounded-full blur-3xl" />
            </div>

            {/* Title */}
            <section className="relative z-10 py-6 text-center">
                <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                    <span className="text-gradient">Brainwaves 2026</span>
                </h1>
            </section>

            {/* Desktop Organization Chart */}
            <section className="hidden lg:flex relative z-10 flex-col items-center px-4">

                {/* Level 1: Brainwaves Core */}
                <div className="org-node">
                    <BoxedNode
                        title="Brainwaves Core"
                        people="Coordinator: Prof. Swapnali Teli | Co-Coordinator: Prof. Sprooha Athalye"
                    />
                </div>

                <div className="w-px h-8 bg-white/30" />
                <div className="w-60 h-px bg-white/30" />
                <div className="flex w-60 justify-between">
                    <div className="w-px h-6 bg-white/30" />
                    <div className="w-px h-6 bg-white/30" />
                </div>

                {/* Level 2: Technical Secretaries */}
                <div className="flex gap-6">
                    <div className="org-node">
                        <BoxedNode
                            title="Technical Secretary"
                            subtitle="Boys"
                            people="Mr. Swanand Shenai"
                        />
                    </div>
                    <div className="org-node">
                        <BoxedNode
                            title="Technical Secretary"
                            subtitle="Girls"
                            people="Ms. Anushka Talawdekar"
                        />
                    </div>
                </div>

                <div className="flex w-60 justify-between">
                    <div className="w-px h-6 bg-white/30" />
                    <div className="w-px h-6 bg-white/30" />
                </div>
                <div className="w-60 h-px bg-white/30" />
                <div className="w-px h-6 bg-white/30" />

                {/* Committees Label */}
                <div className="org-node mb-3">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-neon-cyan/10 to-electric-purple/10 border border-white/20 rounded-lg">
                        <h2 className="font-display text-xs font-bold text-gradient text-center uppercase tracking-widest">
                            Committees
                        </h2>
                    </div>
                </div>

                <div className="w-px h-5 bg-white/30" />

                {/* Row 1: 4 committees - PERFECTLY ALIGNED */}
                <div className="relative w-full max-w-6xl mb-6">
                    <div className="absolute top-0 left-0 w-full h-px bg-white/30" />
                    <div className="grid grid-cols-4 pt-0">
                        {row1.map((committee, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-px h-5 bg-white/30" />
                                <div className="org-node pt-1">
                                    <TextNode
                                        title={committee.name}
                                        people={`Head: ${committee.head} | Co-Head: ${formatCoHeads(committee.coHead)}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: 3 committees - PERFECTLY ALIGNED */}
                <div className="relative w-full max-w-5xl mb-6">
                    <div className="w-px h-5 bg-white/30 mx-auto -mt-4 mb-0" />
                    <div className="absolute top-5 left-0 w-full h-px bg-white/30" />
                    <div className="grid grid-cols-3 pt-5">
                        {row2.map((committee, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-px h-5 bg-white/30" />
                                <div className="org-node pt-1">
                                    <TextNode
                                        title={committee.name}
                                        people={`Head: ${committee.head} | Co-Head: ${formatCoHeads(committee.coHead)}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 3: 4 committees - PERFECTLY ALIGNED */}
                <div className="relative w-full max-w-6xl">
                    <div className="w-px h-5 bg-white/30 mx-auto -mt-4 mb-0" />
                    <div className="absolute top-5 left-0 w-full h-px bg-white/30" />
                    <div className="grid grid-cols-4 pt-5">
                        {row3.map((committee, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-px h-5 bg-white/30" />
                                <div className="org-node pt-1">
                                    <TextNode
                                        title={committee.name}
                                        people={`Head: ${committee.head} | Co-Head: ${formatCoHeads(committee.coHead)}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mobile/Tablet Simple List */}
            <section className="lg:hidden relative z-10 px-5 max-w-2xl mx-auto pb-10">
                {/* Core */}
                <div className="org-node mb-8">
                    <div className="bg-deep-black/90 backdrop-blur-sm border border-neon-cyan/30 rounded-2xl p-6 shadow-lg shadow-neon-cyan/5">
                        <h3 className="font-display font-bold text-gradient text-center uppercase tracking-wide mb-3 text-lg">
                            Brainwaves Core
                        </h3>
                        <p className="text-white/80 text-center text-sm leading-relaxed mb-1">
                            Coordinator: Prof. Swapnali Teli
                        </p>
                        <p className="text-white/80 text-center text-sm leading-relaxed">
                            Co-Coordinator: Prof. Sprooha Athalye
                        </p>
                    </div>
                </div>

                {/* Secretaries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                    <div className="org-node">
                        <div className="bg-deep-black/90 backdrop-blur-sm border border-electric-purple/30 rounded-2xl p-5 shadow-lg shadow-electric-purple/5">
                            <h3 className="font-display font-bold text-white text-center uppercase tracking-wide mb-2 text-base">
                                Technical Secretary
                            </h3>
                            <p className="text-neon-cyan text-center mb-2 text-sm font-medium">Boys</p>
                            <p className="text-white/80 text-center text-sm">Mr. Swanand Shenai</p>
                        </div>
                    </div>
                    <div className="org-node">
                        <div className="bg-deep-black/90 backdrop-blur-sm border border-electric-purple/30 rounded-2xl p-5 shadow-lg shadow-electric-purple/5">
                            <h3 className="font-display font-bold text-white text-center uppercase tracking-wide mb-2 text-base">
                                Technical Secretary
                            </h3>
                            <p className="text-neon-cyan text-center mb-2 text-sm font-medium">Girls</p>
                            <p className="text-white/80 text-center text-sm">Ms. Anushka Talawdekar</p>
                        </div>
                    </div>
                </div>

                {/* Committees Header */}
                <div className="mb-6">
                    <div className="px-6 py-3 bg-gradient-to-r from-neon-cyan/20 to-electric-purple/20 border border-white/20 rounded-2xl">
                        <h2 className="font-display text-base font-bold text-gradient text-center uppercase tracking-widest">
                            Committees
                        </h2>
                    </div>
                </div>

                {/* All Committees - Single Column for Mobile, 2 for Tablet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {teamData.committees.map((committee, idx) => (
                        <div key={idx} className="org-node bg-deep-black/70 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:border-neon-cyan/40 transition-all">
                            <h3 className="font-display font-bold text-white uppercase tracking-wide mb-3 text-center text-base">
                                {committee.name}
                            </h3>
                            <div className="text-white/80 leading-relaxed text-center text-sm space-y-1.5">
                                <p className="break-words">Head: {committee.head}</p>
                                <p className="break-words">Co-Head: {formatCoHeads(committee.coHead)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
