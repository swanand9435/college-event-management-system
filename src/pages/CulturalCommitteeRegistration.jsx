import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import culturalApi from "../services/culturalApi";
import "./CulturalCommitteeRegistration.css";

const DEPARTMENTS = [
  "Information Technology",
  "CSE-AIML",
  "CSE-CYSE",
  "Mechanical",
  "Electrical",
  "Chemical",
  "Electronics & Telecommunication",
  "MCA",
];

const STUDENT_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function CulturalCommitteeRegistration() {
  const { committeeId } = useParams();

  const [committee, setCommittee] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    studentYear: "",
    position: "",
    contactNumber: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  // 1. Fetch Committee and Dynamic Position Options
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setServerError("");
      try {
        const [commData, posData] = await Promise.all([
          culturalApi.getCommittee(committeeId),
          culturalApi.getPositions(),
        ]);

        if (isMounted) {
          setCommittee(commData);
          setPositions(posData || []);
          if (posData && posData.length > 0) {
            setFormData((prev) => ({
              ...prev,
              position: prev.position || posData[0].name,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading committee or positions:", err);
        if (isMounted) {
          setServerError(
            err.message || "Failed to load committee information. Please check your connection."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (committeeId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [committeeId]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  // Client Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.department) {
      newErrors.department = "Please select your department";
    }

    if (!formData.studentYear) {
      newErrors.studentYear = "Please select your year of study";
    }

    if (!formData.position) {
      newErrors.position = "Please select a position";
    }

    const cleanPhone = formData.contactNumber.replace(/[\s-]/g, "");
    if (!cleanPhone) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.contactNumber = "Please enter a valid 10-digit mobile number";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        department: formData.department,
        studentYear: formData.studentYear,
        committeeId,
        position: formData.position,
        contactNumber: formData.contactNumber.replace(/[\s-]/g, "").trim(),
        email: formData.email.trim(),
      };

      const result = await culturalApi.registerStudent(payload);
      setSubmittedData(result.data);
    } catch (err) {
      console.error("Submission failed:", err);
      setServerError(
        err.message || "Registration failed. Please review your information."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cultural-reg-page">
      <div className="cultural-reg-bg-glow"></div>
      <div className="cultural-reg-bg-glow-two"></div>

      {/* Navigation */}
      <header className="cultural-reg-nav">
        <Link to="/cultural" className="cultural-reg-nav-brand">
          <strong>FAMT ARENA</strong>
          <span>• UTOPIA</span>
        </Link>
        <Link to="/cultural#committees" className="cultural-reg-nav-back">
          ← Back to Committees
        </Link>
      </header>

      <main className="cultural-reg-container">
        {loading ? (
          <div className="cultural-reg-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>✨</div>
            <h2>Loading Committee Details...</h2>
            <p style={{ color: "#94a3b8" }}>Connecting to FAMT Cultural database</p>
          </div>
        ) : !committee ? (
          <div className="cultural-reg-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ color: "#ff6b6b" }}>Committee Not Found</h2>
            <p style={{ color: "#cbd5e1", margin: "16px 0 24px" }}>
              The requested committee &quot;{committeeId}&quot; does not exist or has been deactivated.
            </p>
            <Link to="/cultural" className="cultural-btn-primary">
              Return to Cultural Landing
            </Link>
          </div>
        ) : submittedData ? (
          /* Success Screen */
          <div className="cultural-reg-card cultural-success-card">
            <div className="cultural-success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <p>
              Thank you, <strong>{submittedData.fullName}</strong>. Your registration for the{" "}
              <strong>{submittedData.committeeName} Committee</strong> has been successfully submitted and stored.
            </p>

            <div className="cultural-success-details">
              <div className="cultural-success-row">
                <span>Registration ID</span>
                <strong>#{submittedData.id}</strong>
              </div>
              <div className="cultural-success-row">
                <span>Committee</span>
                <strong>{submittedData.committeeName}</strong>
              </div>
              <div className="cultural-success-row">
                <span>Selected Position</span>
                <strong style={{ color: "#ffd700" }}>{submittedData.position}</strong>
              </div>
              <div className="cultural-success-row">
                <span>Department</span>
                <strong>{submittedData.department}</strong>
              </div>
              <div className="cultural-success-row">
                <span>Year of Study</span>
                <strong>{submittedData.studentYear}</strong>
              </div>
              <div className="cultural-success-row">
                <span>Status</span>
                <strong style={{ color: "#38bdf8" }}>{submittedData.status}</strong>
              </div>
            </div>

            <div className="cultural-success-actions">
              <button
                type="button"
                className="cultural-btn-secondary"
                onClick={() => {
                  setSubmittedData(null);
                  setFormData({
                    fullName: "",
                    department: "",
                    studentYear: "",
                    position: positions[0]?.name || "Participation",
                    contactNumber: "",
                    email: "",
                  });
                }}
              >
                Register Another Student
              </button>
              <Link to="/cultural" className="cultural-btn-primary">
                Back to Utopia Stage →
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <>
            <div className="cultural-reg-header">
              <div className="cultural-reg-badge">
                {committee.icon || "🎭"} {committee.category || "Cultural Force"}
              </div>
              <h1 className="cultural-reg-title">
                {committee.name} <span>Registration</span>
              </h1>
              <p className="cultural-reg-subtitle">
                {committee.description ||
                  "Step up and become an essential part of the UTOPIA cultural experience."}
              </p>
            </div>

            <div className="cultural-reg-card">
              {serverError && (
                <div className="cultural-alert error">
                  <span>⚠️</span>
                  <div>{serverError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="cultural-form-grid">
                  {/* Full Name */}
                  <div className="cultural-form-group full-width">
                    <label className="cultural-form-label" htmlFor="fullName">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="cultural-form-input"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.fullName && (
                      <span className="cultural-form-error">{errors.fullName}</span>
                    )}
                  </div>

                  {/* Department */}
                  <div className="cultural-form-group">
                    <label className="cultural-form-label" htmlFor="department">
                      Department <span className="req">*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      className="cultural-form-select"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <span className="cultural-form-error">{errors.department}</span>
                    )}
                  </div>

                  {/* Student Year */}
                  <div className="cultural-form-group">
                    <label className="cultural-form-label" htmlFor="studentYear">
                      Year of Study <span className="req">*</span>
                    </label>
                    <select
                      id="studentYear"
                      name="studentYear"
                      className="cultural-form-select"
                      value={formData.studentYear}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">Select Year</option>
                      {STUDENT_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    {errors.studentYear && (
                      <span className="cultural-form-error">{errors.studentYear}</span>
                    )}
                  </div>

                  {/* Position (Dynamic Dropdown from Backend) */}
                  <div className="cultural-form-group full-width">
                    <label className="cultural-form-label" htmlFor="position">
                      Position Preference <span className="req">*</span>
                    </label>
                    <select
                      id="position"
                      name="position"
                      className="cultural-form-select"
                      value={formData.position}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">Select Position</option>
                      {positions.map((pos) => (
                        <option key={pos.id || pos.name} value={pos.name}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                    {errors.position && (
                      <span className="cultural-form-error">{errors.position}</span>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="cultural-form-group">
                    <label className="cultural-form-label" htmlFor="contactNumber">
                      Contact Number <span className="req">*</span>
                    </label>
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      maxLength={10}
                      className="cultural-form-input"
                      placeholder="10-digit mobile number"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.contactNumber && (
                      <span className="cultural-form-error">{errors.contactNumber}</span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="cultural-form-group">
                    <label className="cultural-form-label" htmlFor="email">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="cultural-form-input"
                      placeholder="student@famt.ac.in"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.email && (
                      <span className="cultural-form-error">{errors.email}</span>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="cultural-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span>⏳</span> Submitting Registration...
                    </>
                  ) : (
                    <>
                      <span>✨</span> Submit Registration for {committee.name}
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
