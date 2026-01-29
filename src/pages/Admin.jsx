import { useState, useEffect } from 'react'
import eventsData from '../data/events.json'

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [events, setEvents] = useState([])
    const [editingEvent, setEditingEvent] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)

    // Simple password protection (not secure, just for demo)
    const ADMIN_PASSWORD = 'brainwaves2026'

    useEffect(() => {
        // Load events from localStorage or use default data
        const savedEvents = localStorage.getItem('brainwaves_events')
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents))
        } else {
            setEvents(eventsData)
        }
    }, [])

    const handleLogin = (e) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
        } else {
            alert('Incorrect password')
        }
    }

    const saveEvents = (newEvents) => {
        setEvents(newEvents)
        localStorage.setItem('brainwaves_events', JSON.stringify(newEvents))
    }

    const handleDeleteEvent = (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            const newEvents = events.filter((e) => e.id !== id)
            saveEvents(newEvents)
        }
    }

    const handleUpdateEvent = (updatedEvent) => {
        const newEvents = events.map((e) =>
            e.id === updatedEvent.id ? updatedEvent : e
        )
        saveEvents(newEvents)
        setEditingEvent(null)
    }

    const handleAddEvent = (newEvent) => {
        const eventWithId = {
            ...newEvent,
            id: newEvent.name.toLowerCase().replace(/\s+/g, '-'),
        }
        saveEvents([...events, eventWithId])
        setShowAddForm(false)
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
                <div className="glass-card p-8 max-w-md w-full mx-4">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold text-white">Admin Access</h1>
                        <p className="text-white/60 mt-2">Enter password to continue</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors mb-4"
                            placeholder="Enter password"
                        />
                        <button type="submit" className="btn-primary w-full justify-center">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-deep-black pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-4xl font-bold">
                            <span className="text-gradient">Admin Panel</span>
                        </h1>
                        <p className="text-white/60 mt-2">Manage events, gallery, and settings</p>
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="btn-secondary"
                    >
                        Logout
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="glass-card p-6">
                        <div className="text-3xl mb-2">📅</div>
                        <div className="font-display text-2xl font-bold text-white">{events.length}</div>
                        <div className="text-white/60 text-sm">Total Events</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="text-3xl mb-2">🏷️</div>
                        <div className="font-display text-2xl font-bold text-white">
                            {new Set(events.map((e) => e.category)).size}
                        </div>
                        <div className="text-white/60 text-sm">Categories</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="text-3xl mb-2">📸</div>
                        <div className="font-display text-2xl font-bold text-white">0</div>
                        <div className="text-white/60 text-sm">Gallery Items</div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="text-3xl mb-2">👥</div>
                        <div className="font-display text-2xl font-bold text-white">0</div>
                        <div className="text-white/60 text-sm">Registrations</div>
                    </div>
                </div>

                {/* Events Management */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-bold text-white">Events Management</h2>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="btn-primary"
                        >
                            + Add Event
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-white/70 font-medium">Event</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-medium">Category</th>
                                    <th className="text-left py-3 px-4 text-white/70 font-medium">Form Link</th>
                                    <th className="text-right py-3 px-4 text-white/70 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-white">{event.name}</div>
                                            <div className="text-white/50 text-sm truncate max-w-xs">{event.description}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/70">
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <a
                                                href={event.formLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-neon-cyan hover:underline text-sm truncate block max-w-[200px]"
                                            >
                                                {event.formLink}
                                            </a>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => setEditingEvent(event)}
                                                className="text-white/70 hover:text-neon-cyan transition-colors mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="text-white/70 hover:text-red-500 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reset Data */}
                <div className="glass-card p-6">
                    <h2 className="font-display text-xl font-bold text-white mb-4">Data Management</h2>
                    <button
                        onClick={() => {
                            if (window.confirm('Reset all events to default? This cannot be undone.')) {
                                localStorage.removeItem('brainwaves_events')
                                setEvents(eventsData)
                            }
                        }}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        Reset to Default Data
                    </button>
                </div>
            </div>

            {/* Edit Event Modal */}
            {editingEvent && (
                <EventModal
                    event={editingEvent}
                    onSave={handleUpdateEvent}
                    onClose={() => setEditingEvent(null)}
                />
            )}

            {/* Add Event Modal */}
            {showAddForm && (
                <EventModal
                    event={{
                        name: '',
                        category: 'Technical',
                        description: '',
                        formLink: '',
                        rules: [],
                        eligibility: '',
                        prizes: { first: '', second: '', third: '' },
                        timeline: [],
                    }}
                    onSave={handleAddEvent}
                    onClose={() => setShowAddForm(false)}
                    isNew
                />
            )}
        </div>
    )
}

function EventModal({ event, onSave, onClose, isNew = false }) {
    const [formData, setFormData] = useState(event)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold text-white">
                        {isNew ? 'Add New Event' : 'Edit Event'}
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-2">Event Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                        >
                            <option value="Technical">Technical</option>
                            <option value="Robotics">Robotics</option>
                            <option value="Design">Design</option>
                            <option value="Literary">Literary</option>
                            <option value="Business">Business</option>
                            <option value="Cultural">Cultural</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-2">Google Form Link</label>
                        <input
                            type="url"
                            name="formLink"
                            value={formData.formLink}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-2">Eligibility</label>
                        <input
                            type="text"
                            name="eligibility"
                            value={formData.eligibility}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-cyan/50"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary justify-center">
                            {isNew ? 'Add Event' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
