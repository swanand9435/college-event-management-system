import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./SportsLanding.css";

const API_URL = "http://localhost:5000/api";

function SportsLanding() {
  const navigate = useNavigate();

  // =====================================================
  // USER LOGIN
  // =====================================================

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("famtUser");

    if (!savedUser) {
      navigate("/user");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser?.name || !parsedUser?.studentId) {
        localStorage.removeItem("famtUser");
        navigate("/user");
        return;
      }

      setCurrentUser(parsedUser);
    } catch (error) {
      console.error("Invalid user login data");

      localStorage.removeItem("famtUser");
      navigate("/user");
    }
  }, [navigate]);

  // =====================================================
  // SPORTS FILTER
  // =====================================================

  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedMatch, setSelectedMatch] = useState(null);

  // =====================================================
  // REGISTRATION
  // =====================================================

  const [registrationSport, setRegistrationSport] = useState(null);
  const [registrationCategories, setRegistrationCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const [registrationForm, setRegistrationForm] = useState({
    departmentId: "",
    name: "",
    year: "",
    mobile: "",
    email: "",
  });

  // =====================================================
  // BACKEND DATA
  // =====================================================

  const [backendSports, setBackendSports] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [drawData, setDrawData] = useState(null);
  const [pointTable, setPointTable] = useState([]);

  const [sportsLoading, setSportsLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [drawLoading, setDrawLoading] = useState(true);
  const [pointTableLoading, setPointTableLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pointTableError, setPointTableError] = useState(false);

  // =====================================================
  // FETCH SPORTS
  // =====================================================

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(`${API_URL}/sports`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setBackendSports(result.data);
        } else {
          setBackendSports([]);
        }
      } catch (error) {
        console.error("Failed to fetch sports:", error);
        setBackendSports([]);
      } finally {
        setSportsLoading(false);
      }
    };

    fetchSports();
  }, []);

  // =====================================================
  // FETCH DEPARTMENTS
  // =====================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_URL}/departments`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setDepartments(result.data);
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  // =====================================================
  // FETCH ALL MATCH DATA
  // =====================================================

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);

      const [liveResponse, upcomingResponse, allResponse] =
        await Promise.all([
          fetch(`${API_URL}/matches/live`),
          fetch(`${API_URL}/matches/upcoming`),
          fetch(`${API_URL}/matches`),
        ]);

      const liveResult = await liveResponse.json();
      const upcomingResult = await upcomingResponse.json();
      const allResult = await allResponse.json();

      // LIVE
      if (
        liveResult.success &&
        Array.isArray(liveResult.data)
      ) {
        setLiveMatches(liveResult.data);
      } else {
        setLiveMatches([]);
      }

      // UPCOMING
      if (
        upcomingResult.success &&
        Array.isArray(upcomingResult.data)
      ) {
        setUpcomingMatches(upcomingResult.data);
      } else {
        setUpcomingMatches([]);
      }

      // COMPLETED
      if (
        allResult.success &&
        Array.isArray(allResult.data)
      ) {
        const results = allResult.data.filter(
          (match) =>
            match.status === "COMPLETED" ||
            match.status === "completed"
        );

        setCompletedMatches(results);
      } else {
        setCompletedMatches([]);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);

      setLiveMatches([]);
      setUpcomingMatches([]);
      setCompletedMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // =====================================================
  // FETCH POINT TABLE
  // =====================================================

  const fetchPointTable = async () => {
    try {
      setPointTableLoading(true);
      setPointTableError(false);

      const response = await fetch(`${API_URL}/point-table`);
      const result = await response.json();

      if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setPointTable(result.data);
      } else {
        setPointTable([]);
      }
    } catch (error) {
      console.error("Failed to fetch point table:", error);

      setPointTable([]);
      setPointTableError(true);
    } finally {
      setPointTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPointTable();
  }, []);

  // =====================================================
  // FETCH DRAW
  // =====================================================

  useEffect(() => {
    const fetchDraw = async () => {
      try {
        const response = await fetch(`${API_URL}/draws/1`);
        const result = await response.json();

        if (result.success) {
          setDrawData(result.data);
        } else {
          setDrawData(null);
        }
      } catch (error) {
        console.error("Failed to fetch draw:", error);
        setDrawData(null);
      } finally {
        setDrawLoading(false);
      }
    };

    fetchDraw();
  }, []);

  // =====================================================
  // REFRESH BACKEND DATA
  // =====================================================

  const refreshBackendData = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        fetchMatches(),
        fetchPointTable(),
      ]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("famtUser");
    navigate("/user");
  };

  // =====================================================
  // REGISTRATION - OPEN
  // =====================================================

  const openRegistration = async (sport) => {
    setRegistrationSport(sport);
    setSelectedCategory(null);
    setRegistrationCategories([]);
    setRegistrationMessage("");
    setRegistrationError("");

    try {
      const response = await fetch(
        `${API_URL}/sports/${sport.id}/categories`
      );

      const result = await response.json();

      if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setRegistrationCategories(result.data);

        if (result.data.length === 0) {
          setRegistrationError(
            "No categories available for this sport."
          );
        }
      } else {
        setRegistrationCategories([]);

        setRegistrationError(
          "No categories available for this sport."
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error
      );

      setRegistrationCategories([]);

      setRegistrationError(
        "Failed to load sport categories."
      );
    }
  };

  // =====================================================
  // REGISTRATION - CLOSE
  // =====================================================

  const closeRegistration = () => {
    setRegistrationSport(null);
    setSelectedCategory(null);
    setRegistrationCategories([]);
    setRegistrationMessage("");
    setRegistrationError("");

    setRegistrationForm({
      departmentId: "",
      name: "",
      year: "",
      mobile: "",
      email: "",
    });
  };

  // =====================================================
  // REGISTRATION - SUBMIT
  // =====================================================

  const submitRegistration = async (event) => {
    event.preventDefault();

    setRegistrationMessage("");
    setRegistrationError("");

    if (!selectedCategory) {
      setRegistrationError("Please select a category.");
      return;
    }

    if (!registrationForm.departmentId) {
      setRegistrationError(
        "Please select your department."
      );
      return;
    }

    if (!registrationForm.name.trim()) {
      setRegistrationError("Please enter your name.");
      return;
    }

    if (!registrationForm.year.trim()) {
      setRegistrationError(
        "Please enter your year of study."
      );
      return;
    }

    if (!registrationForm.mobile.trim()) {
      setRegistrationError(
        "Please enter your mobile number."
      );
      return;
    }

    if (!registrationForm.email.trim()) {
      setRegistrationError(
        "Please enter your email."
      );
      return;
    }

    const entryType = selectedCategory.entryType;

    setRegistrationLoading(true);

    try {
      const body = {
        categoryId: selectedCategory.id,

        departmentId: Number(
          registrationForm.departmentId
        ),

        name: registrationForm.name.trim(),

        entryType,

        players: [
          {
            name: registrationForm.name.trim(),
            year: registrationForm.year.trim(),
            mobile: registrationForm.mobile.trim(),
            email: registrationForm.email.trim(),

            departmentId: Number(
              registrationForm.departmentId
            ),
          },
        ],
      };

      const response = await fetch(
        `${API_URL}/entries`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setRegistrationError(
          result.message ||
            "Registration failed."
        );

        return;
      }

      setRegistrationMessage(
        "Registration successful! Your entry has been recorded."
      );

      setRegistrationForm({
        departmentId: "",
        name: "",
        year: "",
        mobile: "",
        email: "",
      });
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      setRegistrationError(
        "Unable to connect to the registration server."
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  // =====================================================
  // FILTER SPORTS
  // =====================================================

  const filteredSports = backendSports.filter(
    (sport) => {
      if (selectedSport === "All") {
        return true;
      }

      if (
        selectedSport === "Team Sport" ||
        selectedSport === "Team Event"
      ) {
        return sport.type === "TEAM";
      }

      if (
        selectedSport === "Individual Events" ||
        selectedSport === "Individual Event"
      ) {
        return sport.type === "INDIVIDUAL";
      }

      if (
        selectedSport === "Doubles / Mixed"
      ) {
        return (
          sport.name === "Badminton" ||
          sport.name === "Table Tennis" ||
          sport.name === "Carrom"
        );
      }

      return true;
    }
  );

  // =====================================================
  // HELPERS
  // =====================================================

  const getSportIcon = (match) => {
    if (match?.sport?.icon) {
      return match.sport.icon;
    }

    if (match?.icon) {
      return match.icon;
    }

    if (match?.sportIcon) {
      return match.sportIcon;
    }

    return "🏆";
  };

  const getSportName = (match) => {
    if (match?.sport?.name) {
      return match.sport.name;
    }

    if (match?.sportName) {
      return match.sportName;
    }

    if (typeof match?.sport === "string") {
      return match.sport;
    }

    return "Sports";
  };

  // IMPORTANT:
  // Prisma returns round as an object:
  // { id, drawId, roundNo, name, createdAt }
  // Never render match.round directly.

  const getRoundName = (match) => {
    if (!match) {
      return "";
    }

    if (typeof match.stage === "string") {
      return match.stage;
    }

    if (typeof match.roundName === "string") {
      return match.roundName;
    }

    if (
      match.round &&
      typeof match.round === "object" &&
      typeof match.round.name === "string"
    ) {
      return match.round.name;
    }

    if (typeof match.round === "string") {
      return match.round;
    }

    if (
      match.roundData &&
      typeof match.roundData.name === "string"
    ) {
      return match.roundData.name;
    }

    return "";
  };

  const getEntryName = (entry) => {
    if (!entry) {
      return "TBD";
    }

    if (typeof entry === "string") {
      return entry;
    }

    if (entry.name) {
      return entry.name;
    }

    if (entry.player?.name) {
      return entry.player.name;
    }

    if (entry.team?.name) {
      return entry.team.name;
    }

    if (entry.department?.name) {
      return entry.department.name;
    }

    if (entry.playerName) {
      return entry.playerName;
    }

    if (entry.teamName) {
      return entry.teamName;
    }

    if (entry.departmentName) {
      return entry.departmentName;
    }

    return entry.id
      ? `Entry ${entry.id}`
      : "TBD";
  };

  const getDepartmentName = (entry) => {
    if (!entry) {
      return "";
    }

    if (entry.department?.name) {
      return entry.department.name;
    }

    if (entry.departmentName) {
      return entry.departmentName;
    }

    if (entry.player?.department?.name) {
      return entry.player.department.name;
    }

    if (entry.team?.department?.name) {
      return entry.team.department.name;
    }

    return "";
  };

  const getMatchTeamA = (match) => {
    if (!match) {
      return "TBD";
    }

    if (match.entryA) {
      return getEntryName(match.entryA);
    }

    return (
      match.teamA ||
      match.entryAName ||
      "TBD"
    );
  };

  const getMatchTeamB = (match) => {
    if (!match) {
      return "TBD";
    }

    if (match.entryB) {
      return getEntryName(match.entryB);
    }

    return (
      match.teamB ||
      match.entryBName ||
      "TBD"
    );
  };

  // =====================================================
  // EXTRACT DRAW MATCHES
  // =====================================================

  const getDrawMatches = () => {
    if (!drawData) {
      return [];
    }

    let rounds = [];

    if (Array.isArray(drawData.rounds)) {
      rounds = drawData.rounds;
    } else if (
      Array.isArray(drawData.drawRounds)
    ) {
      rounds = drawData.drawRounds;
    } else if (
      Array.isArray(drawData.data?.rounds)
    ) {
      rounds = drawData.data.rounds;
    }

    const matches = [];

    rounds.forEach(
      (round, roundIndex) => {
        const roundMatches =
          round.matches ||
          round.drawMatches ||
          round.matchList ||
          [];

        if (!Array.isArray(roundMatches)) {
          return;
        }

        roundMatches.forEach(
          (match, matchIndex) => {
            const entryA =
              match.entryA ||
              (match.entryAId &&
                drawData.slots?.find(
                  (slot) =>
                    slot.entryId ===
                    match.entryAId
                )?.entry) ||
              null;

            const entryB =
              match.entryB ||
              (match.entryBId &&
                drawData.slots?.find(
                  (slot) =>
                    slot.entryId ===
                    match.entryBId
                )?.entry) ||
              null;

            matches.push({
              ...match,

              roundName:
                round.name ||
                round.roundName ||
                `Round ${roundIndex + 1}`,

              matchNumber:
                match.matchNumber ||
                match.matchNo ||
                match.id ||
                matchIndex + 1,

              entryAResolved: entryA,
              entryBResolved: entryB,
            });
          }
        );
      }
    );

    return matches;
  };

  const drawMatches = getDrawMatches();

  // =====================================================
  // DRAW HELPERS
  // =====================================================

  const getMatchEntryA = (match) => {
    return (
      match.entryAResolved ||
      match.entryA ||
      match.entryAData ||
      null
    );
  };

  const getMatchEntryB = (match) => {
    return (
      match.entryBResolved ||
      match.entryB ||
      match.entryBData ||
      null
    );
  };

  const getScore = (match, side) => {
    if (side === "A") {
      return (
        match.scoreA ??
        match.score?.scoreA ??
        match.matchScore?.scoreA ??
        "-"
      );
    }

    return (
      match.scoreB ??
      match.score?.scoreB ??
      match.matchScore?.scoreB ??
      "-"
    );
  };

  const getWinnerId = (match) => {
    return (
      match.winnerEntryId ??
      match.winnerId ??
      match.winner?.id ??
      null
    );
  };

  const isCompleted = (match) => {
    return (
      match.status === "COMPLETED" ||
      match.status === "completed" ||
      Boolean(getWinnerId(match))
    );
  };

  // =====================================================
  // SPORTS COMMITTEE
  // =====================================================

  const sportsCommittee = [
    {
      name: "Pranav Gavandi",
      role: "Sports Secretary — Boys",
    },
    {
      name: "Sharwari Marathe",
      role: "Sports Secretary — Girls",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="sports-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="sports-hero">

        <div className="sports-hero-overlay"></div>

        <div className="sports-hero-content">

          <span className="sports-kicker">
            FAMT ARENA
          </span>

          <h1>
            SPORTS
          </h1>

          <p>
            COMPETE <span>•</span> CONQUER{" "}
            <span>•</span> CELEBRATE
          </p>

          {currentUser && (
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                👤 {currentUser.name}{" "}
                ({currentUser.studentId})
              </span>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "8px 14px",
                  background: "transparent",
                  color: "#fff",
                  border:
                    "1px solid rgba(255,255,255,.4)",
                  cursor: "pointer",
                }}
              >
                LOGOUT
              </button>
            </div>
          )}

          <div className="hero-buttons">

            <a
              href="#live"
              className="primary-btn"
            >
              🔴 LIVE SCORES
            </a>

            <a
              href="#points"
              className="secondary-btn"
            >
              🏆 POINT TABLE
            </a>

          </div>

        </div>

        <div className="hero-scroll">
          SCROLL TO EXPLORE
          <span>↓</span>
        </div>

      </section>

      {/* =====================================================
          01 — LIVE MATCHES
      ===================================================== */}

      <section
        className="sports-section"
        id="live"
      >

        <div className="section-heading">

          <span>
            01 / LIVE ACTION
          </span>

          <h2>
            LIVE <strong>NOW</strong>
          </h2>

          <p>
            Follow live matches updated from
            the competition backend.
          </p>

        </div>

        <div className="live-grid">

          {matchesLoading ? (

            <div className="empty-state">
              Loading live matches...
            </div>

          ) : liveMatches.length === 0 ? (

            <div className="empty-state">

              <h3>
                NO LIVE MATCHES
              </h3>

              <p>
                There are currently no live
                matches in the backend.
              </p>

            </div>

          ) : (

            liveMatches.map((match) => (

              <article
                className="live-card"
                key={match.id}
              >

                <div className="live-card-top">

                  <span className="live-badge">
                    <i></i> LIVE
                  </span>

                  <span className="match-sport">
                    {getSportIcon(match)}{" "}
                    {getSportName(match)}
                  </span>

                </div>

                {getRoundName(match) && (
                  <span className="match-stage">
                    {getRoundName(match)}
                  </span>
                )}

                <div className="score-area">

                  <div className="team-score">

                    <span>
                      {getMatchTeamA(match)}
                    </span>

                    <strong>
                      {match.scoreA ?? "-"}
                    </strong>

                  </div>

                  <div className="vs">
                    VS
                  </div>

                  <div className="team-score">

                    <span>
                      {getMatchTeamB(match)}
                    </span>

                    <strong>
                      {match.scoreB ?? "-"}
                    </strong>

                  </div>

                </div>

                <div className="match-info">

                  {match.detail && (
                    <span>
                      {match.detail}
                    </span>
                  )}

                  {match.category?.name && (
                    <span>
                      {match.category.name}
                    </span>
                  )}

                  {match.venue && (
                    <span>
                      📍 {match.venue}
                    </span>
                  )}

                </div>

                <button
                  className="card-link"
                  onClick={() =>
                    setSelectedMatch(match)
                  }
                >
                  VIEW LIVE SCORECARD →
                </button>

              </article>

            ))

          )}

        </div>

      </section>

      {/* =====================================================
          02 — POINT TABLE
      ===================================================== */}

      <section
        className="sports-section points-section"
        id="points"
      >

        <div className="section-heading">

          <span>
            02 / CHAMPIONSHIP
          </span>

          <h2>
            POINT <strong>TABLE</strong>
          </h2>

          <p>
            Overall inter-department
            championship standings.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px",
          }}
        >

          <button
            type="button"
            onClick={refreshBackendData}
            disabled={refreshing}
            style={{
              padding: "9px 15px",
              background: "transparent",
              color: "#fff",
              border:
                "1px solid rgba(255,255,255,.3)",
              cursor: refreshing
                ? "wait"
                : "pointer",
            }}
          >
            {refreshing
              ? "REFRESHING..."
              : "↻ REFRESH DATA"}
          </button>

        </div>

        <div className="table-wrapper">

          <table className="points-table">

            <thead>
              <tr>
                <th>RANK</th>
                <th>DEPARTMENT</th>
                <th>🥇</th>
                <th>🥈</th>
                <th>🥉</th>
                <th>POINTS</th>
              </tr>
            </thead>

            <tbody>

              {pointTableLoading ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table-state"
                  >
                    LOADING POINT TABLE...
                  </td>
                </tr>

              ) : pointTableError ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table-state"
                  >
                    FAILED TO LOAD POINT TABLE
                  </td>
                </tr>

              ) : pointTable.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table-state"
                  >
                    NO POINT TABLE DATA AVAILABLE
                  </td>
                </tr>

              ) : (

                pointTable.map(
                  (standing, index) => (

                    <tr
                      key={
                        standing.id ||
                        standing.departmentId ||
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <strong>
                          {standing.department?.name ||
                            standing.departmentName ||
                            "Unknown Department"}
                        </strong>

                        {(standing.department?.code ||
                          standing.departmentCode) && (
                          <small
                            style={{
                              display: "block",
                              opacity: 0.6,
                              marginTop: "3px",
                            }}
                          >
                            {standing.department?.code ||
                              standing.departmentCode}
                          </small>
                        )}

                      </td>

                      <td>
                        {standing.gold ?? 0}
                      </td>

                      <td>
                        {standing.silver ?? 0}
                      </td>

                      <td>
                        {standing.bronze ?? 0}
                      </td>

                      <td>
                        <strong>
                          {standing.points ?? 0}
                        </strong>
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          03 — SPORTS & EVENTS
      ===================================================== */}

      <section
        className="sports-section events-section"
      >

        <div className="section-heading">

          <span>
            03 / COMPETE
          </span>

          <h2>
            SPORTS <strong>& EVENTS</strong>
          </h2>

          <p>
            Sports currently available in the
            competition system.
          </p>

        </div>

        <div className="sport-filters">

          {[
            "All",
            "Team Sport",
            "Individual Events",
            "Doubles / Mixed",
          ].map((filter) => (

            <button
              key={filter}
              className={
                selectedSport === filter
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedSport(filter)
              }
            >
              {filter}
            </button>

          ))}

        </div>

        <div className="sports-grid">

          {sportsLoading ? (

            <div className="empty-state">
              Loading sports...
            </div>

          ) : filteredSports.length === 0 ? (

            <div className="empty-state">

              <h3>
                NO SPORTS AVAILABLE
              </h3>

              <p>
                No sports are currently
                available in the backend.
              </p>

            </div>

          ) : (

            filteredSports.map((sport) => (

              <article
                className="sport-card"
                key={sport.id}
              >

                <div className="sport-card-icon">
                  {sport.icon || "🏆"}
                </div>

                <div className="sport-card-header">

                  <span className="sport-type">
                    {sport.type === "TEAM"
                      ? "TEAM SPORT"
                      : "INDIVIDUAL"}
                  </span>

                  <h3>
                    {sport.name}
                  </h3>

                </div>

                <span className="registration-status">
                  REGISTRATION AVAILABLE
                </span>

                {sport.description && (
                  <p>
                    {sport.description}
                  </p>
                )}

                <div className="sport-details">

                  <div>

                    <small>
                      REGISTRATION DEADLINE
                    </small>

                    <strong>
                      NOT AVAILABLE
                    </strong>

                  </div>

                  <div>

                    <small>
                      EVENT DATE
                    </small>

                    <strong>
                      NOT AVAILABLE
                    </strong>

                  </div>

                  <div>

                    <small>
                      VENUE
                    </small>

                    <strong>
                      {sport.venue ||
                        "NOT ASSIGNED"}
                    </strong>

                  </div>

                </div>

                <button
                  className="register-sport-btn"
                  onClick={() =>
                    openRegistration(sport)
                  }
                >
                  REGISTER NOW →
                </button>

              </article>

            ))

          )}

        </div>

      </section>

      {/* =====================================================
          04 — UPCOMING MATCHES
      ===================================================== */}

      <section
        className="sports-section upcoming-section"
      >

        <div className="section-heading">

          <span>
            04 / NEXT UP
          </span>

          <h2>
            UPCOMING <strong>MATCHES</strong>
          </h2>

        </div>

        <div className="upcoming-grid">

          {matchesLoading ? (

            <div className="empty-state">
              Loading upcoming matches...
            </div>

          ) : upcomingMatches.length === 0 ? (

            <div className="empty-state">

              <h3>
                NO UPCOMING MATCHES
              </h3>

              <p>
                Upcoming matches will appear
                here after they are scheduled
                in the backend.
              </p>

            </div>

          ) : (

            upcomingMatches.map((match) => (

              <article
                className="upcoming-card"
                key={match.id}
              >

                <div className="upcoming-top">

                  <span>
                    {getSportIcon(match)}{" "}
                    {getSportName(match)}
                  </span>

                  <small>
                    UPCOMING
                  </small>

                </div>

                <div className="upcoming-teams">

                  <strong>
                    {getMatchTeamA(match)}
                  </strong>

                  <span>
                    VS
                  </span>

                  <strong>
                    {getMatchTeamB(match)}
                  </strong>

                </div>

                <div className="upcoming-info">

                  {getRoundName(match) && (
                    <span>
                      🏆 {getRoundName(match)}
                    </span>
                  )}

                  {match.date && (
                    <span>
                      📅 {match.date}
                    </span>
                  )}

                  {match.time && (
                    <span>
                      ⏰ {match.time}
                    </span>
                  )}

                  {match.venue && (
                    <span>
                      📍 {match.venue}
                    </span>
                  )}

                </div>

              </article>

            ))

          )}

        </div>

      </section>

      {/* =====================================================
          05 — RESULTS
      ===================================================== */}

      <section
        className="sports-section results-section"
        id="results"
      >

        <div className="section-heading">

          <span>
            05 / COMPLETED
          </span>

          <h2>
            MATCH <strong>RESULTS</strong>
          </h2>

          <p>
            Completed matches and official results
            published from the competition backend.
          </p>

        </div>

        <div className="results-grid">

          {matchesLoading ? (

            <div className="empty-state">
              Loading results...
            </div>

          ) : completedMatches.length === 0 ? (

            <div className="empty-state">

              <h3>
                NO RESULTS AVAILABLE
              </h3>

              <p>
                Completed matches will appear here
                after the administrator records
                their results.
              </p>

            </div>

          ) : (

            completedMatches.map((match) => {

              const teamA = getMatchTeamA(match);
              const teamB = getMatchTeamB(match);

              const winnerId = getWinnerId(match);

              const entryAId =
                match.entryA?.id ||
                match.entryAId;

              const entryBId =
                match.entryB?.id ||
                match.entryBId;

              let winnerName = "Completed";

              if (
                winnerId &&
                Number(winnerId) === Number(entryAId)
              ) {
                winnerName = teamA;
              } else if (
                winnerId &&
                Number(winnerId) === Number(entryBId)
              ) {
                winnerName = teamB;
              } else if (match.winner?.name) {
                winnerName = match.winner.name;
              }

              return (
                <article
                  className="result-card"
                  key={match.id}
                  style={{
                    padding: "25px",
                    border:
                      "1px solid rgba(255,255,255,.12)",
                    background:
                      "rgba(255,255,255,.03)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "15px",
                      flexWrap: "wrap",
                    }}
                  >

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        letterSpacing: "1px",
                        opacity: 0.7,
                      }}
                    >
                      {getSportIcon(match)}{" "}
                      {getSportName(match)}
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "5px 9px",
                        border:
                          "1px solid rgba(255,255,255,.25)",
                      }}
                    >
                      COMPLETED
                    </span>

                  </div>

                  {getRoundName(match) && (
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.65,
                        marginBottom: "15px",
                      }}
                    >
                      {getRoundName(match)}
                    </div>
                  )}

                  {match.detail && (
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.65,
                        marginBottom: "15px",
                      }}
                    >
                      {match.detail}
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr auto 1fr",
                      alignItems: "center",
                      gap: "15px",
                      textAlign: "center",
                    }}
                  >

                    <div>

                      <strong>
                        {teamA}
                      </strong>

                      {getDepartmentName(
                        match.entryA
                      ) && (
                        <small
                          style={{
                            display: "block",
                            opacity: 0.6,
                            marginTop: "5px",
                          }}
                        >
                          {getDepartmentName(
                            match.entryA
                          )}
                        </small>
                      )}

                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          marginTop: "10px",
                        }}
                      >
                        {match.scoreA ?? "-"}
                      </div>

                    </div>

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        opacity: 0.5,
                      }}
                    >
                      VS
                    </span>

                    <div>

                      <strong>
                        {teamB}
                      </strong>

                      {getDepartmentName(
                        match.entryB
                      ) && (
                        <small
                          style={{
                            display: "block",
                            opacity: 0.6,
                            marginTop: "5px",
                          }}
                        >
                          {getDepartmentName(
                            match.entryB
                          )}
                        </small>
                      )}

                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          marginTop: "10px",
                        }}
                      >
                        {match.scoreB ?? "-"}
                      </div>

                    </div>

                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "15px",
                      borderTop:
                        "1px solid rgba(255,255,255,.1)",
                      textAlign: "center",
                    }}
                  >

                    <span
                      style={{
                        fontSize: "11px",
                        letterSpacing: "1px",
                        opacity: 0.65,
                      }}
                    >
                      WINNER
                    </span>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                      }}
                    >
                      🏆 {winnerName}
                    </strong>

                  </div>

                </article>
              );
            })

          )}

        </div>

      </section>

      {/* =====================================================
          06 — SCHEDULE
      ===================================================== */}

      <section
        className="sports-section schedule-section"
        id="schedule"
      >

        <div className="section-heading">

          <span>
            06 / CALENDAR
          </span>

          <h2>
            COMPLETE <strong>SCHEDULE</strong>
          </h2>

          <p>
            Official match schedule published
            by the administrator.
          </p>

        </div>

        <div className="schedule-list">

          <div className="empty-state">

            <h3>
              NO SCHEDULE AVAILABLE
            </h3>

            <p>
              The schedule will appear here when
              it is added by the administrator.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          07 — PLAYER RANKINGS
      ===================================================== */}

      <section
        className="sports-section rankings-section"
      >

        <div className="section-heading">

          <span>
            07 / ATHLETES
          </span>

          <h2>
            PLAYER <strong>RANKINGS</strong>
          </h2>

          <p>
            Rankings generated from actual
            competition results.
          </p>

        </div>

        <div className="players-grid">

          <div className="empty-state">

            <h3>
              NO PLAYER RANKINGS AVAILABLE
            </h3>

            <p>
              Rankings will appear here when
              results are recorded and rankings
              are available from the backend.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          08 — DRAW LOTS
      ===================================================== */}

      <section
        className="sports-section lots-section"
      >

        <div className="lots-content">

          <div className="section-heading left-heading">

            <span>
              08 / TOURNAMENT DRAW
            </span>

            <h2>
              DRAW <strong>LOTS</strong>
            </h2>

            <p>
              Official tournament draws generated
              by the competition system.
            </p>

          </div>

          <div className="lots-grid">

            {drawLoading ? (

              <div className="empty-state">
                Loading draw...
              </div>

            ) : drawMatches.length === 0 ? (

              <div className="empty-state">

                <h3>
                  NO DRAW AVAILABLE
                </h3>

                <p>
                  Tournament draw fixtures will
                  appear here after they are
                  generated.
                </p>

              </div>

            ) : (

              drawMatches.map(
                (match, index) => {

                  const entryA =
                    getMatchEntryA(match);

                  const entryB =
                    getMatchEntryB(match);

                  const nameA =
                    getEntryName(entryA);

                  const nameB =
                    getEntryName(entryB);

                  const winnerId =
                    getWinnerId(match);

                  const entryAId =
                    entryA?.id ||
                    match.entryAId;

                  const entryBId =
                    entryB?.id ||
                    match.entryBId;

                  return (
                    <div
                      className="lot-card"
                      key={
                        match.id ||
                        `${match.roundName}-${index}`
                      }
                    >

                      <span>
                        {match.roundName ||
                          `MATCH ${index + 1}`}
                      </span>

                      <div>

                        <strong>
                          {nameA}
                        </strong>

                        {getDepartmentName(
                          entryA
                        ) && (
                          <small>
                            {getDepartmentName(
                              entryA
                            )}
                          </small>
                        )}

                        <small>
                          {getScore(
                            match,
                            "A"
                          )}
                        </small>

                        <small>
                          VS
                        </small>

                        <strong>
                          {nameB}
                        </strong>

                        {getDepartmentName(
                          entryB
                        ) && (
                          <small>
                            {getDepartmentName(
                              entryB
                            )}
                          </small>
                        )}

                        <small>
                          {getScore(
                            match,
                            "B"
                          )}
                        </small>

                      </div>

                      {isCompleted(match) && (
                        <span className="draw-winner">

                          WINNER:{" "}

                          {Number(winnerId) ===
                          Number(entryAId)
                            ? nameA
                            : Number(winnerId) ===
                              Number(entryBId)
                            ? nameB
                            : "Completed"}

                        </span>
                      )}

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          09 — SPORTS EXCELLENCE
      ===================================================== */}

      <section
        className="sports-section excellence-section"
      >

        <div className="section-heading">

          <span>
            09 / SPORTS EXCELLENCE
          </span>

          <h2>
            BEST <strong>SPORTSPERSON</strong>
          </h2>

          <p>
            Official awards will appear after
            they are published by the administrator.
          </p>

        </div>

        <div className="award-grid">

          <div className="award-card">

            <span className="award-label">
              🏃 BEST ATHLETE
            </span>

            <div className="award-photo">

              <span>
                NOT YET UPDATED
              </span>

            </div>

            <h3>
              NO AWARD DATA
            </h3>

            <p>
              Best Athlete will be updated here.
            </p>

          </div>

          <div
            className="award-card featured-award"
          >

            <span className="award-label">
              ⭐ BEST SPORTSPERSON
            </span>

            <div className="award-photo">

              <span>
                NOT YET UPDATED
              </span>

            </div>

            <h3>
              NO AWARD DATA
            </h3>

            <p>
              Best Sportsperson will be updated here.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          10 — HIGHLIGHTS
      ===================================================== */}

      <section
        className="sports-section highlights-section"
      >

        <div className="section-heading">

          <span>
            10 / MOMENTS
          </span>

          <h2>
            SPORTS <strong>HIGHLIGHTS</strong>
          </h2>

          <p>
            Official sports highlights published
            by the administrator.
          </p>

        </div>

        <div className="highlights-grid">

          <div className="empty-state">

            <h3>
              NO HIGHLIGHTS AVAILABLE
            </h3>

            <p>
              Sports highlights will appear here
              when they are published.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          11 — COMMITTEE
      ===================================================== */}

      <section
        className="sports-section committee-section"
      >

        <div className="section-heading">

          <span>
            11 / OUR TEAM
          </span>

          <h2>
            SPORTS <strong>COMMITTEE</strong>
          </h2>

        </div>

        <div className="committee-grid">

          {sportsCommittee.map(
            (member) => (

              <article
                className="committee-card"
                key={member.name}
              >

                <div className="committee-photo">

                  <span>
                    {member.name
                      .split(" ")
                      .map(
                        (word) => word[0]
                      )
                      .join("")}
                  </span>

                </div>

                <h3>
                  {member.name}
                </h3>

                <p>
                  {member.role}
                </p>

              </article>

            )
          )}

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="sports-footer">

        <div className="footer-logo">
          FAMT <span>ARENA</span>
        </div>

        <p>
          CONNECT • COMPETE • CELEBRATE
        </p>

        <div className="footer-links">

          <a href="/sports">
            SPORTS
          </a>

          <a href="#live">
            LIVE
          </a>

          <a href="#points">
            POINT TABLE
          </a>

          <a href="#results">
            RESULTS
          </a>

          <a href="#schedule">
            SCHEDULE
          </a>

        </div>

        <div className="footer-bottom">
          © 2026 FAMT ARENA. ALL RIGHTS RESERVED.
        </div>

      </footer>

      {/* =====================================================
          LIVE SCORECARD MODAL
      ===================================================== */}

      {selectedMatch && (

        <div
          className="score-modal"
          onClick={() =>
            setSelectedMatch(null)
          }
        >

          <div
            className="score-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-modal"
              onClick={() =>
                setSelectedMatch(null)
              }
            >
              ×
            </button>

            <span className="live-badge">
              <i></i> LIVE
            </span>

            <div className="modal-sport">

              {getSportIcon(
                selectedMatch
              )}{" "}
              {getSportName(
                selectedMatch
              )}

            </div>

            {getRoundName(selectedMatch) && (
              <small>
                {getRoundName(selectedMatch)}
              </small>
            )}

            <div className="modal-score">

              <div>

                <span>
                  {getMatchTeamA(
                    selectedMatch
                  )}
                </span>

                <strong>
                  {selectedMatch.scoreA ?? "-"}
                </strong>

              </div>

              <b>
                VS
              </b>

              <div>

                <span>
                  {getMatchTeamB(
                    selectedMatch
                  )}
                </span>

                <strong>
                  {selectedMatch.scoreB ?? "-"}
                </strong>

              </div>

            </div>

            <div className="modal-info">

              {selectedMatch.detail && (
                <>
                  {selectedMatch.detail}
                  <br />
                </>
              )}

              {selectedMatch.category?.name && (
                <>
                  {selectedMatch.category.name}
                  <br />
                </>
              )}

              {selectedMatch.venue && (
                <>
                  📍 {selectedMatch.venue}
                </>
              )}

            </div>

            <div className="scorecard-placeholder">

              <h3>
                LIVE SCORECARD
              </h3>

              <p>
                Detailed player statistics,
                score updates, timeline and
                match events will appear here
                when provided by the backend.
              </p>

              <span>
                Backend integration active.
              </span>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          REGISTRATION MODAL
      ===================================================== */}

      {registrationSport && (

        <div
          className="registration-modal"
          onClick={closeRegistration}
        >

          <div
            className="registration-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-modal"
              onClick={closeRegistration}
            >
              ×
            </button>

            <span className="registration-modal-kicker">
              FAMT ARENA
            </span>

            <h2>
              REGISTER FOR{" "}
              <strong>
                {registrationSport.name}
              </strong>
            </h2>

            <p>
              Select your category and enter
              your student details.
            </p>

            {registrationError && (
              <div className="registration-error">
                {registrationError}
              </div>
            )}

            {registrationMessage && (
              <div className="registration-success">
                {registrationMessage}
              </div>
            )}

            <form
              onSubmit={submitRegistration}
            >

              <label>
                EVENT CATEGORY

                <select
                  value={
                    selectedCategory?.id || ""
                  }
                  onChange={(e) => {

                    const category =
                      registrationCategories.find(
                        (item) =>
                          item.id ===
                          Number(
                            e.target.value
                          )
                      );

                    setSelectedCategory(
                      category || null
                    );

                    setRegistrationError("");
                    setRegistrationMessage("");
                  }}
                >

                  <option value="">
                    Select category
                  </option>

                  {registrationCategories.map(
                    (category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}

                        {category.entryType
                          ? ` — ${category.entryType}`
                          : ""}
                      </option>

                    )
                  )}

                </select>

              </label>

              <label>
                DEPARTMENT

                <select
                  value={
                    registrationForm.departmentId
                  }
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      departmentId:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    Select department
                  </option>

                  {departments.map(
                    (department) => (

                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>

                    )
                  )}

                </select>

              </label>

              <label>
                STUDENT NAME

                <input
                  type="text"
                  placeholder="Enter full name"
                  value={
                    registrationForm.name
                  }
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      name: e.target.value,
                    })
                  }
                />

              </label>

              <label>
                YEAR OF STUDY

                <select
                  value={
                    registrationForm.year
                  }
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      year: e.target.value,
                    })
                  }
                >

                  <option value="">
                    Select year
                  </option>

                  <option value="1st Year">
                    1st Year
                  </option>

                  <option value="2nd Year">
                    2nd Year
                  </option>

                  <option value="3rd Year">
                    3rd Year
                  </option>

                  <option value="4th Year">
                    4th Year
                  </option>

                </select>

              </label>

              <label>
                MOBILE NUMBER

                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={
                    registrationForm.mobile
                  }
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      mobile: e.target.value,
                    })
                  }
                />

              </label>

              <label>
                EMAIL

                <input
                  type="email"
                  placeholder="Enter email address"
                  value={
                    registrationForm.email
                  }
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      email: e.target.value,
                    })
                  }
                />

              </label>

              {selectedCategory && (

                <div className="registration-type-info">

                  Entry type:{" "}

                  <strong>
                    {selectedCategory.entryType}
                  </strong>

                </div>

              )}

              <button
                type="submit"
                className="registration-submit-btn"
                disabled={
                  registrationLoading ||
                  !selectedCategory
                }
              >

                {registrationLoading
                  ? "REGISTERING..."
                  : "CONFIRM REGISTRATION →"}

              </button>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default SportsLanding;

