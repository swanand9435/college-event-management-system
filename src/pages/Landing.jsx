import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

const representatives = [
    {
        name: 'Aditya Sharma',
        role: 'General Secretary',
        image: '/images/representatives/aditya.jpg',
    },
    {
        name: 'Neha Patel',
        role: 'Cultural Secretary',
        image: '/images/representatives/neha.jpg',
    },
    {
        name: 'Rahul Desai',
        role: 'Technical Secretary',
        image: '/images/representatives/rahul.jpg',
    },
    {
        name: 'Sneha Kulkarni',
        role: 'Sports Secretary',
        image: '/images/representatives/sneha.jpg',
    },
]

const departmentHeads = [
    {
        name: 'Vikram Singh',
        department: 'IT',
        image: '/images/heads/vikram.jpg',
    },
    {
        name: 'Priya Reddy',
        department: 'CSE',
        image: '/images/heads/priya.jpg',
    },
    {
        name: 'Ayush Khan',
        department: 'Mechanical',
        image: '/images/heads/ayush.jpg',
    },
    {
        name: 'Sneha Kulkarni',
        department: 'Electrical',
        image: '/images/heads/sneha1.jpg',
    },
]

const highlightPhotos = [
    {
        title: 'Highlight 1',
        image: '/images/highlights/event1.jpg',
    },
    {
        title: 'Highlight 2',
        image: '/images/highlights/event2.jpg',
    },
    {
        title: 'Highlight 3',
        image: '/images/highlights/event3.jpg',
    },
    {
        title: 'Highlight 4',
        image: '/images/highlights/event4.jpg',
    },
]


