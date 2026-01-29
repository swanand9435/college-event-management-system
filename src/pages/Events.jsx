import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import EventCard from '../components/EventCard'
import eventsData from '../data/events.json'

export default function Events() {
    const [selectedFilter, setSelectedFilter] = useState('All')
    const [filteredEvents, setFilteredEvents] = useState(eventsData)

    const filterOptions = ['All', 'BrainByte', 'Kalakruti', 'Stabila']

    useEffect(() => {
        if (selectedFilter === 'All') {
            setFilteredEvents(eventsData)
        } else {
            setFilteredEvents(eventsData.filter((e) => e.parentEvent === selectedFilter))
        }
    }, [selectedFilter])

    useEffect(() => {
        gsap.fromTo(
            '.event-card',
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
            }
        )
    }, [filteredEvents])

    return (
        <div className="min-h-screen bg-deep-black pt-24 pb-16">
            {/* Hero Section - Perfect center alignment with balanced spacing */}
            <section className="relative py-12 md:py-16 lg:py-20">
                {/* Hero content with absolute perfect centering */}
                <div className="relative w-full">
                    <div className="flex flex-col items-center justify-center text-center px-6">
                        {/* Main heading with perfect spacing */}
                        <div className="flex flex-col items-center space-y-4 mb-6">
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                                <span className="text-gradient">Events</span>
                            </h1>
                            <div className="w-20 h-1 bg-gradient-to-r from-neon-cyan to-electric-purple rounded-full"></div>
                        </div>
                        
                        {/* Description with perfect center alignment */}
                        <div className="flex justify-center w-full">
                            <p className="text-white/70 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed font-medium text-center">
                                Explore our diverse range of competitions, workshops, and activities.
                                <br className="hidden sm:block" />
                                Find your passion and register today.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Section - Enhanced design with generous spacing */}
            <section className="relative mb-24 md:mb-28 lg:mb-32">
                <div className="w-full">
                    <div className="flex justify-center px-6 mb-8">
                        <div className="relative">
                            <label htmlFor="event-filter" className="sr-only">Filter Events</label>
                            <select
                                id="event-filter"
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="appearance-none bg-white/10 backdrop-blur-md border-2 border-white/25 rounded-3xl px-10 py-5 pr-16 text-white font-semibold text-xl cursor-pointer hover:border-neon-cyan/70 hover:bg-white/15 focus:border-neon-cyan focus:outline-none focus:ring-4 focus:ring-neon-cyan/25 transition-all duration-300 min-w-[320px] shadow-xl"
                            >
                                {filterOptions.map((option) => (
                                    <option
                                        key={option}
                                        value={option}
                                        className="bg-deep-black text-white font-medium text-lg"
                                    >
                                        {option === 'All' ? 'All Events' : option}
                                    </option>
                                ))}
                            </select>
                            {/* Enhanced dropdown arrow */}
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-7 h-7 text-white/90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Active filter indicator with perfect centering */}
                    {selectedFilter !== 'All' && (
                        <div className="flex justify-center px-6">
                            <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-neon-cyan/30 to-aurora-blue/30 border-2 border-neon-cyan/50 text-neon-cyan text-lg font-semibold backdrop-blur-sm shadow-xl">
                                <span>Showing: {selectedFilter}</span>
                                <button
                                    onClick={() => setSelectedFilter('All')}
                                    className="hover:text-white transition-colors duration-200 p-1.5 hover:bg-white/15 rounded-full"
                                    aria-label="Clear filter"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Events Grid - Enhanced with consistent spacing and alignment */}
            <section className="events-grid-section">
                <div className="events-grid-container">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="events-grid-item event-card">
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="events-empty-state">
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="font-display text-2xl text-white mb-3">No Events Found</h3>
                        <p className="text-white/60 text-lg">Try selecting a different category</p>
                    </div>
                )}
            </section>
        </div>
    )
}
