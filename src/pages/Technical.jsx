import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import technicalApi from "../services/technicalApi";
import "./Technical.css";

const defaultMajorEvents = [
  {
    id: "stabilia",
    name: "Stabilia",
    tagline: "Self-Balancing Robot Challenge",
    category: "Robotics & Automation",
    icon: "🤖",
    description:
      "The flagship robotics engineering arena testing autonomous control, PID tuning, and dynamic stability performance.",
    isRegistrationOpen: true,
  },
  {
    id: "brainbyte",
    name: "BrainByte",
    tagline: "Premier Tech Quiz & Coding Challenge",
    category: "Technical & Computing",
    icon: "🧠",
    description:
      "A high-stakes battle of intelligence, programming fundamentals, algorithmic problem solving, and technological aptitude.",
    isRegistrationOpen: true,
  },
  {
    id: "kalakruti",
    name: "Kalakruti",
    tagline: "Creative, Design & Digital Arts Fest",
    category: "Art, Media & Creative",
    icon: "🎨",
    description:
      "A vibrant celebration of artistic innovation, visual media, handcrafted design, photography, and digital storytelling featuring 12 unique competitions.",
    isRegistrationOpen: true,
  },
];

const defaultKalakrutiCompetitions = [
  {
    id: "reel-short-making",
    name: "Reel & Short Making",
    icon: "🎬",
    description: "Create compelling short-form video reels showcasing innovation and creativity.",
  },
  {
    id: "dslr-photography",
    name: "DSLR Photography Competition",
    icon: "📷",
    description: "Capture breathtaking frames, lighting, and perspectives through professional lenses.",
  },
  {
    id: "origami-knitting-quilling",
    name: "Origami / Knitting / Quilling",
    icon: "🧶",
    description: "Intricate paper folding, textile crafting, and quilling artwork.",
  },
  {
    id: "cup-mug-painting",
    name: "Cup & Mug Painting",
    icon: "☕",
    description: "Hand-painted ceramic artwork with vibrant colors and themes.",
  },
  {
    id: "rangoli",
    name: "Rangoli (Kalakruti)",
    icon: "🌸",
    description: "Traditional and modern floor art expressing cultural aesthetics.",
  },
  {
    id: "poster-making",
    name: "Poster Making",
    icon: "📜",
    description: "Design visual awareness and thematic posters with creative impact.",
  },
  {
    id: "mehendi",
    name: "Mehendi Competition",
    icon: "✋",
    description: "Artistic henna patterns, symmetry, and traditional and modern design finesse.",
  },
  {
    id: "painting",
    name: "Painting (Kalakruti)",
    icon: "🎨",
    description: "Express your imagination on canvas with acrylic, watercolor, or oil media.",
  },
  {
    id: "best-out-of-waste",
    name: "Best Out of Waste",
    icon: "♻️",
    description: "Transform recycled materials into innovative, functional or decorative artifacts.",
  },
  {
    id: "pot-painting",
    name: "Pot Painting",
    icon: "🏺",
    description: "Earthen pot decoration blending ethnic folk art with contemporary flair.",
  },
  {
    id: "mobile-photography",
    name: "Mobile Photography",
    icon: "📱",
    description: "Street, macro, and portrait photography captured using smartphones.",
  },
  {
    id: "sketching",
    name: "Sketching Competition",
    icon: "✏️",
    description: "Graphite and charcoal illustrations emphasizing shading, realism, and depth.",
  },
];

