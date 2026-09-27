import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";
const ADMIN_PASSWORD = "brainwaves2026";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");

  const [sports, setSports] = useState([]);
  const [entries, setEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [pointTable, setPointTable] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // SCORE MODAL
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  // COMPLETE MATCH MODAL
  const [completeMatchData, setCompleteMatchData] = useState(null);
  const [winnerEntryId, setWinnerEntryId] = useState("");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password");
    }
  };

  // =========================
  // FETCH ADMIN DATA
  // =========================

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        sportsResponse,
        entriesResponse,
        matchesResponse,
        liveResponse,
        pointsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/sports`),
        fetch(`${API_URL}/entries`),
        fetch(`${API_URL}/matches`),
        fetch(`${API_URL}/matches/live`),
        fetch(`${API_URL}/point-table`),
      ]);

      const sportsResult = await sportsResponse.json();
      const entriesResult = await entriesResponse.json();
      const matchesResult = await matchesResponse.json();
      const liveResult = await liveResponse.json();
      const pointsResult = await pointsResponse.json();

      if (sportsResult.success) {
        setSports(sportsResult.data || []);
      }

      if (entriesResult.success) {
        setEntries(entriesResult.data || []);
      }

      if (matchesResult.success) {
        setMatches(matchesResult.data || []);
      }

      if (liveResult.success) {
        setLiveMatches(liveResult.data || []);
      }

      if (pointsResult.success) {
        setPointTable(pointsResult.data || []);
      }
    } catch (err) {
      console.error("Admin data error:", err);

      setError(
        "Unable to connect to Sports backend. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  // =========================
  // START MATCH
  // =========================

  const startMatch = async (matchId) => {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/matches/${matchId}/start`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to start match"
        );
      }

      setMessage("Match started successfully.");

      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // UPDATE SCORE
  // =========================

  const updateScore = async () => {
    if (!selectedMatch) return;

    if (scoreA === "" || scoreB === "") {
      setError("Enter both scores.");
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/matches/${selectedMatch.id}/score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scoreA: Number(scoreA),
            scoreB: Number(scoreB),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update score"
        );
      }

      setMessage("Score updated successfully.");

      setSelectedMatch(null);
      setScoreA("");
      setScoreB("");

      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // OPEN COMPLETE MATCH MODAL
  // =========================

  const openCompleteMatch = (match) => {
    setMessage("");
    setError("");

    setCompleteMatchData(match);

    // Automatically select the only possible side if one is missing
    if (!match.entryBId) {
      setWinnerEntryId(String(match.entryAId));
    } else if (!match.entryAId) {
      setWinnerEntryId(String(match.entryBId));
    } else {
      setWinnerEntryId("");
    }
  };

  // =========================
  // COMPLETE MATCH
  // =========================

  const completeMatch = async () => {
    if (!completeMatchData) return;

    if (!winnerEntryId) {
      setError("Please select the winner.");
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/matches/${completeMatchData.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            winnerEntryId: Number(winnerEntryId),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to complete match"
        );
      }

      setMessage("Match completed successfully.");

      setCompleteMatchData(null);
      setWinnerEntryId("");

      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080b14",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#111827",
            padding: "35px",
            border: "1px solid #263044",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              color: "#facc15",
              fontWeight: "800",
              marginBottom: "10px",
            }}
          >
            FAMT ARENA
          </div>

          <h1 style={{ margin: "0 0 8px" }}>
            Sports Admin
          </h1>

          <p
            style={{
              color: "#9ca3af",
              marginBottom: "25px",
            }}
          >
            Administrator access
          </p>

          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              background: "#080b14",
              color: "#fff",
              border: "1px solid #374151",
              marginBottom: "15px",
            }}
          />

          {error && (
            <div
              style={{
                color: "#f87171",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              background: "#e63946",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            LOGIN
          </button>
        </form>
      </div>
    );
  }

  // =========================
  // ADMIN PANEL
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b14",
        color: "#fff",
        padding: "110px 25px 50px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "3px",
                color: "#facc15",
                fontWeight: "800",
              }}
            >
              FAMT ARENA
            </div>

            <h1 style={{ margin: "5px 0" }}>
              SPORTS ADMIN
            </h1>

            <p style={{ color: "#9ca3af" }}>
              Manage registrations, matches, scores and
              results.
            </p>
          </div>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              setActiveTab("dashboard");
            }}
            style={{
              padding: "11px 18px",
              background: "transparent",
              border: "1px solid #374151",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            LOGOUT
          </button>
        </div>

        {/* NAVIGATION */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          {[
            ["dashboard", "📊 Dashboard"],
            ["registrations", "👥 Registrations"],
            ["matches", "🏟️ Matches"],
            ["points", "🏆 Point Table"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setMessage("");
                setError("");
              }}
              style={{
                padding: "11px 16px",
                border: "1px solid #374151",
                background:
                  activeTab === id
                    ? "#e63946"
                    : "#111827",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              {label}
            </button>
          ))}

          <button
            onClick={fetchAdminData}
            style={{
              padding: "11px 16px",
              border: "1px solid #374151",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* LOADING */}

        {loading && (
          <div
            style={{
              padding: "15px",
              background: "#111827",
              marginBottom: "20px",
            }}
          >
            Loading Sports data...
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            style={{
              padding: "14px",
              background: "#12351f",
              border: "1px solid #26733c",
              color: "#86efac",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div
            style={{
              padding: "14px",
              background: "#351519",
              border: "1px solid #7f1d1d",
              color: "#fca5a5",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            DASHBOARD
        ========================= */}

        {activeTab === "dashboard" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
              <StatCard
                icon="🏅"
                value={sports.length}
                label="Sports"
              />

              <StatCard
                icon="👥"
                value={entries.length}
                label="Registrations"
              />

              <StatCard
                icon="🏟️"
                value={matches.length}
                label="Matches"
              />

              <StatCard
                icon="🔴"
                value={liveMatches.length}
                label="Live Matches"
              />
            </div>

            <Section title="Sports">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {sports.map((sport) => (
                  <div
                    key={sport.id}
                    style={{
                      padding: "18px",
                      background: "#111827",
                      border: "1px solid #263044",
                    }}
                  >
                    <strong>{sport.name}</strong>

                    {sport.description && (
                      <p
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                          marginBottom: 0,
                        }}
                      >
                        {sport.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* =========================
            REGISTRATIONS
        ========================= */}

        {activeTab === "registrations" && (
          <Section
            title={`Registrations (${entries.length})`}
          >
            {entries.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>
                No registrations found.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>Entry</th>
                      <th style={thStyle}>Sport</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Department</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Players</th>
                    </tr>
                  </thead>

                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td style={tdStyle}>
                          {entry.name || "-"}
                        </td>

                        <td style={tdStyle}>
                          {entry.category?.sport?.name ||
                            entry.sport?.name ||
                            "-"}
                        </td>

                        <td style={tdStyle}>
                          {entry.category?.name || "-"}
                        </td>

                        <td style={tdStyle}>
                          {entry.department?.name || "-"}
                        </td>

                        <td style={tdStyle}>
                          {entry.entryType || "-"}
                        </td>

                        <td style={tdStyle}>
                          {Array.isArray(entry.players) &&
                          entry.players.length > 0 ? (
                            entry.players.map((p, index) => (
                              <div
                                key={
                                  p.id ||
                                  p.playerId ||
                                  index
                                }
                              >
                                {p.player?.name ||
                                  p.name ||
                                  "-"}
                              </div>
                            ))
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* =========================
            MATCHES
        ========================= */}

        {activeTab === "matches" && (
          <Section
            title={`Matches (${matches.length})`}
          >
            {matches.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>
                No matches found.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                }}
              >
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onStart={startMatch}
                    onScore={setSelectedMatch}
                    onComplete={openCompleteMatch}
                  />
                ))}
              </div>
            )}
          </Section>
        )}

        {/* =========================
            POINT TABLE
        ========================= */}

        {activeTab === "points" && (
          <Section title="Point Table">
            {pointTable.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>
                No point table data found.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Department</th>
                      <th style={thStyle}>Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pointTable.map((row, index) => (
                      <tr key={row.id || index}>
                        <td style={tdStyle}>
                          {index + 1}
                        </td>

                        <td style={tdStyle}>
                          {row.department?.name ||
                            row.departmentName ||
                            row.name ||
                            "-"}
                        </td>

                        <td style={tdStyle}>
                          {row.points ??
                            row.totalPoints ??
                            0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* =========================
            SCORE MODAL
        ========================= */}

        {selectedMatch && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h2>Update Score</h2>

              <p style={{ color: "#9ca3af" }}>
                Match #{selectedMatch.id}
              </p>

              <div
                style={{
                  marginBottom: "20px",
                  color: "#fff",
                }}
              >
                <strong>
                  {getEntryName(
                    selectedMatch.entryA,
                    selectedMatch.entryAId,
                    "Entry A"
                  )}
                </strong>

                {" VS "}

                <strong>
                  {getEntryName(
                    selectedMatch.entryB,
                    selectedMatch.entryBId,
                    "Entry B"
                  )}
                </strong>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  margin: "25px 0",
                }}
              >
                <div>
                  <label>Score A</label>

                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) =>
                      setScoreA(e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label>Score B</label>

                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) =>
                      setScoreB(e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => {
                    setSelectedMatch(null);
                    setScoreA("");
                    setScoreB("");
                  }}
                  style={secondaryButton}
                >
                  Cancel
                </button>

                <button
                  onClick={updateScore}
                  style={primaryButton}
                >
                  UPDATE SCORE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            COMPLETE MATCH MODAL
        ========================= */}

        {completeMatchData && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#facc15",
                  fontWeight: "800",
                  letterSpacing: "1px",
                }}
              >
                MATCH #{completeMatchData.id}
              </div>

              <h2 style={{ marginTop: "8px" }}>
                Complete Match
              </h2>

              <p style={{ color: "#9ca3af" }}>
                Select the winner before recording the result.
              </p>

              <div
                style={{
                  background: "#080b14",
                  border: "1px solid #263044",
                  padding: "18px",
                  margin: "20px 0",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <strong>
                    {getEntryName(
                      completeMatchData.entryA,
                      completeMatchData.entryAId,
                      "Entry A"
                    )}
                  </strong>

                  <span
                    style={{
                      margin: "0 12px",
                      color: "#6b7280",
                    }}
                  >
                    VS
                  </span>

                  <strong>
                    {getEntryName(
                      completeMatchData.entryB,
                      completeMatchData.entryBId,
                      "Entry B"
                    )}
                  </strong>
                </div>

                {(completeMatchData.score ||
                  completeMatchData.scoreA !== undefined ||
                  completeMatchData.scoreB !== undefined) && (
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "14px",
                    }}
                  >
                    Score:{" "}
                    {completeMatchData.score?.scoreA ??
                      completeMatchData.scoreA ??
                      "-"}{" "}
                    -{" "}
                    {completeMatchData.score?.scoreB ??
                      completeMatchData.scoreB ??
                      "-"}
                  </div>
                )}
              </div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                }}
              >
                Winner
              </label>

              <select
                value={winnerEntryId}
                onChange={(e) =>
                  setWinnerEntryId(e.target.value)
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  background: "#080b14",
                  color: "#fff",
                  border: "1px solid #374151",
                  marginBottom: "20px",
                }}
              >
                <option value="">
                  Select winner
                </option>

                {completeMatchData.entryAId && (
                  <option
                    value={completeMatchData.entryAId}
                  >
                    {getEntryName(
                      completeMatchData.entryA,
                      completeMatchData.entryAId,
                      "Entry A"
                    )}
                  </option>
                )}

                {completeMatchData.entryBId && (
                  <option
                    value={completeMatchData.entryBId}
                  >
                    {getEntryName(
                      completeMatchData.entryB,
                      completeMatchData.entryBId,
                      "Entry B"
                    )}
                  </option>
                )}
              </select>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => {
                    setCompleteMatchData(null);
                    setWinnerEntryId("");
                  }}
                  style={secondaryButton}
                >
                  CANCEL
                </button>

                <button
                  onClick={completeMatch}
                  style={primaryButton}
                >
                  COMPLETE MATCH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({ icon, value, label }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #263044",
        padding: "22px",
      }}
    >
      <div style={{ fontSize: "28px" }}>
        {icon}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "900",
          marginTop: "8px",
        }}
      >
        {value}
      </div>

      <div style={{ color: "#9ca3af" }}>
        {label}
      </div>
    </div>
  );
}

// ======================================================
// SECTION
// ======================================================

function Section({ title, children }) {
  return (
    <section
      style={{
        background: "#0f172a",
        border: "1px solid #263044",
        padding: "25px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        {title}
      </h2>

      {children}
    </section>
  );
}

// ======================================================
// MATCH CARD
// ======================================================

function MatchCard({
  match,
  onStart,
  onScore,
  onComplete,
}) {
  const status = match.status || "SCHEDULED";

  const roundName =
    match.round?.name ||
    match.roundName ||
    (match.round?.roundNo
      ? `Round ${match.round.roundNo}`
      : "Match");

  const entryAName = getEntryName(
    match.entryA,
    match.entryAId,
    "Entry A"
  );

  const entryBName = getEntryName(
    match.entryB,
    match.entryBId,
    "Entry B"
  );

  const scoreA =
    match.score?.scoreA ??
    match.scoreA ??
    null;

  const scoreB =
    match.score?.scoreB ??
    match.scoreB ??
    null;

  return (
    <div
      style={{
        padding: "20px",
        background: "#111827",
        border: "1px solid #263044",
      }}
    >
      {/* MATCH HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#facc15",
              fontWeight: "800",
              letterSpacing: "1px",
            }}
          >
            MATCH #{match.id}
          </div>

          <h3
            style={{
              margin: "8px 0",
              fontSize: "20px",
            }}
          >
            {entryAName}
            {"  VS  "}
            {entryBName}
          </h3>

          <div
            style={{
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            {roundName}
          </div>
        </div>

        {/* STATUS */}

        <div>
          <strong
            style={{
              color:
                status === "LIVE"
                  ? "#f87171"
                  : status === "COMPLETED"
                  ? "#86efac"
                  : "#facc15",
            }}
          >
            {status}
          </strong>
        </div>
      </div>

      {/* SCORE */}

      {(scoreA !== null || scoreB !== null) && (
        <div
          style={{
            display: "flex",
            gap: "25px",
            marginTop: "18px",
            padding: "15px",
            background: "#080b14",
            border: "1px solid #263044",
          }}
        >
          <div>
            <div
              style={{
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              {entryAName}
            </div>

            <strong
              style={{
                fontSize: "24px",
              }}
            >
              {scoreA ?? "-"}
            </strong>
          </div>

          <div
            style={{
              color: "#6b7280",
              alignSelf: "center",
              fontWeight: "800",
            }}
          >
            VS
          </div>

          <div>
            <div
              style={{
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              {entryBName}
            </div>

            <strong
              style={{
                fontSize: "24px",
              }}
            >
              {scoreB ?? "-"}
            </strong>
          </div>
        </div>
      )}

      {/* ACTIONS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "18px",
        }}
      >
        {status !== "LIVE" &&
          status !== "COMPLETED" && (
            <button
              onClick={() => onStart(match.id)}
              style={primaryButton}
            >
              START MATCH
            </button>
          )}

        {status === "LIVE" && (
          <>
            <button
              onClick={() => onScore(match)}
              style={primaryButton}
            >
              UPDATE SCORE
            </button>

            <button
              onClick={() => onComplete(match)}
              style={secondaryButton}
            >
              COMPLETE MATCH
            </button>
          </>
        )}

        {status === "COMPLETED" && (
          <span
            style={{
              color: "#86efac",
              fontWeight: "700",
            }}
          >
            ✓ Result recorded
          </span>
        )}
      </div>
    </div>
  );
}

// ======================================================
// ENTRY NAME HELPER
// ======================================================

function getEntryName(entry, entryId, fallback) {
  if (!entry) {
    return entryId
      ? `Entry ${entryId}`
      : fallback;
  }

  return (
    entry.name ||
    entry.department?.name ||
    entry.departmentName ||
    (entryId
      ? `Entry ${entryId}`
      : fallback)
  );
}

// ======================================================
// MODAL STYLES
// ======================================================

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
};

const modalBox = {
  width: "100%",
  maxWidth: "500px",
  background: "#111827",
  padding: "30px",
  border: "1px solid #374151",
};

// ======================================================
// TABLE STYLES
// ======================================================

const thStyle = {
  textAlign: "left",
  padding: "13px",
  borderBottom: "1px solid #374151",
  color: "#9ca3af",
  fontSize: "13px",
};

const tdStyle = {
  padding: "14px 13px",
  borderBottom: "1px solid #1f2937",
  verticalAlign: "top",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginTop: "7px",
  background: "#080b14",
  color: "#fff",
  border: "1px solid #374151",
};

const primaryButton = {
  padding: "11px 16px",
  border: "none",
  background: "#e63946",
  color: "#fff",
  fontWeight: "800",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "11px 16px",
  border: "1px solid #374151",
  background: "transparent",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};