import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import culturalApi from "../services/culturalApi";
import "./CulturalAdmin.css";

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

export default function CulturalAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("registrations"); // "registrations" | "positions" | "dashboard"

  // Login State
  const [username, setUsername] = useState("cultural_admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Data
  const [dashboard, setDashboard] = useState(null);

  // Registrations Data
  const [registrations, setRegistrations] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Committees & Positions Options
  const [committees, setCommittees] = useState([]);
  const [positions, setPositions] = useState([]);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterCommittee, setFilterCommittee] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterPosition, setFilterPosition] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modals State
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [deletingRegistration, setDeletingRegistration] = useState(null);
  const [newPositionName, setNewPositionName] = useState("");
  const [editingPosition, setEditingPosition] = useState(null);

  // 1. Check Authentication on Mount
  useEffect(() => {
    async function checkAuth() {
      const isValid = await culturalApi.verifyAdminSession();
      setIsAuthenticated(isValid);
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  // 2. Fetch Core Data
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    setError("");
    try {
      const [dash, regs, comms, posList] = await Promise.all([
        culturalApi.getDashboard(),
        culturalApi.getRegistrations({
          search,
          committeeId: filterCommittee,
          department: filterDept,
          studentYear: filterYear,
          position: filterPosition,
          status: filterStatus,
        }),
        culturalApi.getCommittees(),
        culturalApi.getAdminPositions(),
      ]);

      setDashboard(dash);
      setRegistrations(regs);
      setCommittees(comms);
      setPositions(posList);
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError(err.message || "Failed to load Cultural Admin records");
    } finally {
      setLoadingData(false);
    }
  }, [
    isAuthenticated,
    search,
    filterCommittee,
    filterDept,
    filterYear,
    filterPosition,
    filterStatus,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      await culturalApi.adminLogin(username.trim(), password);
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err.message || "Invalid administrator credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    culturalApi.adminLogout();
    setIsAuthenticated(false);
    setPassword("");
  };

  // Quick Status Change
  const handleStatusChange = async (regId, newStatus) => {
    try {
      await culturalApi.updateRegistrationStatus(regId, newStatus);
      setMessage(`Registration #${regId} marked as ${newStatus}`);
      setTimeout(() => setMessage(""), 3500);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update status");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Quick Position Change
  const handlePositionChange = async (regId, newPosition) => {
    try {
      await culturalApi.changeStudentPosition(regId, newPosition);
      setMessage(`Registration #${regId} position changed to '${newPosition}'`);
      setTimeout(() => setMessage(""), 3500);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update position");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Handle Edit Registration Save
  const handleSaveEditRegistration = async (e) => {
    e.preventDefault();
    if (!editingRegistration) return;

    try {
      await culturalApi.updateRegistration(editingRegistration.id, {
        fullName: editingRegistration.fullName,
        department: editingRegistration.department,
        studentYear: editingRegistration.studentYear,
        committeeId: editingRegistration.committeeId,
        position: editingRegistration.positionName,
        contactNumber: editingRegistration.contactNumber,
        email: editingRegistration.email,
        status: editingRegistration.status,
        notes: editingRegistration.notes,
      });

      setMessage(`Registration #${editingRegistration.id} updated successfully!`);
      setTimeout(() => setMessage(""), 3500);
      setEditingRegistration(null);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update registration");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Handle Delete Registration
  const handleConfirmDelete = async () => {
    if (!deletingRegistration) return;
    try {
      await culturalApi.deleteRegistration(deletingRegistration.id);
      setMessage(`Registration #${deletingRegistration.id} deleted successfully`);
      setTimeout(() => setMessage(""), 3500);
      setDeletingRegistration(null);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to delete registration");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Manage Positions: Add
  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!newPositionName.trim()) return;

    try {
      await culturalApi.addPosition(newPositionName.trim(), true);
      setNewPositionName("");
      setMessage(`New position '${newPositionName.trim()}' added!`);
      setTimeout(() => setMessage(""), 3500);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to add position");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Manage Positions: Toggle Active
  const handleTogglePositionActive = async (pos) => {
    try {
      await culturalApi.updatePosition(pos.id, { isActive: !pos.isActive });
      setMessage(`Position '${pos.name}' active status toggled`);
      setTimeout(() => setMessage(""), 3500);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to toggle status");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Manage Positions: Edit Name
  const handleSaveEditPosition = async (e) => {
    e.preventDefault();
    if (!editingPosition || !editingPosition.name.trim()) return;

    try {
      await culturalApi.updatePosition(editingPosition.id, {
        name: editingPosition.name.trim(),
        isActive: editingPosition.isActive,
      });
      setMessage(`Position updated successfully!`);
      setTimeout(() => setMessage(""), 3500);
      setEditingPosition(null);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to edit position");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Manage Positions: Delete / Deactivate
  const handleDeletePosition = async (pos) => {
    const confirmMsg =
      pos.registrationCount > 0
        ? `Position '${pos.name}' is currently used by ${pos.registrationCount} registration(s). It will be safely deactivated to preserve existing records. Continue?`
        : `Are you sure you want to delete position '${pos.name}'?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await culturalApi.deletePosition(pos.id);
      setMessage(res.message);
      setTimeout(() => setMessage(""), 4000);
      loadAllData();
    } catch (err) {
      setError(err.message || "Failed to remove position");
      setTimeout(() => setError(""), 4000);
    }
  };

  // CSV Export
  const handleExport = async () => {
    try {
      await culturalApi.downloadExportCsv({
        search,
        committeeId: filterCommittee,
        department: filterDept,
        studentYear: filterYear,
        position: filterPosition,
        status: filterStatus,
      });
    } catch (err) {
      setError(err.message || "Failed to export CSV");
      setTimeout(() => setError(""), 4000);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setFilterCommittee("ALL");
    setFilterDept("ALL");
    setFilterYear("ALL");
    setFilterPosition("ALL");
    setFilterStatus("ALL");
  };

  if (checkingAuth) {
    return (
      <div className="cultural-login-screen">
        <div style={{ color: "#ffd700", textAlign: "center" }}>
          <h2>Authenticating Cultural Portal...</h2>
        </div>
      </div>
    );
  }

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="cultural-login-screen">
        <div className="cultural-login-card">
          <span className="cultural-login-badge">UTOPIA SECURE ACCESS</span>
          <h2 className="cultural-login-title">Cultural Admin</h2>
          <p className="cultural-login-subtitle">
            Sign in to manage student cultural committee registrations
          </p>

          {loginError && (
            <div className="cultural-alert error">
              <span>⚠️</span>
              <div>{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="cultural-login-group">
              <label htmlFor="username">Admin Username</label>
              <input
                id="username"
                type="text"
                className="cultural-login-input"
                placeholder="cultural_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="cultural-login-group">
              <label htmlFor="password">Admin Password</label>
              <input
                id="password"
                type="password"
                className="cultural-login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="cultural-login-btn"
              disabled={loginLoading}
            >
              {loginLoading ? "Authenticating..." : "Sign In to Cultural Admin"}
            </button>
          </form>

          <div style={{ marginTop: "24px" }}>
            <Link
              to="/cultural"
              style={{ color: "#94a3b8", fontSize: "0.8rem", textDecoration: "none" }}
            >
              ← Back to Cultural Landing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LOGGED-IN ADMIN PANEL
  // ============================================================
  return (
    <div className="cultural-admin-root">
      {/* Top Header */}
      <header className="cultural-admin-header">
        <div className="cultural-admin-brand">
          <div className="cultural-brand-text">
            <h1>FAMT ARENA — CULTURAL ADMIN</h1>
            <span>UTOPIA FESTIVAL MANAGEMENT PORTAL</span>
          </div>
        </div>

        <div className="cultural-admin-nav-actions">
          <button
            type="button"
            className={`cultural-nav-pill ${activeTab === "registrations" ? "active" : ""}`}
            onClick={() => setActiveTab("registrations")}
          >
            Registrations ({dashboard?.totalRegistrations ?? 0})
          </button>
          <button
            type="button"
            className={`cultural-nav-pill ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Analytics & Counts
          </button>
          <button
            type="button"
            className={`cultural-nav-pill ${activeTab === "positions" ? "active" : ""}`}
            onClick={() => setActiveTab("positions")}
          >
            Manage Positions
          </button>

          <Link
            to="/cultural"
            target="_blank"
            className="cultural-nav-pill"
            style={{ color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}
          >
            View Student Site ↗
          </Link>

          <button
            type="button"
            className="cultural-logout-btn"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="cultural-admin-main">
        {/* Alerts */}
        {message && (
          <div className="cultural-alert success">
            <span>✓</span>
            <div>{message}</div>
          </div>
        )}
        {error && (
          <div className="cultural-alert error">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* ===================================================
            SECTION A: DASHBOARD SUMMARY CARDS (Always visible at top)
            =================================================== */}
        <section className="cultural-stats-grid">
          <div className="cultural-stat-card gold">
            <div className="label">Total Registrations</div>
            <div className="number">{dashboard?.totalRegistrations ?? 0}</div>
          </div>
          <div className="cultural-stat-card">
            <div className="label">Total Committees</div>
            <div className="number">{dashboard?.totalCommittees ?? 19}</div>
          </div>
          <div className="cultural-stat-card pending">
            <div className="label">Pending Review</div>
            <div className="number">{dashboard?.pendingCount ?? 0}</div>
          </div>
          <div className="cultural-stat-card approved">
            <div className="label">Approved</div>
            <div className="number">{dashboard?.approvedCount ?? 0}</div>
          </div>
          <div className="cultural-stat-card rejected">
            <div className="label">Rejected</div>
            <div className="number">{dashboard?.rejectedCount ?? 0}</div>
          </div>
        </section>

        {/* ===================================================
            TAB 1: ANALYTICS & BREAKDOWNS VIEW
            =================================================== */}
        {activeTab === "dashboard" && dashboard && (
          <section className="cultural-breakdown-grid">
            {/* By Committee */}
            <div className="cultural-breakdown-card">
              <h3>Registrations by Committee</h3>
              <div className="cultural-breakdown-list">
                {dashboard.byCommittee.map((c) => (
                  <div key={c.id || c.name} className="cultural-breakdown-item">
                    <span>{c.name}</span>
                    <strong>{c.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* By Department */}
            <div className="cultural-breakdown-card">
              <h3>Registrations by Department</h3>
              <div className="cultural-breakdown-list">
                {dashboard.byDepartment.map((d) => (
                  <div key={d.department} className="cultural-breakdown-item">
                    <span>{d.department}</span>
                    <strong>{d.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* By Position */}
            <div className="cultural-breakdown-card">
              <h3>Registrations by Position</h3>
              <div className="cultural-breakdown-list">
                {dashboard.byPosition.map((p) => (
                  <div key={p.position} className="cultural-breakdown-item">
                    <span>{p.position}</span>
                    <strong>{p.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================
            TAB 2: REGISTRATIONS MANAGEMENT
            =================================================== */}
        {activeTab === "registrations" && (
          <section>
            {/* Search and Filters Control Bar */}
            <div className="cultural-controls-bar">
              <div className="cultural-search-row">
                <input
                  type="text"
                  className="cultural-search-input"
                  placeholder="Search by student name, email, or contact number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="cultural-actions-cluster">
                  <button
                    type="button"
                    className="cultural-btn-export"
                    onClick={handleExport}
                    title="Export filtered registrations to CSV"
                  >
                    <span>📥</span> Export CSV
                  </button>
                  <button
                    type="button"
                    className="cultural-btn-reset"
                    onClick={loadAllData}
                    title="Reload data from database"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className="cultural-filters-row">
                {/* Committee Filter */}
                <select
                  className="cultural-filter-select"
                  value={filterCommittee}
                  onChange={(e) => setFilterCommittee(e.target.value)}
                >
                  <option value="ALL">All Committees</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Department Filter */}
                <select
                  className="cultural-filter-select"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {/* Year Filter */}
                <select
                  className="cultural-filter-select"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="ALL">All Years</option>
                  {STUDENT_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                {/* Position Filter */}
                <select
                  className="cultural-filter-select"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                >
                  <option value="ALL">All Positions</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.name}>
                      {pos.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  className="cultural-filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                {/* Clear Filter Button */}
                <button
                  type="button"
                  className="cultural-btn-reset"
                  onClick={handleResetFilters}
                >
                  ✕ Clear Filters
                </button>
              </div>
            </div>

            {/* Registrations Table */}
            <div className="cultural-table-card">
              <div className="cultural-table-wrapper">
                <table className="cultural-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Committee</th>
                      <th>Position</th>
                      <th>Contact Number</th>
                      <th>Email Address</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingData ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: "center", padding: "40px" }}>
                          Loading records from Cultural database...
                        </td>
                      </tr>
                    ) : registrations.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                          No registrations found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <tr key={reg.id}>
                          <td>
                            <strong>#{reg.id}</strong>
                          </td>
                          <td>
                            <strong style={{ color: "#ffffff" }}>{reg.fullName}</strong>
                          </td>
                          <td>{reg.department}</td>
                          <td>{reg.studentYear}</td>
                          <td>
                            <span style={{ color: "#ffd700", fontWeight: 600 }}>
                              {reg.committee?.name || reg.committeeId}
                            </span>
                          </td>
                          <td>
                            {/* In-table Dynamic Position Selector */}
                            <select
                              value={reg.positionName}
                              onChange={(e) => handlePositionChange(reg.id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                background: "rgba(5, 18, 32, 0.9)",
                                border: "1px solid rgba(255, 215, 0, 0.3)",
                                color: "#ffd700",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                outline: "none",
                              }}
                              title="Change student's position"
                            >
                              {positions.map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                              {/* Keep historical position if not in list */}
                              {!positions.some((p) => p.name === reg.positionName) && (
                                <option value={reg.positionName}>{reg.positionName}</option>
                              )}
                            </select>
                          </td>
                          <td>{reg.contactNumber}</td>
                          <td>{reg.email}</td>
                          <td>
                            <span
                              className={`cultural-status-badge ${reg.status.toLowerCase()}`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {new Date(reg.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td>
                            <div className="cultural-row-actions">
                              {reg.status !== "APPROVED" && (
                                <button
                                  type="button"
                                  className="cultural-action-btn approve"
                                  onClick={() => handleStatusChange(reg.id, "APPROVED")}
                                  title="Approve registration"
                                >
                                  ✓
                                </button>
                              )}
                              {reg.status !== "REJECTED" && (
                                <button
                                  type="button"
                                  className="cultural-action-btn reject"
                                  onClick={() => handleStatusChange(reg.id, "REJECTED")}
                                  title="Reject registration"
                                >
                                  ✕
                                </button>
                              )}
                              <button
                                type="button"
                                className="cultural-action-btn edit"
                                onClick={() => setEditingRegistration({ ...reg })}
                                title="Edit registration details"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="cultural-action-btn delete"
                                onClick={() => setDeletingRegistration(reg)}
                                title="Delete registration"
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================
            TAB 3: MANAGE POSITION OPTIONS
            =================================================== */}
        {activeTab === "positions" && (
          <section className="cultural-positions-grid">
            {/* Add Position Form */}
            <div className="cultural-table-card" style={{ padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#ffd700", fontSize: "1.1rem" }}>
                Add New Position
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px" }}>
                Positions added here will automatically appear in the student registration dropdown.
              </p>

              <form onSubmit={handleAddPosition}>
                <div className="cultural-login-group">
                  <label htmlFor="newPosName">Position Name</label>
                  <input
                    id="newPosName"
                    type="text"
                    className="cultural-login-input"
                    placeholder="e.g. Stage Manager, Anchor"
                    value={newPositionName}
                    onChange={(e) => setNewPositionName(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="cultural-login-btn">
                  + Add Position
                </button>
              </form>
            </div>

            {/* Existing Positions List */}
            <div className="cultural-table-card">
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <h3 style={{ margin: 0, color: "#ffffff" }}>Configured Positions</h3>
              </div>
              <div className="cultural-table-wrapper">
                <table className="cultural-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Position Name</th>
                      <th>Status</th>
                      <th>Registrations Using</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => (
                      <tr key={pos.id}>
                        <td>#{pos.id}</td>
                        <td>
                          <strong style={{ color: "#ffd700" }}>{pos.name}</strong>
                        </td>
                        <td>
                          <span
                            className={`cultural-status-badge ${
                              pos.isActive ? "approved" : "rejected"
                            }`}
                          >
                            {pos.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td>{pos.registrationCount ?? 0} students</td>
                        <td>
                          <div className="cultural-row-actions">
                            <button
                              type="button"
                              className="cultural-action-btn edit"
                              onClick={() => setEditingPosition({ ...pos })}
                            >
                              Edit Label
                            </button>
                            <button
                              type="button"
                              className="cultural-action-btn"
                              style={{
                                background: pos.isActive
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : "rgba(16, 185, 129, 0.2)",
                                color: pos.isActive ? "#f59e0b" : "#10b981",
                                border: "1px solid currentColor",
                              }}
                              onClick={() => handleTogglePositionActive(pos)}
                            >
                              {pos.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              type="button"
                              className="cultural-action-btn delete"
                              onClick={() => handleDeletePosition(pos)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===================================================
          EDIT REGISTRATION MODAL
          =================================================== */}
      {editingRegistration && (
        <div className="cultural-modal-backdrop">
          <div className="cultural-modal-card">
            <div className="cultural-modal-header">
              <h2>Edit Registration #{editingRegistration.id}</h2>
              <button
                type="button"
                className="cultural-modal-close"
                onClick={() => setEditingRegistration(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRegistration}>
              <div className="cultural-form-grid">
                {/* Full Name */}
                <div className="cultural-form-group full-width">
                  <label className="cultural-form-label" htmlFor="edit-name">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="cultural-form-input"
                    value={editingRegistration.fullName}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Department */}
                <div className="cultural-form-group">
                  <label className="cultural-form-label" htmlFor="edit-dept">Department</label>
                  <select
                    id="edit-dept"
                    className="cultural-form-select"
                    value={editingRegistration.department}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        department: e.target.value,
                      })
                    }
                    required
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="cultural-form-group">
                  <label className="cultural-form-label" htmlFor="edit-year">Year of Study</label>
                  <select
                    id="edit-year"
                    className="cultural-form-select"
                    value={editingRegistration.studentYear}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        studentYear: e.target.value,
                      })
                    }
                    required
                  >
                    {STUDENT_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Committee */}
                <div className="cultural-form-group">
                  <label className="cultural-form-label" htmlFor="edit-comm">Committee</label>
                  <select
                    id="edit-comm"
                    className="cultural-form-select"
                    value={editingRegistration.committeeId}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        committeeId: e.target.value,
                      })
                    }
                    required
                  >
                    {committees.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div className="cultural-form-group">
                  <label className="cultural-form-label" htmlFor="edit-pos">Position</label>
                  <select
                    id="edit-pos"
                    className="cultural-form-select"
                    value={editingRegistration.positionName}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        positionName: e.target.value,
                      })
                    }
                    required
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Number */}
                <div className="cultural-form-group">
                  <label className="cultural-form-label" htmlFor="edit-contact">Contact Number</label>
                  <input
                    id="edit-contact"
                    type="tel"
                    className="cultural-form-input"
                    value={editingRegistration.contactNumber}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        contactNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="cultural-form-group">
                  <label className="cultural-form-label" htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="cultural-form-input"
                    value={editingRegistration.email}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Status */}
                <div className="cultural-form-group full-width">
                  <label className="cultural-form-label" htmlFor="edit-status">Registration Status</label>
                  <select
                    id="edit-status"
                    className="cultural-form-select"
                    value={editingRegistration.status}
                    onChange={(e) =>
                      setEditingRegistration({
                        ...editingRegistration,
                        status: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="cultural-modal-footer">
                <button
                  type="button"
                  className="cultural-btn-secondary"
                  onClick={() => setEditingRegistration(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="cultural-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          EDIT POSITION MODAL
          =================================================== */}
      {editingPosition && (
        <div className="cultural-modal-backdrop">
          <div className="cultural-modal-card" style={{ maxWidth: "450px" }}>
            <div className="cultural-modal-header">
              <h2>Edit Position</h2>
              <button
                type="button"
                className="cultural-modal-close"
                onClick={() => setEditingPosition(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPosition}>
              <div className="cultural-login-group">
                <label htmlFor="edit-pos-label">Position Label</label>
                <input
                  id="edit-pos-label"
                  type="text"
                  className="cultural-login-input"
                  value={editingPosition.name}
                  onChange={(e) =>
                    setEditingPosition({ ...editingPosition, name: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ margin: "16px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editingPosition.isActive}
                    onChange={(e) =>
                      setEditingPosition({
                        ...editingPosition,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <span>Active (available for students)</span>
                </label>
              </div>

              <div className="cultural-modal-footer">
                <button
                  type="button"
                  className="cultural-btn-secondary"
                  onClick={() => setEditingPosition(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="cultural-btn-primary">
                  Save Label
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION MODAL
          =================================================== */}
      {deletingRegistration && (
        <div className="cultural-modal-backdrop">
          <div className="cultural-modal-card" style={{ maxWidth: "480px" }}>
            <div className="cultural-modal-header">
              <h2 style={{ color: "#ef4444" }}>Confirm Deletion</h2>
              <button
                type="button"
                className="cultural-modal-close"
                onClick={() => setDeletingRegistration(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
              Are you sure you want to permanently delete registration{" "}
              <strong>#{deletingRegistration.id}</strong> for student{" "}
              <strong>{deletingRegistration.fullName}</strong> in{" "}
              <strong>
                {deletingRegistration.committee?.name ||
                  deletingRegistration.committeeId}
              </strong>
              ?
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              This action only removes this cultural record from the database and cannot be undone.
            </p>

            <div className="cultural-modal-footer">
              <button
                type="button"
                className="cultural-btn-secondary"
                onClick={() => setDeletingRegistration(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cultural-action-btn delete"
                style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