export default function Technical() {
  const [majorEvents, setMajorEvents] = useState(defaultMajorEvents);
  const [kalakrutiCompetitions, setKalakrutiCompetitions] = useState(defaultKalakrutiCompetitions);

  useEffect(() => {
    async function loadData() {
      try {
        const events = await technicalApi.getEvents();
        if (events && events.length > 0) {
          setMajorEvents(events);
          const kalakruti = events.find((e) => e.id === "kalakruti");
          if (kalakruti && kalakruti.competitions && kalakruti.competitions.length > 0) {
            setKalakrutiCompetitions(kalakruti.competitions);
          }
        }
      } catch (err) {
        console.warn("Using offline Technical event data:", err.message);
      }
    }
    loadData();
  }, []);

  return (
    <div className="tech-page">
      <div className="tech-bg-grid"></div>
      <div className="tech-bg-glow-one"></div>
      <div className="tech-bg-glow-two"></div>

      {/* ===================================================
          NAVBAR
          =================================================== */}
      <nav className="tech-navbar">
        <div className="tech-nav-inner">
          <Link to="/" className="tech-brand">
            <span className="tech-brand-logo">⚡</span>
            <div>
              <div className="tech-brand-title">FAMT ARENA</div>
              <div className="tech-brand-subtitle">TECHNICAL SECTION</div>
            </div>
          </Link>

          <div className="tech-nav-links">
            <a href="#major-events">Major Events</a>
            <a href="#kalakruti-competitions">Kalakruti (12 Events)</a>

            <Link to="/technical/admin" className="tech-nav-btn admin">
              Technical Admin
            </Link>

            <Link to="/" className="tech-nav-btn back">
              Back to Arena ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* ===================================================
          HERO
          =================================================== */}
      <header className="tech-hero">
        <div className="tech-hero-badge">
          <span>🚀</span> BRAINWAVES 2026 • ANNUAL TECH FEST
        </div>

        <h1>
          INNOVATE. BUILD. <span>CONQUER.</span>
        </h1>

        <p className="tech-hero-tagline">
          Step into the premier technology and creative arena of FAMT. Compete in robotics,
          master computational logic, and unleash your visual artistry.
        </p>

        <div className="tech-hero-actions">
          <a href="#major-events" className="tech-btn-primary">
            Explore 3 Major Events ↓
          </a>
          <a href="#kalakruti-competitions" className="tech-btn-outline">
            View 12 Kalakruti Competitions
          </a>
        </div>
      </header>

      {/* ===================================================
          THREE MAJOR EVENTS SECTION
          =================================================== */}
      <section className="tech-major-section" id="major-events">
        <div className="tech-section-header">
          <div className="tech-section-label">THE PILLARS OF TECH ARENA</div>
          <h2>Three Flagship Events</h2>
        </div>

        <div className="tech-major-grid">
          {majorEvents.map((event) => (
            <div key={event.id} className="tech-major-card">
              <div>
                <div className="tech-card-top">
                  <div className="tech-card-icon">{event.icon || "⚡"}</div>
                  <span className="tech-card-badge">{event.category}</span>
                </div>

                <h3>{event.name}</h3>
                <div className="tech-card-tagline">{event.tagline}</div>
                <p className="tech-card-desc">{event.description}</p>
              </div>

              <div>
                {event.id === "kalakruti" ? (
                  <a href="#kalakruti-competitions" className="tech-card-action">
                    Explore 12 Competitions ↓
                  </a>
                ) : (
                  <Link
                    to={`/technical/${event.id}`}
                    className="tech-card-action"
                  >
                    {event.isRegistrationOpen
                      ? `Register for ${event.name} →`
                      : "Registration Closed"}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================
          KALAKRUTI 12 COMPETITIONS
          =================================================== */}
      <section className="tech-kalakruti-section" id="kalakruti-competitions">
        <div className="tech-section-header">
          <div className="tech-section-label">KALAKRUTI ART & MEDIA FEST</div>
          <h2>12 Signature Competitions</h2>
          <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "12px auto 0", fontSize: "0.95rem" }}>
            Click on any competition below to access its dedicated student registration portal.
          </p>
        </div>

        <div className="tech-kalakruti-grid">
          {kalakrutiCompetitions.map((comp) => (
            <Link
              key={comp.id}
              to={`/technical/kalakruti/${comp.id}`}
              className="tech-subevent-card"
              title={`Register for ${comp.name}`}
            >
              <div>
                <div className="tech-subevent-top">
                  <div className="tech-subevent-icon">{comp.icon || "🎨"}</div>
                  <h4 className="tech-subevent-title">{comp.name}</h4>
                </div>
                <p className="tech-subevent-desc">{comp.description}</p>
              </div>

              <div className="tech-subevent-cta">
                <span>Enter Competition</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================================================
          FOOTER
          =================================================== */}
      <footer className="tech-footer">
        <div className="tech-footer-inner">
          <div className="tech-footer-brand">
            <strong>FAMT ARENA — TECHNICAL SECTION</strong>
            <span>Finolex Academy of Management and Technology, Ratnagiri</span>
          </div>

          <div className="tech-footer-links">
            <Link to="/technical/admin" style={{ color: "#38bdf8", fontWeight: 700 }}>
              Technical Admin Portal ↗
            </Link>
            <Link to="/cultural">Cultural Section (UTOPIA)</Link>
            <Link to="/sports">Sports Section</Link>
            <Link to="/">Main Arena</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