export default function Landing() {
    const [currentSlide, setCurrentSlide] = useState(0)
    
    useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) =>
            (prev + 1) % highlightPhotos.length
        )
    }, 4000)

    return () => clearInterval(timer)
    }, [])
    return (
        <div className="landing-page">

            {/* HEADER */}
            <header className="landing-header">
                <div className="logo-area">
                    <img
                        src="/images/famt-logo.png"
                        alt="FAMT Logo"
                        className="famt-logo"
                    />

                    <div>
                        <h1>FAMT ARENA</h1>
                        <p>Connect • Compete • Celebrate</p>
                    </div>
                </div>
            </header>


            {/* HIGHLIGHT PHOTOS */}
<section className="highlight-slider-section">

    <div className="highlight-slider">

        {highlightPhotos.map((photo, index) => (
            <div
                className={`highlight-slide ${
                    index === currentSlide ? 'active' : ''
                }`}
                key={photo.title}
            >
                <img src={photo.image} alt={photo.title} />
            </div>
        ))}

        {/* PREVIOUS */}
        <button
            className="highlight-prev"
            onClick={() =>
                setCurrentSlide(
                    (currentSlide - 1 + highlightPhotos.length) %
                    highlightPhotos.length
                )
            }
        >
            ‹
        </button>

        {/* NEXT */}
        <button
            className="highlight-next"
            onClick={() =>
                setCurrentSlide(
                    (currentSlide + 1) %
                    highlightPhotos.length
                )
            }
        >
            ›
        </button>

        {/* DOTS */}
        <div className="highlight-dots">
            {highlightPhotos.map((photo, index) => (
                <span
                    key={photo.title}
                    className={`highlight-dot ${
                        index === currentSlide ? 'active' : ''
                    }`}
                    onClick={() => setCurrentSlide(index)}
                ></span>
            ))}
        </div>

    </div>

</section>


            {/* THREE MAIN SECTIONS */}
            <section className="landing-section">

                <div className="event-sections">

                    {/* CULTURAL */}
                    <Link to="/cultural" className="event-box cultural-box">
                        <div className="event-icon">🎭</div>

                        <h2>CULTURAL</h2>

                        <div className="red-line"></div>

                        <p>
                            Celebrate creativity through arts, music,
                            dance, drama, literature and more.
                        </p>

                        <button>EXPLORE EVENTS →</button>
                    </Link>


                    {/* TECHNICAL */}
                    <Link to="/technical" className="event-box technical-box">
                        <div className="event-icon">⚙️</div>

                        <h2>TECHNICAL</h2>

                        <div className="red-line"></div>

                        <p>
                            Explore technology through coding,
                            robotics, workshops, competitions and more.
                        </p>

                        <button>EXPLORE EVENTS →</button>
                    </Link>


                    {/* SPORTS */}
                    <Link to="/sports" className="event-box sports-box">
                        <div className="event-icon">🏃</div>

                        <h2>SPORTS</h2>

                        <div className="red-line"></div>

                        <p>
                            Compete, challenge and excel in indoor
                            and outdoor sports.
                        </p>

                        <button>EXPLORE EVENTS →</button>
                    </Link>

                </div>

            </section>


            {/* REPRESENTATIVES + HIGHLIGHTS */}
            <section className="dashboard-section">

                {/* LEFT SIDE */}
                <div className="people-section">

                    {/* STUDENT REPRESENTATIVES */}
                    <div className="people-block">

                        <div className="section-heading">
                            <span></span>
                            <h2>STUDENT REPRESENTATIVES</h2>
                        </div>

                        <div className="people-grid">
                            {representatives.map((person) => (
                                <div className="person-card" key={person.name}>
                                    <img src={person.image} alt={person.name} />

                                    <h3>{person.name}</h3>

                                    <p>{person.role}</p>
                                </div>
                            ))}
                        </div>

                    </div>


                    {/* DEPARTMENT HEADS */}
                    <div className="people-block">

                        <div className="section-heading">
                            <span></span>
                            <h2>DEPARTMENT STUDENT HEADS</h2>
                        </div>

                        <div className="people-grid">
                            {departmentHeads.map((person) => (
                                <div className="person-card" key={person.name}>
                                    <img src={person.image} alt={person.name} />

                                    <h3>{person.name}</h3>

                                    <p>{person.department}</p>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>


                {/* RIGHT SIDE HIGHLIGHTS */}
                <aside className="updates-section">

                    <div className="section-heading">
                        <span></span>
                        <h2>HIGHLIGHTS</h2>
                    </div>

                    <div className="update-card">
                        <span>LIVE</span>
                        <h3>Brainwaves 2K26</h3>
                        <p>The wait is over! Get ready for the biggest tech & cultural fest.</p>
                        <small>10 - 12 Feb 2026</small>
                    </div>

                    <div className="update-card">
                        <h3>Registrations Open</h3>
                        <p>
                            Registrations are now open for cultural,
                            technical and sports events.
                        </p>
                        <small>05 Jan 2026</small>
                    </div>

                    <div className="update-card">
                        <h3>Prize Pool</h3>
                        <p>Exciting prizes waiting for participants.</p>
                    </div>

                    <button className="view-updates">
                        VIEW ALL UPDATES →
                    </button>

                </aside>

            </section>


            {/* SOCIAL MEDIA */}
            <section className="social-section">

                <div className="section-heading">
                    <span></span>
                    <h2>SOCIAL MEDIA</h2>
                </div>

                <div className="social-grid">

                    <div>
                        <h3>CULTURAL</h3>
                        <a href="#" target="_blank">Instagram</a>
                        <a href="#" target="_blank">Facebook</a>
                        <a href="#" target="_blank">YouTube</a>
                    </div>

                    <div>
                        <h3>TECHNICAL</h3>
                        <a href="#" target="_blank">Instagram</a>
                        <a href="#" target="_blank">LinkedIn</a>
                        <a href="#" target="_blank">YouTube</a>
                    </div>

                    <div>
                        <h3>SPORTS</h3>
                        <a href="#" target="_blank">Instagram</a>
                        <a href="#" target="_blank">Facebook</a>
                        <a href="#" target="_blank">YouTube</a>
                    </div>

                </div>

            </section>


            {/* FOOTER */}
            <footer className="landing-footer">
                © 2026 FAMT. All rights reserved.
            </footer>

        </div>
    )
}