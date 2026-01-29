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
            {/* Hero */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-purple/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col items-center text-center">
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
                        <span className="text-gradient">Events</span>
                    </h1>
                    <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
                        Explore our diverse range of competitions, workshops, and activities.
                        <br className="hidden md:block" />
                        Find your passion and register today.
                    </p>
                </div>
            </section>

            {/* Dropdown Filter */}
            <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 mb-12 mt-8">
                <div className="flex justify-center">
                    <div className="relative">
                        <label htmlFor="event-filter" className="sr-only">Filter Events</label>
                        <select
                            id="event-filter"
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="appearance-none bg-white/5 border border-white/20 rounded-xl px-6 py-3 pr-12 text-white font-medium text-base cursor-pointer hover:border-neon-cyan/50 focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all min-w-[220px]"
                        >
                            {filterOptions.map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                    className="bg-deep-black text-white"
                                >
                                    {option === 'All' ? 'All Events' : option}
                                </option>
                            ))}
                        </select>
                        {/* Custom dropdown arrow */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-white/60"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active filter indicator */}
                {selectedFilter !== 'All' && (
                    <div className="flex justify-center mt-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-neon-cyan/20 to-aurora-blue/20 border border-neon-cyan/30 text-neon-cyan text-sm font-medium">
                            <span>Showing: {selectedFilter}</span>
                            <button
                                onClick={() => setSelectedFilter('All')}
                                className="hover:text-white transition-colors"
                                aria-label="Clear filter"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    </div>
                )}
            </section>

            {/* Events Grid */}
            <section className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="event-card">
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="font-display text-2xl text-white mb-2">No Events Found</h3>
                        <p className="text-white/60">Try selecting a different category</p>
                    </div>
                )}
            </section>
        </div>
    )
}
