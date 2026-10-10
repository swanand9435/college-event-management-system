const TECHNICAL_API_BASE =
  import.meta.env.VITE_TECHNICAL_API_URL || "http://localhost:5002/api/technical";

class TechnicalApiService {
  getAuthToken() {
    return localStorage.getItem("technical_admin_token");
  }

  setAuthToken(token) {
    if (token) {
      localStorage.setItem("technical_admin_token", token);
    } else {
      localStorage.removeItem("technical_admin_token");
    }
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  async getEvents() {
    const res = await fetch(`${TECHNICAL_API_BASE}/events`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load technical events");
    return data.data;
  }

  async getEvent(id) {
    const res = await fetch(`${TECHNICAL_API_BASE}/events/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load event details");
    return data.data;
  }

  async getCompetition(id) {
    const res = await fetch(`${TECHNICAL_API_BASE}/competitions/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load competition details");
    return data.data;
  }

  async getPositions() {
    const res = await fetch(`${TECHNICAL_API_BASE}/positions`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load positions");
    return data.data;
  }

  async getOptions() {
    const res = await fetch(`${TECHNICAL_API_BASE}/options`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load options");
    return data.data;
  }

  async registerStudent(formData) {
    const res = await fetch(`${TECHNICAL_API_BASE}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
  }

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  async adminLogin(username, password) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid administrator credentials");
    if (data.token) {
      this.setAuthToken(data.token);
    }
    return data;
  }

  async verifyAdminSession() {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const res = await fetch(`${TECHNICAL_API_BASE}/admin/verify`, {
        headers: this.getAuthHeaders(),
      });
      const data = await res.json();
      return res.ok && data.success;
    } catch {
      return false;
    }
  }

  adminLogout() {
    this.setAuthToken(null);
  }

  // ==========================================
  // ADMIN DASHBOARD & REGISTRATIONS
  // ==========================================

  async getDashboard() {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load dashboard data");
    return data.data;
  }

  async getRegistrations(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
        params.append(key, val);
      }
    });

    const res = await fetch(
      `${TECHNICAL_API_BASE}/admin/registrations?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load registrations");
    return data.data;
  }

  async getRegistration(id) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/registrations/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load registration");
    return data.data;
  }

  async updateRegistration(id, updateData) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/registrations/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update registration");
    return data.data;
  }

  async changePosition(id, position) {
    const res = await fetch(
      `${TECHNICAL_API_BASE}/admin/registrations/${id}/position`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ position }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update student position");
    return data.data;
  }

  async updateStatus(id, status) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/registrations/${id}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update registration status");
    return data.data;
  }

  async deleteRegistration(id) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/registrations/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete registration");
    return data;
  }

  // ==========================================
  // POSITION MANAGEMENT
  // ==========================================

  async getPositionsAdmin() {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/positions`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load positions");
    return data.data;
  }

  async addPosition(name, isActive = true) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/positions`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, isActive }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add position");
    return data.data;
  }

  async updatePosition(id, updateData) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/positions/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update position");
    return data.data;
  }

  async deletePosition(id) {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/positions/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete position");
    return data;
  }

  // ==========================================
  // EVENT & COMPETITION MANAGEMENT
  // ==========================================

  async getAdminEvents() {
    const res = await fetch(`${TECHNICAL_API_BASE}/admin/events`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load admin events");
    return data.data;
  }

  async toggleEventRegistration(eventId) {
    const res = await fetch(
      `${TECHNICAL_API_BASE}/admin/events/${eventId}/toggle-registration`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to toggle event registration");
    return data;
  }

  async toggleCompetitionRegistration(competitionId) {
    const res = await fetch(
      `${TECHNICAL_API_BASE}/admin/competitions/${competitionId}/toggle-registration`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to toggle competition registration");
    return data;
  }

  // ==========================================
  // EXPORT CSV
  // ==========================================

  async downloadExportCsv(filters = {}) {
    const token = this.getAuthToken();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
        params.append(key, val);
      }
    });

    const res = await fetch(
      `${TECHNICAL_API_BASE}/admin/export?${params.toString()}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!res.ok) throw new Error("Failed to export technical registrations");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technical_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const technicalApi = new TechnicalApiService();
export default technicalApi;
