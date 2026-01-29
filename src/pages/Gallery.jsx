import { useState, useEffect } from 'react'
import { gsap } from 'gsap'

export default function Gallery() {
    const [selectedImage, setSelectedImage] = useState(null)

    // Placeholder gallery images - replace with actual images
    const galleryImages = [
        { id: 1, src: null, alt: 'Event Photo 1', category: 'Events' },
        { id: 2, src: null, alt: 'Workshop Photo', category: 'Workshops' },
        { id: 3, src: null, alt: 'Performance', category: 'Cultural' },
        { id: 4, src: null, alt: 'Tech Talk', category: 'Technical' },
        { id: 5, src: null, alt: 'Hackathon', category: 'Technical' },
        { id: 6, src: null, alt: 'Dance Performance', category: 'Cultural' },
        { id: 7, src: null, alt: 'Award Ceremony', category: 'Events' },
        { id: 8, src: null, alt: 'Robotics', category: 'Technical' },
        { id: 9, src: null, alt: 'Art Display', category: 'Cultural' },
        { id: 10, src: null, alt: 'Crowd Photo', category: 'Events' },
        { id: 11, src: null, alt: 'Stage Setup', category: 'Events' },
        { id: 12, src: null, alt: 'Team Photo', category: 'Events' },
    ]

    useEffect(() => {
        gsap.fromTo(
            '.gallery-item',
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power2.out',
            }
        )
    }, [])

    return (
        <div className="min-h-screen bg-deep-black pt-24 pb-16">
            {/* Hero */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-purple/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-center">
                        <span className="text-gradient">Gallery</span>
                    </h1>
                    <p className="text-white/60 text-xl max-w-2xl text-center">
                        Relive the memories from our previous editions. Moments captured, memories preserved.
                    </p>
                </div>
            </section>



            {/* Uniform Grid Gallery */}
            <section className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl w-full">
                    {galleryImages.map((image) => (
                        <div
                            key={image.id}
                            className="gallery-item group cursor-pointer w-full"
                            onClick={() => setSelectedImage(image)}
                        >
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 hover:border-neon-cyan/40 transition-all duration-300 shadow-lg hover:shadow-neon-cyan/10">
                                {/* Placeholder - Perfectly Centered */}
                                <div className="w-full h-full bg-gradient-to-br from-neon-cyan/10 via-electric-purple/10 to-aurora-blue/10 flex items-center justify-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-5xl mb-3">📷</div>
                                        <span className="text-white/50 text-sm font-medium text-center">{image.alt}</span>
                                    </div>
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur text-white/80">
                                            {image.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Zoom Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <span className="text-2xl">🔍</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="max-w-4xl w-full aspect-square md:aspect-video rounded-2xl overflow-hidden border border-white/20">
                        <div className="w-full h-full bg-gradient-to-br from-neon-cyan/10 via-electric-purple/10 to-aurora-blue/10 flex items-center justify-center">
                            <div className="text-center flex flex-col items-center justify-center">
                                <div className="text-6xl mb-4">📷</div>
                                <span className="text-white/50 text-lg">{selectedImage.alt}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
