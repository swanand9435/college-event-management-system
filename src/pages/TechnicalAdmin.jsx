import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import technicalApi from "../services/technicalApi";
import "./TechnicalAdmin.css";

const DEPARTMENTS = [
  "Information Technology",
  "CSE-AIML",
  "CSE-CYSE",
  "Mechanical",
  "Electrical",
  "Chemical",
  "Electronics & Telecommunication",
  "MCA",
  "First Year Engineering",
  "Other / Outside College",
  "None / School Student",
];

const STUDENT_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Junior College (11th/12th)",
  "School (8th-10th)",
];

const KALAKRUTI_COMPETITIONS_DATA = [
  { slug: "reel-short-making", name: "Reel & Short Making" },
  { slug: "dslr-photography", name: "DSLR Photography Competition" },
  { slug: "origami-knitting-quilling", name: "Origami / Knitting / Quilling" },
  { slug: "cup-mug-painting", name: "Cup & Mug Painting" },
  { slug: "rangoli-kalakruti", name: "Rangoli (Kalakruti)" },
  { slug: "poster-making", name: "Poster Making" },
  { slug: "mehendi-competition", name: "Mehendi Competition" },
  { slug: "painting-kalakruti", name: "Painting (Kalakruti)" },
  { slug: "best-out-of-waste", name: "Best Out of Waste" },
  { slug: "pot-painting", name: "Pot Painting" },
  { slug: "mobile-photography", name: "Mobile Photography" },
  { slug: "sketching-competition", name: "Sketching Competition" },
];

