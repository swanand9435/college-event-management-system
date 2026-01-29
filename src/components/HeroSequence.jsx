import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 192
const FRAME_PATH = '/assets/hero/'

export default function HeroSequence() {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const contentRef = useRef(null)
    const [images, setImages] = useState([])
    const [loadProgress, setLoadProgress] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)
    const [mobileHeight, setMobileHeight] = useState(0)
    const gradientRef = useRef(null)
    const frameRef = useRef({ current: 0 })

    // Detect mobile immediately (before any effects run)
    const isMobile = useMemo(() => {
        if (typeof window === 'undefined') return false
        return window.innerWidth < 768
    }, [])

    // On mobile, show content immediately - no loading screen needed
    // The background image loads via CSS which is much faster
    useEffect(() => {
        if (isMobile) {
            setIsLoaded(true)
            setMobileHeight(window.innerHeight)
        }
    }, [isMobile])

    // Preload images (DESKTOP ONLY)
    useEffect(() => {
        // Skip heavy image loading on mobile entirely
        if (isMobile) return

        const loadedImages = []
        let loadedCount = 0

        const loadImage = (index) => {
            return new Promise((resolve) => {
                const img = new Image()
                const frameNum = String(index + 1).padStart(5, '0')
                img.src = `${FRAME_PATH}${frameNum}.jpg`
                img.onload = () => {
                    loadedImages[index] = img
                    loadedCount++
                    setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100))
                    resolve()
                }
                img.onerror = () => {
                    loadedCount++
                    setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100))
                    resolve()
                }
            })
        }

        const priorityLoad = async () => {
            // Load first 8 frames immediately for quick start
            const priorityPromises = []
            for (let i = 0; i < 8; i++) {
                priorityPromises.push(loadImage(i))
            }
            await Promise.all(priorityPromises)

            // Then load remaining frames
            const remainingPromises = []
            for (let i = 8; i < TOTAL_FRAMES; i++) {
                remainingPromises.push(loadImage(i))
            }
            await Promise.all(remainingPromises)

            setImages(loadedImages)
            setIsLoaded(true)
        }

        priorityLoad()
    }, [isMobile])

    // Setup canvas and scroll animation (DESKTOP ONLY)
    useEffect(() => {
        // Skip canvas animation on mobile - using CSS background instead
        if (isMobile) return
        if (!isLoaded || images.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const container = containerRef.current
        const content = contentRef.current
        const gradient = gradientRef.current

        // Set canvas dimensions (desktop only - mobile uses CSS)
        const updateCanvasSize = () => {
            // Performance optimization: Force DPR 1 on desktop
            // Large screens (1920+) don't need scaling, and 4k buffers kill performance
            const dpr = 1

            // Canvas resolution scaling
            canvas.width = window.innerWidth * dpr

            // Default 16:9 aspect ratio if image not loaded yet, or actual image ratio
            const img = images[Math.min(Math.floor(frameRef.current.current), TOTAL_FRAMES - 1)]

            const height = window.innerHeight
            canvas.height = height * dpr

            // Force re-render of current frame (or frame 0 if mobile switched)
            renderFrame(frameRef.current.current)
        }

        const renderFrame = (frameIndex) => {
            // Desktop only - use the scroll-based frame index
            const index = Math.min(Math.floor(frameIndex), TOTAL_FRAMES - 1)
            const img = images[index]

            if (img && ctx) {
                // Clear using physical dimensions
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                // Calculate cover-fit dimensions
                const imgRatio = img.width / img.height
                const canvasRatio = canvas.width / canvas.height

                let drawWidth, drawHeight, drawX, drawY

                if (canvasRatio > imgRatio) {
                    drawWidth = canvas.width
                    drawHeight = canvas.width / imgRatio
                } else {
                    drawHeight = canvas.height
                    drawWidth = canvas.height * imgRatio
                }

                // Apply slight zoom to fill screen perfectly
                const zoom = 1.01
                drawWidth *= zoom
                drawHeight *= zoom

                // Center the image
                const yOffset = 0

                drawX = (canvas.width - drawWidth) / 2
                drawY = ((canvas.height - drawHeight) / 2) + yOffset

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
            }
        }

        updateCanvasSize()
        window.addEventListener('resize', updateCanvasSize)

        let scrollTriggerInstance = null

        // GSAP ScrollTrigger animation
        scrollTriggerInstance = ScrollTrigger.create({
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => {
                const frame = self.progress * (TOTAL_FRAMES - 1)
                frameRef.current.current = frame
                renderFrame(frame)
            },
        })

        // Fade out hero content and gradient
        gsap.to(content, {
            opacity: 0,
            y: -100,
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: '25% top',
                scrub: true,
            },
        })

        if (gradient) {
            gsap.to(gradient, {
                opacity: 0,
                scrollTrigger: {
                    trigger: container,
                    start: '75% bottom',
                    end: 'bottom bottom',
                    scrub: true,
                },
            })
        }

        // Initial render
        renderFrame(0)

        return () => {
            window.removeEventListener('resize', updateCanvasSize)
            if (scrollTriggerInstance) scrollTriggerInstance.kill()
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [isLoaded, images])

    return (
        <div ref={containerRef} className="relative" style={{ height: isMobile ? '100vh' : '400vh' }}>
            {/* Loading Screen */}
            {!isLoaded && (
                <div className="fixed inset-0 z-[100] bg-deep-black flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center mb-6 animate-pulse">
                        <span className="font-display font-bold text-deep-black text-lg">B</span>
                    </div>
                    <div className="font-display text-2xl mb-4 text-gradient">BRAINWAVES 2026</div>
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-neon-cyan to-electric-purple transition-all duration-300"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <div className="mt-3 text-white/50 text-sm">{loadProgress}% loaded</div>
                </div>
            )}

            {/* Fixed Canvas/Background - stays in viewport */}
            <div
                className={`sticky top-0 w-full overflow-hidden ${isMobile ? '' : 'h-screen'}`}
                style={{ height: isMobile ? mobileHeight || '100vh' : '100vh' }}
            >
                {/* Mobile: Use CSS background image (much faster than canvas) */}
                {isMobile && (
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            backgroundColor: '#0a0a0f',
                            backgroundImage: 'url(/assets/hero/00001.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center 30%',
                            transform: 'scale(1.2)',
                        }}
                    />
                )}

                {/* Desktop: Use canvas for scroll animation */}
                {!isMobile && (
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ backgroundColor: '#0a0a0f' }}
                    />
                )}

                {/* Overlay gradient */}
                <div
                    ref={gradientRef}
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-deep-black pointer-events-none"
                    style={{ top: '60%' }}
                />

                {/* Hero Content */}
                {/* Mobile: Align items higher to match VR headset position (justify-start + padding top) */}
                {/* Desktop: Center perfectly (justify-center) */}
                <div
                    ref={contentRef}
                    className={`absolute inset-0 flex flex-col items-center pointer-events-none z-10 ${isMobile ? 'justify-start' : 'justify-center'}`}
                    style={{ paddingTop: isMobile ? '38vh' : '0' }}
                >
                    <div className="text-center px-4 mt-8 md:mt-0">
                        <h1
                            className="font-display font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-2 md:mb-6 text-white tracking-tight leading-none"
                            style={{
                                textShadow: '0 0 40px rgba(0, 245, 255, 0.5), 0 0 80px rgba(191, 0, 255, 0.3)',
                            }}
                        >
                            <span className="text-gradient block">BRAINWAVES</span>
                            <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white/90 block mt-1 md:mt-4">2026</span>
                        </h1>
                        <p className="text-base md:text-2xl text-white/70 max-w-2xl mx-auto mb-8 md:mb-8 font-light mt-4 md:mt-6">
                            Where Ideas Take Form
                        </p>
                        <div className="flex flex-row gap-3 justify-center pointer-events-auto">
                            <a href="#explore" className="btn-primary text-sm px-6 py-2.5 md:text-base md:px-8 md:py-3">
                                Explore
                            </a>
                            <a href="/events" className="btn-secondary text-sm px-6 py-2.5 md:text-base md:px-8 md:py-3">
                                Register
                            </a>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                    <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-neon-cyan/50 rounded-full flex justify-center">
                        <div className="w-1 h-1.5 md:h-2 bg-neon-cyan rounded-full mt-2 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}
