import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import culturalApi from "../services/culturalApi";
import "./Cultural.css";

const defaultCommittees = [
  {
    id: "natyarang",
    number: "01",
    icon: "🎭",
    name: "Natyarang",
    type: "Theatre & Drama",
  },
  {
    id: "dance",
    number: "02",
    icon: "💃",
    name: "Dance",
    type: "Dance Events",
  },
  {
    id: "swarsandhya",
    number: "03",
    icon: "🎵",
    name: "Swarsandhya",
    type: "Music & Singing",
  },
  {
    id: "voice-of-famt",
    number: "04",
    icon: "🎤",
    name: "Voice of FAMT",
    type: "Singing Competition",
  },
  {
    id: "anchoring",
    number: "05",
    icon: "🎙️",
    name: "Anchoring",
    type: "Hosting & Presentation",
  },
  {
    id: "dhol-tasha",
    number: "06",
    icon: "🥁",
    name: "Dhol Tasha",
    type: "Traditional Performance",
  },
  {
    id: "fun-games",
    number: "07",
    icon: "🎯",
    name: "Fun Games",
    type: "Fun & Entertainment",
  },
  {
    id: "fashion-walk",
    number: "08",
    icon: "👗",
    name: "Fashion Walk",
    type: "Fashion & Ramp",
  },
  {
    id: "decoration",
    number: "09",
    icon: "🎨",
    name: "Decoration",
    type: "Creative & Decoration",
  },
  {
    id: "social-media",
    number: "10",
    icon: "📱",
    name: "Social Media",
    type: "Media & Promotion",
  },
  {
    id: "event-management",
    number: "11",
    icon: "⚡",
    name: "Event Management",
    type: "Event Operations",
  },
  {
    id: "finance",
    number: "12",
    icon: "💰",
    name: "Finance",
    type: "Finance Management",
  },
  {
    id: "documentation",
    number: "13",
    icon: "📝",
    name: "Documentation",
    type: "Documentation & Records",
  },
  {
    id: "food",
    number: "14",
    icon: "🍴",
    name: "Food Committee",
    type: "Food & Refreshments",
  },
  {
    id: "question-answer",
    number: "15",
    icon: "❓",
    name: "Question Answer",
    type: "Quiz & Knowledge",
  },
  {
    id: "transport",
    number: "16",
    icon: "🚌",
    name: "Transport",
    type: "Travel & Transport",
  },
  {
    id: "discipline",
    number: "17",
    icon: "🛡️",
    name: "Discipline",
    type: "Discipline & Management",
  },
  {
    id: "stage-management",
    number: "18",
    icon: "🎬",
    name: "Stage Management",
    type: "Stage & Backstage",
  },
  {
    id: "felicitation",
    number: "19",
    icon: "🏆",
    name: "Felicitation",
    type: "Awards & Felicitation",
  },
];