export default function TechnicalAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "registrations" | "positions" | "events" | "qrcodes"

  // Login form state
  const [username, setUsername] = useState("tech_admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Notifications
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Core Data
  const [dashboard, setDashboard] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Registration Filters & Search
  const [search, setSearch] = useState("");
  const [filterMajorEvent, setFilterMajorEvent] = useState("ALL");
  const [filterCompetition, setFilterCompetition] = useState("ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterPosition, setFilterPosition] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modals state
  const [viewingReg, setViewingReg] = useState(null);
  const [editingReg, setEditingReg] = useState(null);
  const [deletingReg, setDeletingReg] = useState(null);
  const [isUpdatingReg, setIsUpdatingReg] = useState(false);

  // Position Management Form
  const [newPositionName, setNewPositionName] = useState("");
  const [editingPosition, setEditingPosition] = useState(null);

  // QR Code base URL config
  const [customBaseUrl, setCustomBaseUrl] = useState(
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173"
  );
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState({});

  // 1. Check Authentication on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const isValid = await technicalApi.verifyAdminSession();
        setIsAuthenticated(isValid);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch Core Data
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    setError("");
    try {
      const [dash, regs, evList, posList] = await Promise.all([
        technicalApi.getDashboard(),
        technicalApi.getRegistrations({
          search,
          majorEvent: filterMajorEvent,
          competition: filterCompetition,
          department: filterDepartment,
          studentYear: filterYear,
          position: filterPosition,
          status: filterStatus,
        }),
        technicalApi.getAdminEvents(),
        technicalApi.getPositionsAdmin(),
      ]);

      setDashboard(dash);
      setRegistrations(regs);
      setEvents(evList);
      setPositions(posList);
    } catch (err) {
      setError(err.message || "Failed to load Technical administration data");
    } finally {
      setLoadingData(false);
    }
  }, [
    isAuthenticated,
    search,
    filterMajorEvent,
    filterCompetition,
    filterDepartment,
    filterYear,
    filterPosition,
    filterStatus,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // 3. Generate QR Codes for all events and competitions
  useEffect(() => {
    async function generateAllQrs() {
      const allItems = [
        { key: "stabilia", url: `${customBaseUrl}/technical/stabilia` },
        { key: "brainbyte", url: `${customBaseUrl}/technical/brainbyte` },
        ...KALAKRUTI_COMPETITIONS_DATA.map((c) => ({
          key: `kalakruti-${c.slug}`,
          url: `${customBaseUrl}/technical/kalakruti/${c.slug}`,
        })),
      ];

      const results = {};
      for (const item of allItems) {
        try {
          const dataUrl = await QRCode.toDataURL(item.url, {
            width: 320,
            margin: 2,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          results[item.key] = dataUrl;
        } catch (e) {
          console.error("QR Generation error for", item.key, e);
        }
      }
      setQrCodeDataUrls(results);
    }

    generateAllQrs();
  }, [customBaseUrl]);

  // Handle Login
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await technicalApi.adminLogin(username, password);
      setIsAuthenticated(true);
      setMessage("Welcome back! Technical Administrator session verified.");
    } catch (err) {
      setLoginError(err.message || "Invalid administrator credentials");
    } finally {
      setLoginLoading(false);
    }
  }

  // Handle Logout
  function handleLogout() {
    technicalApi.adminLogout();
    setIsAuthenticated(false);
    setMessage("");
  }

  // Quick Status Update
  async function handleStatusChange(regId, newStatus) {
    try {
      await technicalApi.updateStatus(regId, newStatus);
      setMessage(`Registration status updated to ${newStatus}`);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update registration status");
    }
  }

  // Quick Position Update
  async function handlePositionChange(regId, newPos) {
    try {
      await technicalApi.changePosition(regId, newPos);
      setMessage(`Student position updated to "${newPos}"`);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update position");
    }
  }

  // Save Edit Registration
  async function handleSaveRegistration(e) {
    e.preventDefault();
    if (!editingReg) return;
    setIsUpdatingReg(true);
    try {
      await technicalApi.updateRegistration(editingReg.id, {
        fullName: editingReg.fullName,
        collegeName: editingReg.collegeName,
        studentYear: editingReg.studentYear,
        department: editingReg.department,
        contactNumber: editingReg.contactNumber,
        email: editingReg.email,
        position: editingReg.position,
        status: editingReg.status,
      });
      setMessage("Registration updated successfully");
      setEditingReg(null);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to save registration changes");
    } finally {
      setIsUpdatingReg(false);
    }
  }

  // Delete Registration
  async function handleDeleteRegistration() {
    if (!deletingReg) return;
    try {
      await technicalApi.deleteRegistration(deletingReg.id);
      setMessage(`Registration ${deletingReg.registrationId} deleted`);
      setDeletingReg(null);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to delete registration");
    }
  }

  // Add Position
  async function handleAddPosition(e) {
    e.preventDefault();
    if (!newPositionName.trim()) return;
    try {
      await technicalApi.addPosition(newPositionName.trim(), true);
      setMessage(`Added new position option: "${newPositionName.trim()}"`);
      setNewPositionName("");
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to add position");
    }
  }

  // Toggle Position Active Status
  async function handleTogglePositionActive(pos) {
    try {
      await technicalApi.updatePosition(pos.id, {
        isActive: !pos.isActive,
      });
      setMessage(
        `Position "${pos.name}" is now ${!pos.isActive ? "Active (visible on form)" : "Inactive (hidden from form)"}`
      );
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to toggle position");
    }
  }

  // Save Renamed Position
  async function handleSaveEditPosition(e) {
    e.preventDefault();
    if (!editingPosition || !editingPosition.name.trim()) return;
    try {
      await technicalApi.updatePosition(editingPosition.id, {
        name: editingPosition.name.trim(),
        isActive: editingPosition.isActive,
      });
      setMessage(`Updated position label to "${editingPosition.name.trim()}"`);
      setEditingPosition(null);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update position");
    }
  }

  // Toggle Event Registration (Open / Closed)
  async function handleToggleEvent(eventId) {
    try {
      await technicalApi.toggleEventRegistration(eventId);
      setMessage("Major event registration status toggled");
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to toggle event registration");
    }
  }

  // Toggle Competition Registration (Open / Closed)
  async function handleToggleCompetition(compId) {
    try {
      await technicalApi.toggleCompetitionRegistration(compId);
      setMessage("Kalakruti competition registration status toggled");
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to toggle competition registration");
    }
  }

  // Export CSV
  async function handleExportCsv() {
    try {
      setMessage("Exporting Technical registrations CSV...");
      await technicalApi.downloadExportCsv({
        search,
        majorEvent: filterMajorEvent,
        competition: filterCompetition,
        department: filterDepartment,
        studentYear: filterYear,
        position: filterPosition,
        status: filterStatus,
      });
      setMessage("CSV exported successfully");
    } catch (err) {
      setError(err.message || "Export failed");
    }
  }

  // Copy Link Helper
  function handleCopyUrl(slug, url) {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  }

  // Download QR Code PNG
  function handleDownloadQr(title, dataUrl) {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `FAMT_Technical_${safeTitle}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Print QR Card Pop-up
  function handlePrintQrCard(title, category, url, dataUrl) {
    const printWindow = window.open("", "_blank", "width=600,height=750");
    if (!printWindow) {
      alert("Please allow pop-ups to print the QR Code card");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FAMT Arena — ${title} QR Card</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px 20px;
              color: #1e293b;
              background: #ffffff;
            }
            .card {
              border: 3px solid #0284c7;
              border-radius: 16px;
              padding: 30px;
              max-width: 440px;
              margin: 0 auto;
            }
            .header {
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 2px;
              color: #0284c7;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 6px 0;
              color: #0f172a;
            }
            .category {
              font-size: 13px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 24px;
            }
            .qr-wrapper {
              display: inline-block;
              padding: 12px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              background: #ffffff;
            }
            .qr-wrapper img {
              width: 240px;
              height: 240px;
              display: block;
            }
            .instructions {
              margin-top: 24px;
              font-size: 15px;
              font-weight: 600;
              color: #334155;
            }
            .url-text {
              margin-top: 8px;
              font-size: 11px;
              color: #94a3b8;
              word-break: break-all;
              font-family: monospace;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">FAMT Arena Technical 2026</div>
            <h1>${title}</h1>
            <div class="category">${category}</div>
            <div class="qr-wrapper">
              <img src="${dataUrl}" alt="${title} QR Code" />
            </div>
            <div class="instructions">Scan QR Code to Open Registration Page</div>
            <div class="url-text">${url}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // -------------------------------------------------------------
  // RENDER: Checking Auth Loading
  // -------------------------------------------------------------
  if (checkingAuth) {
    return (
      <div className="tech-admin-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#38bdf8", fontSize: "1.1rem" }}>Verifying Technical Admin Session...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Login Screen if not authenticated
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="tech-admin-container">
        <div className="tech-login-wrapper">
          <div className="tech-login-card">
            <div className="tech-login-header">
              <div className="tech-login-badge">🔒 Restricted Portal</div>
              <h1 className="tech-login-title">Technical Admin</h1>
              <p className="tech-login-subtitle">
                FAMT Arena — Stabilia, BrainByte & Kalakruti Management
              </p>
            </div>

            {loginError && <div className="tech-alert tech-alert-error">{loginError}</div>}

            <form onSubmit={handleLogin} className="tech-login-form">
              <div className="tech-form-group">
                <label>Admin Username</label>
                <input
                  type="text"
                  className="tech-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tech_admin"
                  required
                />
              </div>

              <div className="tech-form-group">
                <label>Admin Password</label>
                <input
                  type="password"
                  className="tech-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="tech-btn-primary"
                disabled={loginLoading}
                style={{ marginTop: "12px" }}
              >
                {loginLoading ? "Authenticating..." : "Access Technical Dashboard →"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Link to="/technical" style={{ color: "#38bdf8", fontSize: "0.88rem", textDecoration: "none" }}>
                ← Return to Technical Landing Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Technical Admin Panel
  // -------------------------------------------------------------
  return (
    <div className="tech-admin-container">
      {/* Navbar */}
      <header className="tech-admin-navbar">
        <div className="tech-nav-inner">
          <Link to="/technical" className="tech-nav-brand">
            <span className="tech-nav-logo-badge">FAMT ARENA</span>
            <span className="tech-nav-title">Technical Administration</span>
          </Link>

          <div className="tech-nav-actions">
            <Link to="/technical" className="tech-btn-outline" target="_blank">
              Live Technical Section ↗
            </Link>
            <button onClick={handleLogout} className="tech-btn-danger-outline">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tech-tabs-bar">
        <button
          className={`tech-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard Overview
        </button>

        <button
          className={`tech-tab-btn ${activeTab === "registrations" ? "active" : ""}`}
          onClick={() => setActiveTab("registrations")}
        >
          📋 Registrations
          <span className="tech-tab-count">{registrations.length}</span>
        </button>

        <button
          className={`tech-tab-btn ${activeTab === "positions" ? "active" : ""}`}
          onClick={() => setActiveTab("positions")}
        >
          ⚙️ Position Management
          <span className="tech-tab-count">{positions.length}</span>
        </button>

        <button
          className={`tech-tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          🔒 Event Open/Close Controls
        </button>

        <button
          className={`tech-tab-btn ${activeTab === "qrcodes" ? "active" : ""}`}
          onClick={() => setActiveTab("qrcodes")}
        >
          📱 QR Codes & Share Links
        </button>
      </nav>

      {/* Main Admin Area */}
      <main className="tech-admin-main">
        {/* Alerts */}
        {message && (
          <div className="tech-alert tech-alert-success">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="tech-alert tech-alert-error">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 1: DASHBOARD
            ======================================================== */}
        {activeTab === "dashboard" && dashboard && (
          <div>
            {/* Top Stat Cards */}
            <div className="tech-stats-grid">
              <div className="tech-stat-card">
                <h3 className="tech-stat-title">Total Registrations</h3>
                <div className="tech-stat-value">{dashboard.totalRegistrations}</div>
                <p className="tech-stat-desc">Across all 3 major events & 12 competitions</p>
              </div>

              <div className="tech-stat-card stabilia">
                <h3 className="tech-stat-title">Stabilia</h3>
                <div className="tech-stat-value" style={{ color: "#06b6d4" }}>
                  {dashboard.majorEventsBreakdown?.find((e) => e.slug === "stabilia")?.registrationCount || 0}
                </div>
                <p className="tech-stat-desc">Structural & Design Arena</p>
              </div>

              <div className="tech-stat-card brainbyte">
                <h3 className="tech-stat-title">BrainByte</h3>
                <div className="tech-stat-value" style={{ color: "#818cf8" }}>
                  {dashboard.majorEventsBreakdown?.find((e) => e.slug === "brainbyte")?.registrationCount || 0}
                </div>
                <p className="tech-stat-desc">Software & Coding Challenge</p>
              </div>

              <div className="tech-stat-card kalakruti">
                <h3 className="tech-stat-title">Kalakruti</h3>
                <div className="tech-stat-value" style={{ color: "#fbbf24" }}>
                  {dashboard.majorEventsBreakdown?.find((e) => e.slug === "kalakruti")?.registrationCount || 0}
                </div>
                <p className="tech-stat-desc">12 Creative & Digital Arts Subevents</p>
              </div>
            </div>

            {/* Dashboard Sections Grid */}
            <div className="tech-dashboard-sections">
              {/* Kalakruti Subevents Breakdown */}
              <div className="tech-card">
                <div className="tech-card-header">
                  <h3 className="tech-card-title">Kalakruti Subevents Breakdown</h3>
                  <button
                    onClick={() => {
                      setFilterMajorEvent("Kalakruti");
                      setActiveTab("registrations");
                    }}
                    className="tech-btn-outline"
                    style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                  >
                    View All →
                  </button>
                </div>

                <div className="tech-breakdown-list" style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {dashboard.competitionsBreakdown && dashboard.competitionsBreakdown.length > 0 ? (
                    dashboard.competitionsBreakdown.map((comp) => (
                      <div key={comp.id} className="tech-breakdown-row">
                        <span className="tech-breakdown-label">{comp.name}</span>
                        <span className="tech-breakdown-count">{comp.registrationCount}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", fontStyle: "italic" }}>No Kalakruti registrations yet.</p>
                  )}
                </div>
              </div>

              {/* Positions & Status Breakdown */}
              <div className="tech-card">
                <div className="tech-card-header">
                  <h3 className="tech-card-title">Positions & Status Breakdown</h3>
                </div>

                <h4 style={{ fontSize: "0.85rem", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                  Positions Distribution
                </h4>
                <div className="tech-breakdown-list" style={{ marginBottom: "24px" }}>
                  {dashboard.positionsBreakdown && dashboard.positionsBreakdown.length > 0 ? (
                    dashboard.positionsBreakdown.map((p, idx) => (
                      <div key={idx} className="tech-breakdown-row">
                        <span className="tech-breakdown-label">{p.position}</span>
                        <span className="tech-breakdown-count">{p.count}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", fontStyle: "italic" }}>No data</p>
                  )}
                </div>

                <h4 style={{ fontSize: "0.85rem", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                  Registration Status
                </h4>
                <div className="tech-breakdown-list">
                  {dashboard.statusBreakdown && dashboard.statusBreakdown.length > 0 ? (
                    dashboard.statusBreakdown.map((s, idx) => (
                      <div key={idx} className="tech-breakdown-row">
                        <span className="tech-breakdown-label">{s.status}</span>
                        <span className="tech-breakdown-count">{s.count}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#64748b", fontStyle: "italic" }}>No data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="tech-card">
              <div className="tech-card-header">
                <h3 className="tech-card-title">Recent Submissions (Last 10)</h3>
                <button
                  onClick={() => setActiveTab("registrations")}
                  className="tech-btn-outline"
                  style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                >
                  Go to Registrations Table →
                </button>
              </div>

              <div className="tech-table-container">
                <table className="tech-table">
                  <thead>
                    <tr>
                      <th>Reg ID</th>
                      <th>Student</th>
                      <th>Event</th>
                      <th>Competition</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentRegistrations && dashboard.recentRegistrations.length > 0 ? (
                      dashboard.recentRegistrations.map((r) => (
                        <tr key={r.id}>
                          <td className="tech-reg-id">{r.registrationId}</td>
                          <td>
                            <strong>{r.fullName}</strong>
                            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.department}</div>
                          </td>
                          <td>{r.majorEvent?.name}</td>
                          <td>{r.competition?.name || "—"}</td>
                          <td>
                            <span className="tech-badge position">{r.position}</span>
                          </td>
                          <td>
                            <span className={`tech-badge ${r.status?.toLowerCase()}`}>{r.status}</span>
                          </td>
                          <td style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                          No student registrations found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: REGISTRATIONS MANAGEMENT
            ======================================================== */}
        {activeTab === "registrations" && (
          <div>
            {/* Filters Bar */}
            <div className="tech-filters-bar">
              <div className="tech-filter-group" style={{ gridColumn: "span 2" }}>
                <label>Search Registrations</label>
                <input
                  type="text"
                  className="tech-input"
                  placeholder="Student name, contact number, email, or Reg ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="tech-filter-group">
                <label>Major Event</label>
                <select
                  className="tech-select"
                  value={filterMajorEvent}
                  onChange={(e) => {
                    setFilterMajorEvent(e.target.value);
                    if (e.target.value !== "Kalakruti") setFilterCompetition("ALL");
                  }}
                >
                  <option value="ALL">All Major Events</option>
                  <option value="Stabilia">Stabilia</option>
                  <option value="BrainByte">BrainByte</option>
                  <option value="Kalakruti">Kalakruti</option>
                </select>
              </div>

              <div className="tech-filter-group">
                <label>Kalakruti Subevent</label>
                <select
                  className="tech-select"
                  value={filterCompetition}
                  onChange={(e) => setFilterCompetition(e.target.value)}
                >
                  <option value="ALL">All Subevents</option>
                  {KALAKRUTI_COMPETITIONS_DATA.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tech-filter-group">
                <label>Position</label>
                <select
                  className="tech-select"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                >
                  <option value="ALL">All Positions</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tech-filter-group">
                <label>Department</label>
                <select
                  className="tech-select"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tech-filter-group">
                <label>Status</label>
                <select
                  className="tech-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Header Actions */}
            <div className="tech-table-header-actions">
              <div className="tech-table-count">
                Showing <strong>{registrations.length}</strong> registrations
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={loadAllData} className="tech-btn-outline" disabled={loadingData}>
                  🔄 Refresh Data
                </button>
                <button onClick={handleExportCsv} className="tech-btn-primary" style={{ width: "auto" }}>
                  📥 Export to CSV
                </button>
              </div>
            </div>

            {/* Registrations Table */}
            <div className="tech-table-container">
              <table className="tech-table">
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Student Name</th>
                    <th>Event / Competition</th>
                    <th>Dept & Year</th>
                    <th>Position</th>
                    <th>Contact & Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length > 0 ? (
                    registrations.map((r) => (
                      <tr key={r.id}>
                        <td className="tech-reg-id">{r.registrationId}</td>
                        <td>
                          <strong>{r.fullName}</strong>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.collegeName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#38bdf8" }}>{r.majorEvent?.name}</div>
                          {r.competition && (
                            <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{r.competition.name}</div>
                          )}
                        </td>
                        <td>
                          <div>{r.department}</div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.studentYear}</div>
                        </td>
                        <td>
                          <select
                            className="tech-select"
                            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                            value={r.position}
                            onChange={(e) => handlePositionChange(r.id, e.target.value)}
                          >
                            {positions.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div>📞 {r.contactNumber}</div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>✉️ {r.email}</div>
                        </td>
                        <td>
                          <select
                            className={`tech-select`}
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color:
                                r.status === "CONFIRMED"
                                  ? "#34d399"
                                  : r.status === "PENDING"
                                  ? "#fbbf24"
                                  : "#f87171",
                            }}
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td>
                          <div className="tech-row-actions">
                            <button
                              onClick={() => setViewingReg(r)}
                              className="tech-action-btn"
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => setEditingReg({ ...r })}
                              className="tech-action-btn"
                              title="Edit Details"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setDeletingReg(r)}
                              className="tech-action-btn delete"
                              title="Delete Registration"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        No registrations matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: POSITION MANAGEMENT
            ======================================================== */}
        {activeTab === "positions" && (
          <div>
            <div className="tech-pos-add-box">
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", color: "#f8fafc" }}>
                Add New Technical Position Option
              </h3>
              <p style={{ margin: "0", fontSize: "0.85rem", color: "#94a3b8" }}>
                Positions added here will automatically appear on student registration forms (Stabilia, BrainByte &
                Kalakruti competitions).
              </p>

              <form onSubmit={handleAddPosition} className="tech-pos-add-form">
                <input
                  type="text"
                  className="tech-input"
                  style={{ maxWidth: "340px" }}
                  placeholder="e.g. Volunteer, Faculty Coordinator, etc."
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  required
                />
                <button type="submit" className="tech-btn-primary" style={{ width: "auto" }}>
                  + Add Position
                </button>
              </form>
            </div>

            <div className="tech-pos-grid">
              {positions.map((pos) => (
                <div key={pos.id} className="tech-pos-card">
                  <div className="tech-pos-header">
                    <div>
                      <h4 className="tech-pos-name">{pos.name}</h4>
                      <div className="tech-pos-count">
                        Used in <strong>{pos._count?.registrations || 0}</strong> registrations
                      </div>
                    </div>

                    <span className={`tech-badge ${pos.isActive ? "confirmed" : "cancelled"}`}>
                      {pos.isActive ? "Active (Visible)" : "Inactive (Hidden)"}
                    </span>
                  </div>

                  <div className="tech-pos-actions">
                    <button
                      onClick={() => handleTogglePositionActive(pos)}
                      className="tech-btn-outline"
                      style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                      {pos.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => setEditingPosition({ ...pos })}
                      className="tech-btn-outline"
                      style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                      Rename
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: EVENT & COMPETITION REGISTRATION CONTROLS
            ======================================================== */}
        {activeTab === "events" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
                Major Events Registration Controls
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0" }}>
                Closing an event prevents new student submissions while preserving all past registration data.
              </p>
            </div>

            <div className="tech-events-control-grid" style={{ marginBottom: "40px" }}>
              {events.map((ev) => (
                <div key={ev.id} className="tech-event-toggle-card">
                  <div className="tech-event-toggle-header">
                    <div>
                      <h4 className="tech-event-toggle-title">{ev.name}</h4>
                      <p className="tech-event-toggle-sub">{ev.category}</p>
                    </div>

                    <div className="tech-toggle-switch">
                      <button
                        onClick={() => handleToggleEvent(ev.id)}
                        className={`tech-toggle-btn ${ev.isRegistrationOpen ? "open" : "closed"}`}
                      >
                        {ev.isRegistrationOpen ? "🟢 Open" : "🔴 Closed"}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    Registrations: <strong>{ev._count?.registrations || 0}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
                Kalakruti Subevent Registrations (12 Competitions)
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0" }}>
                Toggle individual registration status for each of the 12 competitions under Kalakruti.
              </p>
            </div>

            <div className="tech-events-control-grid">
              {events
                .find((e) => e.slug === "kalakruti")
                ?.competitions?.map((comp) => (
                  <div key={comp.id} className="tech-event-toggle-card">
                    <div className="tech-event-toggle-header">
                      <div>
                        <h4 className="tech-event-toggle-title">{comp.name}</h4>
                        <p className="tech-event-toggle-sub">Kalakruti Subevent</p>
                      </div>

                      <div className="tech-toggle-switch">
                        <button
                          onClick={() => handleToggleCompetition(comp.id)}
                          className={`tech-toggle-btn ${comp.isRegistrationOpen ? "open" : "closed"}`}
                        >
                          {comp.isRegistrationOpen ? "🟢 Open" : "🔴 Closed"}
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      Registrations: <strong>{comp._count?.registrations || 0}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: QR CODES & REGISTRATION LINKS
            ======================================================== */}
        {activeTab === "qrcodes" && (
          <div>
            {/* Base URL Configuration Box */}
            <div className="tech-qr-config-box">
              <div className="tech-qr-config-header">
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 4px 0", color: "#f8fafc" }}>
                    Shareable Registration Links & QR Code Generator
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                    Unique dedicated URLs and downloadable high-res QR codes for Stabilia, BrainByte, and all 12
                    Kalakruti competitions.
                  </p>
                </div>

                {customBaseUrl.includes("localhost") && (
                  <span className="tech-alert-warning" style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem" }}>
                    ⚠️ Using Localhost: Links will work locally. Update to your public domain when sharing with students.
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#cbd5e1" }}>
                  Public Frontend Domain / Base URL:
                </label>
                <input
                  type="text"
                  className="tech-input"
                  style={{ maxWidth: "380px" }}
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://famtarena.edu.in"
                />
                <button
                  onClick={() => setCustomBaseUrl(window.location.origin)}
                  className="tech-btn-outline"
                  style={{ fontSize: "0.82rem", padding: "8px 12px" }}
                >
                  Reset to Current Origin
                </button>
              </div>
            </div>

            {/* Major Events QR Section */}
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 16px 0" }}>
              Major Events (Stabilia & BrainByte)
            </h2>

            <div className="tech-qr-grid" style={{ marginBottom: "40px" }}>
              {/* Stabilia Card */}
              {(() => {
                const url = `${customBaseUrl}/technical/stabilia`;
                const qrData = qrCodeDataUrls["stabilia"];
                return (
                  <div className="tech-qr-card">
                    <div className="tech-qr-badge">Civil & Structural Event</div>
                    <h3 className="tech-qr-title">Stabilia</h3>
                    <div className="tech-qr-canvas-wrapper">
                      {qrData ? <img src={qrData} alt="Stabilia QR" /> : <span>Generating...</span>}
                    </div>

                    <div className="tech-qr-url-box">
                      <span className="tech-qr-url-text">{url}</span>
                    </div>

                    <div className="tech-qr-actions">
                      <button onClick={() => handleCopyUrl("stabilia", url)} className="tech-qr-btn copy">
                        {copiedSlug === "stabilia" ? "✓ Copied!" : "📋 Copy Link"}
                      </button>
                      <button
                        onClick={() => handleDownloadQr("Stabilia", qrData)}
                        className="tech-qr-btn download"
                      >
                        ⬇️ Download PNG
                      </button>
                      <button
                        onClick={() => handlePrintQrCard("Stabilia", "Major Technical Event", url, qrData)}
                        className="tech-qr-btn test"
                      >
                        🖨️ Print
                      </button>
                      <Link to="/technical/stabilia" target="_blank" className="tech-qr-btn test">
                        Open ↗
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* BrainByte Card */}
              {(() => {
                const url = `${customBaseUrl}/technical/brainbyte`;
                const qrData = qrCodeDataUrls["brainbyte"];
                return (
                  <div className="tech-qr-card">
                    <div className="tech-qr-badge" style={{ color: "#a5b4fc" }}>
                      Coding & CS/IT Arena
                    </div>
                    <h3 className="tech-qr-title">BrainByte</h3>
                    <div className="tech-qr-canvas-wrapper">
                      {qrData ? <img src={qrData} alt="BrainByte QR" /> : <span>Generating...</span>}
                    </div>

                    <div className="tech-qr-url-box">
                      <span className="tech-qr-url-text">{url}</span>
                    </div>

                    <div className="tech-qr-actions">
                      <button onClick={() => handleCopyUrl("brainbyte", url)} className="tech-qr-btn copy">
                        {copiedSlug === "brainbyte" ? "✓ Copied!" : "📋 Copy Link"}
                      </button>
                      <button
                        onClick={() => handleDownloadQr("BrainByte", qrData)}
                        className="tech-qr-btn download"
                      >
                        ⬇️ Download PNG
                      </button>
                      <button
                        onClick={() => handlePrintQrCard("BrainByte", "Major Technical Event", url, qrData)}
                        className="tech-qr-btn test"
                      >
                        🖨️ Print
                      </button>
                      <Link to="/technical/brainbyte" target="_blank" className="tech-qr-btn test">
                        Open ↗
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Kalakruti Subevents QR Section */}
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 16px 0" }}>
              Kalakruti Competitions (All 12 Dedicated QR Codes)
            </h2>

            <div className="tech-qr-grid">
              {KALAKRUTI_COMPETITIONS_DATA.map((comp) => {
                const url = `${customBaseUrl}/technical/kalakruti/${comp.slug}`;
                const qrKey = `kalakruti-${comp.slug}`;
                const qrData = qrCodeDataUrls[qrKey];

                return (
                  <div key={comp.slug} className="tech-qr-card">
                    <div className="tech-qr-badge" style={{ color: "#fbbf24" }}>
                      Kalakruti Subevent
                    </div>
                    <h3 className="tech-qr-title">{comp.name}</h3>
                    <div className="tech-qr-canvas-wrapper">
                      {qrData ? <img src={qrData} alt={`${comp.name} QR`} /> : <span>Generating...</span>}
                    </div>

                    <div className="tech-qr-url-box">
                      <span className="tech-qr-url-text">{url}</span>
                    </div>

                    <div className="tech-qr-actions">
                      <button onClick={() => handleCopyUrl(comp.slug, url)} className="tech-qr-btn copy">
                        {copiedSlug === comp.slug ? "✓ Copied!" : "📋 Copy"}
                      </button>
                      <button
                        onClick={() => handleDownloadQr(comp.name, qrData)}
                        className="tech-qr-btn download"
                      >
                        ⬇️ PNG
                      </button>
                      <button
                        onClick={() =>
                          handlePrintQrCard(comp.name, "Kalakruti Competition", url, qrData)
                        }
                        className="tech-qr-btn test"
                      >
                        🖨️ Print
                      </button>
                      <Link to={`/technical/kalakruti/${comp.slug}`} target="_blank" className="tech-qr-btn test">
                        Open ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL: VIEW REGISTRATION DETAILS
          ======================================================== */}
      {viewingReg && (
        <div className="tech-modal-overlay" onClick={() => setViewingReg(null)}>
          <div className="tech-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tech-modal-header">
              <h3 className="tech-modal-title">Registration Details</h3>
              <button className="tech-modal-close" onClick={() => setViewingReg(null)}>
                ✕
              </button>
            </div>

            <div className="tech-modal-grid">
              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Registration ID
                </label>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8", fontFamily: "monospace" }}>
                  {viewingReg.registrationId}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>Status</label>
                <div>
                  <span className={`tech-badge ${viewingReg.status?.toLowerCase()}`}>{viewingReg.status}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Student Full Name
                </label>
                <div style={{ fontWeight: 600 }}>{viewingReg.fullName}</div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>Position</label>
                <div>
                  <span className="tech-badge position">{viewingReg.position}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  College / School Name
                </label>
                <div>{viewingReg.collegeName}</div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Department
                </label>
                <div>{viewingReg.department}</div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Year / Standard
                </label>
                <div>{viewingReg.studentYear}</div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Contact Number
                </label>
                <div>📞 {viewingReg.contactNumber}</div>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <div>✉️ {viewingReg.email}</div>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Registered Event & Subevent
                </label>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>
                  {viewingReg.majorEvent?.name} {viewingReg.competition ? `— ${viewingReg.competition.name}` : ""}
                </div>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase" }}>
                  Submission Timestamp
                </label>
                <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                  {new Date(viewingReg.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="tech-modal-actions">
              <button onClick={() => setViewingReg(null)} className="tech-btn-primary" style={{ width: "auto" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT REGISTRATION
          ======================================================== */}
      {editingReg && (
        <div className="tech-modal-overlay" onClick={() => setEditingReg(null)}>
          <div className="tech-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tech-modal-header">
              <h3 className="tech-modal-title">Edit Registration — {editingReg.registrationId}</h3>
              <button className="tech-modal-close" onClick={() => setEditingReg(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRegistration}>
              <div className="tech-modal-grid">
                <div className="tech-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="tech-input"
                    value={editingReg.fullName}
                    onChange={(e) => setEditingReg({ ...editingReg, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="tech-form-group">
                  <label>College / School Name</label>
                  <input
                    type="text"
                    className="tech-input"
                    value={editingReg.collegeName}
                    onChange={(e) => setEditingReg({ ...editingReg, collegeName: e.target.value })}
                    required
                  />
                </div>

                <div className="tech-form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    className="tech-input"
                    value={editingReg.contactNumber}
                    onChange={(e) => setEditingReg({ ...editingReg, contactNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="tech-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="tech-input"
                    value={editingReg.email}
                    onChange={(e) => setEditingReg({ ...editingReg, email: e.target.value })}
                    required
                  />
                </div>

                <div className="tech-form-group">
                  <label>Department</label>
                  <select
                    className="tech-select"
                    value={editingReg.department}
                    onChange={(e) => setEditingReg({ ...editingReg, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tech-form-group">
                  <label>Year / Standard</label>
                  <select
                    className="tech-select"
                    value={editingReg.studentYear}
                    onChange={(e) => setEditingReg({ ...editingReg, studentYear: e.target.value })}
                  >
                    {STUDENT_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tech-form-group">
                  <label>Position</label>
                  <select
                    className="tech-select"
                    value={editingReg.position}
                    onChange={(e) => setEditingReg({ ...editingReg, position: e.target.value })}
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tech-form-group">
                  <label>Status</label>
                  <select
                    className="tech-select"
                    value={editingReg.status}
                    onChange={(e) => setEditingReg({ ...editingReg, status: e.target.value })}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="tech-modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="tech-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tech-btn-primary"
                  style={{ width: "auto" }}
                  disabled={isUpdatingReg}
                >
                  {isUpdatingReg ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM DELETE
          ======================================================== */}
      {deletingReg && (
        <div className="tech-modal-overlay" onClick={() => setDeletingReg(null)}>
          <div className="tech-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div className="tech-modal-header">
              <h3 className="tech-modal-title" style={{ color: "#f87171" }}>
                Confirm Registration Deletion
              </h3>
              <button className="tech-modal-close" onClick={() => setDeletingReg(null)}>
                ✕
              </button>
            </div>

            <p style={{ color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              Are you sure you want to permanently delete registration{" "}
              <strong style={{ color: "#38bdf8" }}>{deletingReg.registrationId}</strong> for student{" "}
              <strong>{deletingReg.fullName}</strong>?
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              This action cannot be undone.
            </p>

            <div className="tech-modal-actions">
              <button onClick={() => setDeletingReg(null)} className="tech-btn-outline">
                Cancel
              </button>
              <button
                onClick={handleDeleteRegistration}
                className="tech-btn-danger-outline"
                style={{ padding: "10px 20px" }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT / RENAME POSITION
          ======================================================== */}
      {editingPosition && (
        <div className="tech-modal-overlay" onClick={() => setEditingPosition(null)}>
          <div className="tech-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="tech-modal-header">
              <h3 className="tech-modal-title">Edit Position Option</h3>
              <button className="tech-modal-close" onClick={() => setEditingPosition(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPosition}>
              <div className="tech-form-group" style={{ marginBottom: "20px" }}>
                <label>Position Label</label>
                <input
                  type="text"
                  className="tech-input"
                  value={editingPosition.name}
                  onChange={(e) => setEditingPosition({ ...editingPosition, name: e.target.value })}
                  required
                />
              </div>

              <div className="tech-modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className="tech-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="tech-btn-primary" style={{ width: "auto" }}>
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
