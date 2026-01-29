import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroSequence from '../components/HeroSequence'
import EventCard from '../components/EventCard'
import eventsData from '../data/events.json'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
    useEffect(() => {
        // Animate sections on scroll
        const sections = document.querySelectorAll('.animate-section')
        sections.forEach((section) => {
            gsap.fromTo(
                section,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            )
        })

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill())
        }
    }, [])

    const stats = [
        { value: '50+', label: 'Events' },
        { value: '5000+', label: 'Participants' },
        { value: '₹5L+', label: 'Prize Pool' },
        { value: '3 Days', label: 'of Innovation' },
    ]

    const featuredEvents = eventsData.slice(0, 3)

    return (
        <div className="bg-deep-black">
            {/* Hero Section */}
            <HeroSequence />

            {/* Explore Section Anchor */}
            <div id="explore" className="scroll-mt-20" />

            {/* Featured Events */}
            <section className="relative py-20 md:py-32 w-full">
                <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">
                    <div className="animate-section text-center mb-12 md:mb-16 w-full">
                        <h2 className="section-title">
                            <span className="text-gradient">Featured Events</span>
                        </h2>
                        <p className="text-white/60 text-base md:text-lg lg:text-xl mt-4 w-full">
                            Discover the most exciting competitions and workshops awaiting you
                        </p>
                    </div>

                    <div className="animate-section w-full flex justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl justify-items-center">
                            {featuredEvents.map((event) => (
                                <div key={event.id} className="w-full max-w-sm">
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="animate-section text-center mt-10 md:mt-12 w-full">
                        <Link
                            to="/events"
                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg bg-white/5 hover:bg-neon-cyan hover:text-deep-black transition-all duration-300"
                        >
                            View All Events →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quote Section - Unified Design */}
            <section className="relative py-24 md:py-36 mt-16 md:mt-24">

                <div className="relative w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">
                    <div className="animate-section text-center max-w-3xl">
                        <blockquote className="font-display text-lg sm:text-xl md:text-2xl font-medium text-white/80 leading-relaxed mb-3">
                            "Innovation distinguishes between a{' '}
                            <span className="text-gradient font-bold">leader</span> and a{' '}
                            <span className="text-gradient font-bold">follower</span>."
                        </blockquote>
                        <cite className="text-white/40 text-xs md:text-sm not-italic">— Steve Jobs</cite>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-16 md:py-24 mt-16 md:mt-24 mb-48 md:mb-64">

                <div className="relative w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">
                    <div className="animate-section text-center max-w-2xl">
                        <h2 className="font-display text-base sm:text-lg md:text-xl font-bold text-white mb-3">
                            Ready to{' '}
                            <span className="text-gradient">Innovate</span>?
                        </h2>
                        <p className="text-white/50 text-xs md:text-sm mb-6">
                            Join thousands of students in the biggest tech fest of the year.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/events" className="btn-primary text-sm px-6 py-2.5">
                                Register Now
                            </Link>
                            <Link to="/schedule" className="btn-secondary text-sm px-6 py-2.5">
                                View Schedule
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spacer before footer */}
            <div className="h-40 md:h-60" />

        </div>
    )
}
