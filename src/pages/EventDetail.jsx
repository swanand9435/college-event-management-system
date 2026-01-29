import { useParams, Link } from 'react-router-dom'
import Timeline from '../components/Timeline'
import eventsData from '../data/events.json'

export default function EventDetail() {
    const { id } = useParams()
    const event = eventsData.find((e) => e.id === id)

    if (!event) {
        return (
            <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
                <div className="text-center">
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

    const getCategoryColor = (category) => {
        const colors = {
            'Technical': 'from-neon-cyan to-aurora-blue',
            'Robotics': 'from-electric-purple to-pink-500',
            'Design': 'from-orange-400 to-pink-500',
            'Literary': 'from-green-400 to-emerald-500',
            'Business': 'from-yellow-400 to-orange-500',
        }
        return colors[category] || 'from-neon-cyan to-electric-purple'
    }

    return (
        <div className="min-h-screen bg-deep-black pt-24 pb-16">
            {/* Hero Banner */}
            <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-deep-black via-purple-900/20 to-deep-black flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${getCategoryColor(event.category)} flex items-center justify-center`}>
                        <span className="font-display font-bold text-6xl text-deep-black">
                            {event.name.charAt(0)}
                        </span>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent" />

                {/* Back Button */}
                <Link
                    to="/events"
                    className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Events
                </Link>
            </section>

            {/* Event Details */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                {/* Header Card */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(event.category)} text-deep-black mb-4`}>
                                {event.category}
                            </span>
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                                {event.name}
                            </h1>
                        </div>
                        <a
                            href={event.formLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                        >
                            Register Now
                        </a>
                    </div>

                    <p className="text-white/70 text-lg leading-relaxed">
                        {event.description}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Rules */}
                    <div className="glass-card p-6">
                        <h3 className="font-display text-xl font-semibold text-neon-cyan mb-4 flex items-center gap-2">
                            <span>📋</span> Rules
                        </h3>
                        <ul className="space-y-3">
                            {event.rules.map((rule, index) => (
                                <li key={index} className="flex items-start gap-3 text-white/70">
                                    <span className="text-neon-cyan mt-1">•</span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Prizes */}
                    <div className="glass-card p-6">
                        <h3 className="font-display text-xl font-semibold text-neon-cyan mb-4 flex items-center gap-2">
                            <span>🏆</span> Prizes
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl">
                                    🥇
                                </div>
                                <div>
                                    <div className="text-white/50 text-sm">1st Place</div>
                                    <div className="text-white font-semibold text-lg">{event.prizes.first}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl">
                                    🥈
                                </div>
                                <div>
                                    <div className="text-white/50 text-sm">2nd Place</div>
                                    <div className="text-white font-semibold text-lg">{event.prizes.second}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl">
                                    🥉
                                </div>
                                <div>
                                    <div className="text-white/50 text-sm">3rd Place</div>
                                    <div className="text-white font-semibold text-lg">{event.prizes.third}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eligibility */}
                <div className="glass-card p-6 mb-12">
                    <h3 className="font-display text-xl font-semibold text-neon-cyan mb-4 flex items-center gap-2">
                        <span>✅</span> Eligibility
                    </h3>
                    <p className="text-white/70">{event.eligibility}</p>
                </div>

                {/* Timeline */}
                <div className="mb-12">
                    <h3 className="font-display text-2xl font-semibold text-white mb-8 text-center">
                        Event <span className="text-gradient">Timeline</span>
                    </h3>
                    <Timeline timeline={event.timeline} />
                </div>

                {/* CTA */}
                <div className="text-center">
                    <a
                        href={event.formLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-lg px-12 py-4"
                    >
                        Register for {event.name}
                    </a>
                </div>
            </section>
        </div>
    )
}
