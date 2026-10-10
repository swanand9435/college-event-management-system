import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import technicalApi from "../services/technicalApi";
import "./TechnicalRegistration.css";

const DEFAULT_DEPARTMENTS = [
  "Information Technology",
  "CSE-AIML",
  "CSE-CYSE",
  "Mechanical",
  "Electrical",
  "Chemical",
  "Electronics & Telecommunication",
  "MCA",
  "Other / School / Junior College",
  "General / Not Applicable",
];

const DEFAULT_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "11th Standard",
  "12th Standard",
  "School (8th - 10th)",
  "Other",
];

export default function TechnicalRegistration() {
  const params = useParams();
  const location = useLocation();

  // Determine Event and Competition from URL
  let targetMajorEventId = "kalakruti";
  let targetCompetitionId = null;

  if (params.competitionSlug) {
    targetMajorEventId = "kalakruti";
    targetCompetitionId = params.competitionSlug;
  } else if (params.eventSlug) {
    targetMajorEventId = params.eventSlug;
  } else if (location.pathname.includes("/stabilia")) {
    targetMajorEventId = "stabilia";
  } else if (location.pathname.includes("/brainbyte")) {
    targetMajorEventId = "brainbyte";
  }

  const [majorEvent, setMajorEvent] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [positions, setPositions] = useState([]);
  const [departments] = useState(DEFAULT_DEPARTMENTS);
  const [years] = useState(DEFAULT_YEARS);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    institution: "",
    yearStandard: "",
    department: "",
    contactNumber: "",
    email: "",
    position: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch Event, Competition, & Dynamic Positions
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setServerError("");
      try {
        const [evData, posData] = await Promise.all([
          technicalApi.getEvent(targetMajorEventId),
          technicalApi.getPositions(),
        ]);

        if (isMounted) {
          setMajorEvent(evData);
          setPositions(posData || []);

          if (posData && posData.length > 0) {
            setFormData((prev) => ({
              ...prev,
              position: prev.position || posData[0].name,
            }));
          }

          if (targetCompetitionId) {
            const comp = evData.competitions?.find((c) => c.id === targetCompetitionId);
            if (comp) {
              setCompetition(comp);
            } else {
              try {
                const singleComp = await technicalApi.getCompetition(targetCompetitionId);
                if (isMounted) setCompetition(singleComp);
              } catch {
                // Subevent not found
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load registration target:", err);
        if (isMounted) {
          setServerError(err.message || "Failed to load event information.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [targetMajorEventId, targetCompetitionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) errs.fullName = "Full Name is required";
    if (!formData.institution.trim()) errs.institution = "School / College Name is required";
    if (!formData.yearStandard) errs.yearStandard = "Please select Year / Standard";
    if (!formData.department) errs.department = "Please select Department";
    if (!formData.position) errs.position = "Please select a Position";

    const cleanPhone = formData.contactNumber.replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errs.contactNumber = "Contact Number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      errs.contactNumber = "Please enter a valid 10-digit mobile number";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = "Email Address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        institution: formData.institution.trim(),
        yearStandard: formData.yearStandard,
        department: formData.department,
        contactNumber: formData.contactNumber.replace(/[\s-]/g, "").trim(),
        email: formData.email.trim(),
        position: formData.position,
        majorEventId: targetMajorEventId,
        competitionId: targetCompetitionId,
      };

      const result = await technicalApi.registerStudent(payload);
      setSubmittedData(result.data);
    } catch (err) {
      console.error("Technical registration error:", err);
      setServerError(err.message || "Registration submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const eventTitle = competition
    ? competition.name
    : majorEvent
    ? majorEvent.name
    : "Technical Event";

  const isClosed = competition
    ? !competition.isRegistrationOpen
    : majorEvent
    ? !majorEvent.isRegistrationOpen
    : false;

  return (
    <div className="tech-reg-page">
      <div className="tech-reg-glow"></div>
      <div className="tech-reg-glow-two"></div>

      {/* Navigation */}
      <header className="tech-reg-nav">
        <Link to="/technical" className="tech-reg-brand">
          <strong>FAMT ARENA</strong>
          <span>• TECH ARENA</span>
        </Link>
        <Link to="/technical" className="tech-reg-back">
          ← Back to Tech Events
        </Link>
      </header>

      <main className="tech-reg-container">
        {loading ? (
          <div className="tech-reg-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⚡</div>
            <h2>Connecting to Technical Arena...</h2>
            <p style={{ color: "#94a3b8" }}>Loading event configuration</p>
          </div>
        ) : !majorEvent ? (
          <div className="tech-reg-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ color: "#f87171" }}>Event Not Found</h2>
            <p style={{ color: "#cbd5e1", margin: "16px 0 24px" }}>
              The requested technical event or competition does not exist.
            </p>
            <Link to="/technical" className="tech-btn-primary">
              Return to Technical Section
            </Link>
          </div>
        ) : submittedData ? (
          /* Success Screen */
          <div className="tech-reg-card tech-success-card">
            <div className="tech-success-icon">✓</div>
            <h2>Registration Confirmed!</h2>
            <p>
              Your official entry for <strong>{eventTitle}</strong> has been saved to the
              FAMT Arena Technical database.
            </p>

            <div>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                YOUR UNIQUE REGISTRATION CODE
              </span>
              <div className="tech-success-code">{submittedData.registrationCode}</div>
            </div>

            <div className="tech-success-details">
              <div className="tech-success-row">
                <span>Student Name</span>
                <strong>{submittedData.fullName}</strong>
              </div>
              <div className="tech-success-row">
                <span>Event / Competition</span>
                <strong style={{ color: "#38bdf8" }}>
                  {submittedData.competitionName || submittedData.eventName}
                </strong>
              </div>
              <div className="tech-success-row">
                <span>School / College</span>
                <strong>{submittedData.institution}</strong>
              </div>
              <div className="tech-success-row">
                <span>Year / Standard</span>
                <strong>{submittedData.yearStandard}</strong>
              </div>
              <div className="tech-success-row">
                <span>Position</span>
                <strong style={{ color: "#38bdf8" }}>{submittedData.position}</strong>
              </div>
              <div className="tech-success-row">
                <span>Status</span>
                <strong style={{ color: "#10b981" }}>{submittedData.status}</strong>
              </div>
            </div>

            <div className="tech-success-actions">
              <button
                type="button"
                className="tech-btn-secondary"
                onClick={() => {
                  setSubmittedData(null);
                  setFormData({
                    fullName: "",
                    institution: "",
                    yearStandard: "",
                    department: "",
                    contactNumber: "",
                    email: "",
                    position: positions[0]?.name || "Participant",
                  });
                }}
              >
                Register Another Participant
              </button>
              <Link to="/technical" className="tech-btn-primary">
                Explore More Tech Events →
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <>
            <div className="tech-reg-header">
              <div className="tech-reg-badge">
                <span>{competition ? competition.icon || "🎨" : majorEvent.icon || "⚡"}</span>{" "}
                {competition ? "KALAKRUTI COMPETITION" : majorEvent.category || "FLAGSHIP EVENT"}
              </div>

              <h1 className="tech-reg-title">
                {eventTitle} <span>Registration</span>
              </h1>

              <p className="tech-reg-subtitle">
                {competition
                  ? competition.description
                  : majorEvent.description || "Register now to participate in FAMT Arena 2026."}
              </p>
            </div>

            <div className="tech-reg-card">
              {isClosed ? (
                <div className="tech-alert closed">
                  <span>⚠️</span>
                  <div>
                    <strong>Registration Closed:</strong> Submissions for {eventTitle} are currently
                    suspended by the Technical Administrator.
                  </div>
                </div>
              ) : null}

              {serverError && (
                <div className="tech-alert error">
                  <span>⚠️</span>
                  <div>{serverError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="tech-form-grid">
                  {/* Full Name */}
                  <div className="tech-form-group full-width">
                    <label className="tech-form-label" htmlFor="fullName">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="tech-form-input"
                      placeholder="Enter student's full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    />
                    {errors.fullName && <span className="tech-form-error">{errors.fullName}</span>}
                  </div>

                  {/* School / College Name */}
                  <div className="tech-form-group full-width">
                    <label className="tech-form-label" htmlFor="institution">
                      School / College Name <span className="req">*</span>
                    </label>
                    <input
                      id="institution"
                      name="institution"
                      type="text"
                      className="tech-form-input"
                      placeholder="e.g. FAMT Ratnagiri, Gharda Institute, DBJ College, etc."
                      value={formData.institution}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    />
                    {errors.institution && (
                      <span className="tech-form-error">{errors.institution}</span>
                    )}
                  </div>

                  {/* Year / Standard */}
                  <div className="tech-form-group">
                    <label className="tech-form-label" htmlFor="yearStandard">
                      Year / Standard <span className="req">*</span>
                    </label>
                    <select
                      id="yearStandard"
                      name="yearStandard"
                      className="tech-form-select"
                      value={formData.yearStandard}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    >
                      <option value="">Select Year / Standard</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    {errors.yearStandard && (
                      <span className="tech-form-error">{errors.yearStandard}</span>
                    )}
                  </div>

                  {/* Department */}
                  <div className="tech-form-group">
                    <label className="tech-form-label" htmlFor="department">
                      Department / Stream <span className="req">*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      className="tech-form-select"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <span className="tech-form-error">{errors.department}</span>
                    )}
                  </div>

                  {/* Position Preference (Dynamic Dropdown) */}
                  <div className="tech-form-group full-width">
                    <label className="tech-form-label" htmlFor="position">
                      Position Preference <span className="req">*</span>
                    </label>
                    <select
                      id="position"
                      name="position"
                      className="tech-form-select"
                      value={formData.position}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    >
                      <option value="">Select Position</option>
                      {positions.map((p) => (
                        <option key={p.id || p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.position && <span className="tech-form-error">{errors.position}</span>}
                  </div>

                  {/* Contact Number */}
                  <div className="tech-form-group">
                    <label className="tech-form-label" htmlFor="contactNumber">
                      Contact Number <span className="req">*</span>
                    </label>
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      maxLength={10}
                      className="tech-form-input"
                      placeholder="10-digit mobile number"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    />
                    {errors.contactNumber && (
                      <span className="tech-form-error">{errors.contactNumber}</span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="tech-form-group">
                    <label className="tech-form-label" htmlFor="email">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="tech-form-input"
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitting || isClosed}
                    />
                    {errors.email && <span className="tech-form-error">{errors.email}</span>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="tech-submit-btn"
                  disabled={submitting || isClosed}
                >
                  {isClosed ? (
                    "Registration Closed"
                  ) : submitting ? (
                    <>
                      <span>⏳</span> Submitting Registration...
                    </>
                  ) : (
                    <>
                      <span>⚡</span> Register for {eventTitle}
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
