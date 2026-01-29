import React from 'react'

export default function Contact() {
    const contactDetails = [
        {
            icon: '📍',
            title: 'Address',
            content: (
                <>
                    <p>Finolex Academy of Management and Technology</p>
                    <p>P-60, MIDC, Mirjole Block</p>
                    <p>Ratnagiri, Maharashtra – 415639</p>
                    <a
                        href="https://www.google.com/maps/dir//Finolex+Academy+of+Management+and+Technology,+P-60,+MIDC,+Mirjole+Block,+Ratnagiri,+Maharashtra+415639"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan mt-2 inline-block hover:underline"
                    >
                        Get Directions →
                    </a>
                </>
            )
        },
        {
            icon: '🌐',
            title: 'Website',
            content: (
                <a
                    href="https://www.famt.ac.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neon-cyan transition-colors"
                >
                    www.famt.ac.in
                </a>
            )
        },
        {
            icon: '🕒',
            title: 'Working Hours',
            content: (
                <>
                    <p>Monday – Saturday</p>
                    <p>9:15 AM – 5:00 PM</p>
                </>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-deep-black pt-24 pb-16">
            {/* Perfect center container with balanced spacing */}
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                {/* Heading - Perfect center alignment */}
                <div className="flex justify-center items-center mb-16 lg:mb-20">
                    <div className="text-center">
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-wider">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-electric-purple">
                                Contact Us
                            </span>
                        </h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-neon-cyan to-electric-purple mx-auto rounded-full mt-4"></div>
                    </div>
                </div>

                {/* Perfect two-column layout with balanced spacing */}
                <div className="flex justify-center">
                    <div className="w-full max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
                            {/* Left Column: Map - Perfect alignment */}
                            <div className="w-full flex justify-center">
                                <div className="w-full max-w-lg lg:max-w-none h-[350px] sm:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden glass-card border border-white/10 p-2 shadow-2xl shadow-neon-cyan/5 transition-all hover:shadow-neon-cyan/20">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3810.0526322368943!2d73.32766631535798!3d16.996160918090533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bea0d1839a6bb7f%3A0x63ab969b79bf6561!2sFinolex%20Academy%20of%20Management%20and%20Technology!5e0!3m2!1sen!2sin!4v1675240000000!5m2!1sen!2sin"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, borderRadius: '1rem' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="FAMT Location"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Right Column: Contact Details - Perfect alignment */}
                            <div className="w-full flex justify-center">
                                <div className="w-full max-w-lg lg:max-w-none flex flex-col gap-6 justify-start">
                                    {contactDetails.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:border-neon-cyan/30 transition-all duration-300 group w-full"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-electric-purple/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-display text-xl lg:text-2xl font-bold text-white mb-2">
                                                    {item.title}
                                                </h3>
                                                <div className="text-white/70 text-base lg:text-lg">
                                                    {item.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
