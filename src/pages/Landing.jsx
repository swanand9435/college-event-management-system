import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const highlights = [
  {
    image: "/images/highlights/event1.jpg",
    title: "Moments at FAMT",
    text: "Celebrating the energy, creativity and achievements of FAMT students.",
  },
  {
    image: "/images/highlights/event2.jpg",
    title: "Create. Compete. Celebrate.",
    text: "Every event brings students together beyond the classroom.",
  },
  {
    image: "/images/highlights/event3.jpg",
    title: "Together at FAMT",
    text: "Memories created through culture, technology and sports.",
  },
  {
    image: "/images/highlights/event4.jpg",
    title: "The FAMT Spirit",
    text: "Passion, participation and pride define every FAMT event.",
  },
];

export default function Landing() {
  const [currentHighlight, setCurrentHighlight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHighlight(
        (prev) => (prev + 1) % highlights.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}

      <nav className="arena-navbar">
        <div className="navbar-inner">

          <Link to="/" className="arena-brand">
            <img
              src="/images/famt-logo.png"
              alt="FAMT Logo"
              className="famt-logo"
            />

            <div className="brand-text">
              <span className="brand-title">
                FAMT ARENA
              </span>

              <span className="brand-tagline">
                Connect • Compete • Celebrate
              </span>
            </div>
          </Link>

          <div className="desktop-nav">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Open menu"
          >
            ☰
          </button>

        </div>
      </nav>


      {/* ================= HIGHLIGHTS ================= */}

      <section className="highlights">

        {highlights.map((item, index) => (
          <div
            key={index}
            className={`highlight-slide ${
              index === currentHighlight ? "active" : ""
            }`}
          >

            <img
              src={item.image}
              alt={item.title}
            />

            <div className="highlight-overlay"></div>

            <div className="highlight-content">

              <p className="highlight-label">
                FAMT ARENA
              </p>

              <h1>
                {item.title}
              </h1>

              <p>
                {item.text}
              </p>

            </div>

          </div>
        ))}

        <div className="highlight-dots">

          {highlights.map((_, index) => (
            <button
              key={index}
              type="button"
              className={
                index === currentHighlight
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCurrentHighlight(index)
              }
              aria-label={`Show highlight ${index + 1}`}
            />
          ))}

        </div>

      </section>


      {/* ================= THREE ARENAS ================= */}

      <section className="arenas-section">

        <div className="arenas-heading">

          <span>
            EXPLORE
          </span>

          <h2>
            THREE ARENAS
          </h2>

          <p>
            Choose your arena and be a part of the FAMT experience.
          </p>

        </div>


        <div className="arenas-grid">

          {/* CULTURAL */}

          <Link
            to="/cultural"
            className="arena-card"
          >

            <div className="arena-number">
              01
            </div>

            <div className="arena-card-middle">

              <h3>
                CULTURAL
              </h3>

              <p>
                Music, theatre, dance, fashion and the creative
                spirit of FAMT.
              </p>

            </div>

            <span className="arena-explore">
              EXPLORE →
            </span>

          </Link>


          {/* TECHNICAL */}

          <Link
            to="/technical"
            className="arena-card"
          >

            <div className="arena-number">
              02
            </div>

            <div className="arena-card-middle">

              <h3>
                TECHNICAL
              </h3>

              <p>
                Competitions, workshops, projects and innovative
                technical events.
              </p>

            </div>

            <span className="arena-explore">
              EXPLORE →
            </span>

          </Link>


          {/* SPORTS */}

          <Link
            to="/sports"
            className="arena-card"
          >

            <div className="arena-number">
              03
            </div>

            <div className="arena-card-middle">

              <h3>
                SPORTS
              </h3>

              <p>
                Compete, represent your department and celebrate
                sporting excellence.
              </p>

            </div>

            <span className="arena-explore">
              EXPLORE →
            </span>

          </Link>

        </div>

      </section>


      {/* ================= STUDENT SECRETARIES ================= */}

      <section className="secretaries-section">

        <div className="secretaries-heading">

          <span>
            STUDENT LEADERSHIP
          </span>

          <h2>
            STUDENT SECRETARIES
          </h2>

        </div>


        <div className="secretaries-grid">

          {/* GENERAL SECRETARIES */}

          <div className="secretary-group">

            <div className="secretary-title">

              <span>
                GS
              </span>

              <h3>
                General Secretaries
              </h3>

            </div>

            <div className="secretary-names">

              <div className="secretary-person">

                <span className="gender">
                  BOYS
                </span>

                <strong>
                  Mr. Naik Shridhar P.
                </strong>

              </div>

              <div className="secretary-person">

                <span className="gender">
                  GIRLS
                </span>

                <strong>
                  Ms. Kale Isha P.
                </strong>

              </div>

            </div>

          </div>


          {/* TECHNICAL SECRETARIES */}

          <div className="secretary-group">

            <div className="secretary-title">

              <span>
                TS
              </span>

              <h3>
                Technical Secretaries
              </h3>

            </div>

            <div className="secretary-names">

              <div className="secretary-person">

                <span className="gender">
                  BOYS
                </span>

                <strong>
                  Mr. Parab Sahil S.
                </strong>

              </div>

              <div className="secretary-person">

                <span className="gender">
                  GIRLS
                </span>

                <strong>
                  Ms. Ansari Soha R.
                </strong>

              </div>

            </div>

          </div>


          {/* SPORTS SECRETARIES */}

          <div className="secretary-group">

            <div className="secretary-title">

              <span>
                SS
              </span>

              <h3>
                Sports Secretaries
              </h3>

            </div>

            <div className="secretary-names">

              <div className="secretary-person">

                <span className="gender">
                  BOYS
                </span>

                <strong>
                  Mr. Gavandi Pranav R.
                </strong>

              </div>

              <div className="secretary-person">

                <span className="gender">
                  GIRLS
                </span>

                <strong>
                  Ms. Marathe Sharvari S.
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FINAL FAMT ARENA FOOTER ================= */}

      <footer className="arena-footer">

        <div className="footer-content">

          <div className="footer-title">
            FAMT ARENA
          </div>


          <div className="footer-links">

            {/* CULTURAL */}

            <a
              href="https://www.instagram.com/utopia.famt?stkn=M2hqeWJ6cndndWI1"
              target="_blank"
              rel="noreferrer"
              className="footer-social"
            >

              <span className="footer-icon">
                ◎
              </span>

              <div>
                <span className="footer-category">
                  CULTURAL
                </span>

                <strong>
                  Utopia FAMT
                </strong>
              </div>

              <span className="footer-arrow">
                ↗
              </span>

            </a>


            {/* TECHNICAL */}

            <a
              href="https://www.instagram.com/brainwaves_2k26?stkn=N3g2ejJhcjZ3ejJ6"
              target="_blank"
              rel="noreferrer"
              className="footer-social"
            >

              <span className="footer-icon">
                ◎
              </span>

              <div>
                <span className="footer-category">
                  TECHNICAL
                </span>

                <strong>
                  Brainwaves 2K26
                </strong>
              </div>

              <span className="footer-arrow">
                ↗
              </span>

            </a>


            {/* SPORTS */}

            <a
              href="https://www.instagram.com/famt.sports?stkn=OTF4NzQ1dDh6ZGs3"
              target="_blank"
              rel="noreferrer"
              className="footer-social"
            >

              <span className="footer-icon">
                ◎
              </span>

              <div>
                <span className="footer-category">
                  SPORTS
                </span>

                <strong>
                  FAMT Sports
                </strong>
              </div>

              <span className="footer-arrow">
                ↗
              </span>

            </a>


            {/* NATYARANG */}

            <a
              href="https://www.instagram.com/natyarang_famt?stkn=M3hhbGdtamJwNjZx"
              target="_blank"
              rel="noreferrer"
              className="footer-social"
            >

              <span className="footer-icon">
                ◎
              </span>

              <div>
                <span className="footer-category">
                  NATYARANG
                </span>

                <strong>
                  Natyarang FAMT
                </strong>
              </div>

              <span className="footer-arrow">
                ↗
              </span>

            </a>


            {/* OFFICIAL FAMT WEBSITE */}

            <a
              href="https://www.famt.ac.in/"
              target="_blank"
              rel="noreferrer"
              className="footer-social"
            >

              <span className="footer-icon">
                ↗
              </span>

              <div>
                <span className="footer-category">
                  OFFICIAL WEBSITE
                </span>

                <strong>
                  FAMT
                </strong>
              </div>

              <span className="footer-arrow">
                ↗
              </span>

            </a>

          </div>


          <div className="footer-bottom">
            © {new Date().getFullYear()} FAMT Arena
          </div>

        </div>

      </footer>

    </div>
  );
}