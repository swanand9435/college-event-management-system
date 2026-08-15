import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-white/10">
            <div className="w-full px-8 sm:px-12 lg:px-20 py-14">

                {/* Three Column Layout - Equal Spacing */}
                <div className="flex flex-col sm:flex-row justify-around gap-10 sm:gap-8">

                    {/* Column 1 - Name & Tagline */}
                    <div className="text-center sm:text-left">
                        <Link to="/" className="inline-block mb-2">
                            <span className="font-display font-bold text-xl text-white">FAMT</span>
                            <span className="text-neon-cyan text-sm ml-2">ARENA</span>
                        </Link>
                        <p className="text-white/40 text-sm max-w-xs">
                            The official event management platform of FAMT..
                        </p>
                    </div>

                    {/* Column 2 - Quick Links */}
                    <div className="text-center">
                        <h4 className="text-white text-sm font-medium mb-4">Quick Links</h4>
                        <div className="space-y-2 text-sm">
                            <Link to="/" className="block text-white/50 hover:text-neon-cyan transition-colors">Home</Link>
                            <Link to="/events" className="block text-white/50 hover:text-neon-cyan transition-colors">Events</Link>
                            <Link to="/schedule" className="block text-white/50 hover:text-neon-cyan transition-colors">Schedule</Link>
                            <Link to="/gallery" className="block text-white/50 hover:text-neon-cyan transition-colors">Gallery</Link>
                            <Link to="/contact" className="block text-white/50 hover:text-neon-cyan transition-colors">Contact</Link>
                        </div>
                    </div>

                    {/* Column 3 - Address */}
                    <div className="text-center sm:text-right">
                        <h4 className="text-white text-sm font-medium mb-4">Address</h4>
                        <div className="text-white/40 text-sm space-y-1">
                            <p>Finolex Academy of Management</p>
                            <p>and Technology</p>
                            <p>P-60, MIDC, Mirjole Block</p>
                            <p>Ratnagiri, Maharashtra – 415639</p>
                            <a
                                href="https://maps.app.goo.gl/aBF59D5bBuRRYe4b6"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neon-cyan hover:underline inline-block mt-2"
                            >
                                View on Maps →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright - Bottom */}
                <div className="border-t border-white/5 mt-12 pt-6 text-center">
                    <p className="text-white/30 text-xs">
                        © {currentYear} Brainwaves. All rights reserved. • brainwaves@famt.ac.in
                    </p>
                </div>
            </div>
        </footer>
    )
}