export default function Cultural() {
  const [committees, setCommittees] = useState(defaultCommittees);

  useEffect(() => {
    async function loadCommittees() {
      try {
        const fetched = await culturalApi.getCommittees();
        if (fetched && fetched.length > 0) {
          // Merge with icons and number format
          const merged = fetched.map((c, index) => {
            const fallback = defaultCommittees.find((dc) => dc.id === c.id);
            return {
              id: c.id,
              number: String(index + 1).padStart(2, "0"),
              icon: c.icon || fallback?.icon || "✨",
              name: c.name,
              type: c.category || fallback?.type || "Cultural",
            };
          });
          setCommittees(merged);
        }
      } catch (err) {
        console.warn("Using offline committee list:", err.message);
      }
    }
    loadCommittees();
  }, []);

  return (
    <div className="utopia-page">
      {/* =====================================================
          NAVBAR
          ===================================================== */}
      <nav className="utopia-navbar">
        <div className="utopia-nav-inner">
          <Link to="/" className="utopia-brand">
            <span className="utopia-brand-main">FAMT ARENA</span>
            <span className="utopia-brand-sub">CULTURAL</span>
          </Link>

          <div className="utopia-nav-links">
            <a href="#about">About</a>
            <a href="#committees">Committees</a>
            <a href="#auditions">Auditions</a>
            <a href="#results">Results</a>

            <Link
              to="/cultural/admin"
              className="utopia-nav-button"
              style={{
                background: "rgba(255, 215, 0, 0.15)",
                borderColor: "#ffd700",
                color: "#ffd700",
              }}
            >
              CULTURAL ADMIN
            </Link>

            <Link to="/" className="utopia-nav-button">
              BACK TO ARENA
            </Link>
          </div>
        </div>
      </nav>

      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="utopia-hero">
        <div className="utopia-hero-content">
          <span className="utopia-overline">DISCOVER YOUR STAGE</span>

          <h1>UTOPIA</h1>

          <div className="utopia-line"></div>

          <p className="utopia-tagline">
            Where Every Talent Finds Its Stage.
          </p>

          <p className="utopia-description">
            A celebration of creativity, expression and talent. Step into the
            world of FAMT Cultural and discover where your passion belongs.
          </p>

          <div className="utopia-hero-actions">
            <Link to="/cultural/events" className="utopia-primary-button">
              EXPLORE EVENTS
              <span>↗</span>
            </Link>

            <a href="#committees" className="utopia-secondary-button">
              REGISTER FOR COMMITTEES
              <span>↓</span>
            </a>
          </div>
        </div>

        <div className="utopia-hero-bottom">
          <span className="hero-scroll-line"></span>
          SCROLL TO EXPLORE
        </div>

        <div className="utopia-hero-glow glow-one"></div>
        <div className="utopia-hero-glow glow-two"></div>
      </section>

      {/* =====================================================
          ABOUT
          ===================================================== */}
      <section className="utopia-about" id="about">
        <div className="utopia-section-label">
          <span>01</span>
          ABOUT UTOPIA
        </div>

        <div className="utopia-about-grid">
          <div className="utopia-about-title">
            <h2>
              MORE THAN
              <br />
              <span>A FEST.</span>
            </h2>
          </div>

          <div className="utopia-about-text">
            <p>
              UTOPIA is the cultural celebration of FAMT Arena — a platform
              where students come together to express, perform, compete and
              create unforgettable memories.
            </p>

            <p>
              From theatre and music to dance, fashion and entertainment, every
              talent gets a place to shine.
            </p>

            <div className="utopia-stats">
              <div>
                <strong>{committees.length}</strong>
                <span>Committees</span>
              </div>

              <div>
                <strong>∞</strong>
                <span>Possibilities</span>
              </div>

              <div>
                <strong>1</strong>
                <span>Stage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COMMITTEES
          ===================================================== */}
      <section className="utopia-committees" id="committees">
        <div className="utopia-section-heading">
          <div className="utopia-section-label">
            <span>02</span>
            THE CULTURAL FORCE
          </div>

          <h2>
            MEET THE
            <br />
            COMMITTEES.
          </h2>

          <p>
            Behind every performance, every event and every unforgettable moment
            is a team that makes it happen. Click on any committee card below to
            register and be part of UTOPIA!
          </p>
        </div>

        <div className="utopia-committee-grid">
          {committees.map((committee) => (
            <Link
              to={`/cultural/committee/${committee.id}`}
              className="utopia-committee-card"
              key={committee.id || committee.number}
              style={{ textDecoration: "none", color: "inherit" }}
              title={`Register for ${committee.name} Committee`}
            >
              <span className="committee-number">{committee.number}</span>

              <div className="committee-icon">{committee.icon}</div>

              <div className="committee-info">
                <span>{committee.type}</span>
                <h3>{committee.name}</h3>
              </div>

              <span className="committee-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          AUDITIONS
          ===================================================== */}
      <section className="utopia-auditions" id="auditions">
        <div className="audition-content">
          <div className="utopia-section-label">
            <span>03</span>
            YOUR MOMENT
          </div>

          <h2>
            TAKE THE
            <br />
            <span>STAGE.</span>
          </h2>

          <p>
            Think you have what it takes? Participate in auditions,
            competitions and cultural events and show everyone what you can do.
          </p>

          <Link to="/cultural/events" className="utopia-outline-button">
            VIEW CULTURAL EVENTS
          </Link>
        </div>

        <div className="audition-mark">UTOPIA</div>
      </section>

      {/* =====================================================
          RESULTS
          ===================================================== */}
      <section className="utopia-results" id="results">
        <div className="utopia-section-label">
          <span>04</span>
          RESULTS
        </div>

        <div className="results-heading">
          <h2>
            CELEBRATE
            <br />
            <span>THE WINNERS.</span>
          </h2>

          <p>
            Results, achievements and winning moments from the cultural events of
            FAMT Arena.
          </p>
        </div>

        <div className="results-placeholder">
          <span>RESULTS WILL BE UPDATED HERE</span>
          <strong>STAY TUNED.</strong>
        </div>
      </section>

      {/* =====================================================
          GALLERY / MOMENTS
          ===================================================== */}
      <section className="utopia-gallery">
        <div className="utopia-section-label">
          <span>05</span>
          MOMENTS
        </div>

        <div className="gallery-heading">
          <h2>
            CAPTURED
            <br />
            <span>MOMENTS.</span>
          </h2>

          <Link to="/gallery" className="gallery-link">
            VIEW FULL GALLERY ↗
          </Link>
        </div>

        <div className="gallery-grid">
          <div className="gallery-box gallery-large">
            <span>UTOPIA</span>
            <strong>01</strong>
          </div>

          <div className="gallery-box">
            <span>STAGE</span>
            <strong>02</strong>
          </div>

          <div className="gallery-box">
            <span>DANCE</span>
            <strong>03</strong>
          </div>

          <div className="gallery-box">
            <span>MUSIC</span>
            <strong>04</strong>
          </div>

          <div className="gallery-box">
            <span>THEATRE</span>
            <strong>05</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}
      <section className="utopia-final-cta">
        <span>FAMT ARENA • CULTURAL</span>

        <h2>
          SEE YOU
          <br />
          ON STAGE.
        </h2>

        <Link to="/cultural/events" className="utopia-primary-button">
          EXPLORE EVENTS
          <span>↗</span>
        </Link>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <footer className="utopia-footer">
        <div className="utopia-footer-top">
          <div className="footer-brand">
            <span className="footer-brand-title">FAMT ARENA</span>
            <span>CONNECT • COMPETE • CELEBRATE</span>
          </div>

          <div className="footer-utopia">UTOPIA</div>
        </div>

        <div className="utopia-footer-bottom">
          <span>© 2026 FAMT Arena. All rights reserved.</span>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link
              to="/cultural/admin"
              style={{ color: "#ffd700", fontWeight: 600, fontSize: "0.85rem" }}
            >
              CULTURAL ADMIN PORTAL ↗
            </Link>
            <Link to="/">BACK TO FAMT ARENA ↗</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}