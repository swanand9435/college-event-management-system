import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [sports, setSports] = useState([]);
  const [entries, setEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [pointTable, setPointTable] = useState([]);
  const [results, setResults] = useState([]);

  const [selectedResultSport, setSelectedResultSport] =
    useState("");

  const [selectedResultCategory, setSelectedResultCategory] =
    useState("");

  const [registrationControls, setRegistrationControls] =
    useState([]);

  const [resultsLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedMatchSport, setSelectedMatchSport] =
useState("");

const [selectedMatchCategory, setSelectedMatchCategory] =
useState("");

const [matchStatusFilter, setMatchStatusFilter] =
useState("ALL");

  // ======================================================
  // SCORE MODAL
  // ======================================================

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  // ======================================================
  // COMPLETE MATCH MODAL
  // ======================================================

  const [completeMatchData, setCompleteMatchData] =
    useState(null);

  const [winnerEntryId, setWinnerEntryId] = useState("");

  // ======================================================
  // REGISTRATION DEADLINE
  // ======================================================

  const [deadlineValues, setDeadlineValues] = useState({});

  // ======================================================
  // REGISTRATION FILTERS
  // ======================================================

  const [selectedRegistrationSport, setSelectedRegistrationSport] =
    useState("");

  const [selectedRegistrationCategory, setSelectedRegistrationCategory] =
    useState("");

  // ======================================================
  // DRAW LOTS
  // ======================================================

  const [selectedDrawSport, setSelectedDrawSport] =
    useState("");

  // Winners / Results filters
const [selectedWinnerSport, setSelectedWinnerSport] = useState("");
const [selectedWinnerCategory, setSelectedWinnerCategory] = useState("");

  const [selectedDrawCategory, setSelectedDrawCategory] =
    useState("");

  const [drawCategories, setDrawCategories] =
    useState([]);

  const [selectedDraw, setSelectedDraw] =
    useState(null);

  const [drawEntries, setDrawEntries] =
    useState([]);

  const [drawLoading, setDrawLoading] =
    useState(false);
// ======================================================
// ATHLETICS DIRECT RESULTS
// ======================================================

const [athleticsResults, setAthleticsResults] = useState({
  first: "",
  second: "",
  third: "",
});

const [savingAthleticsResults, setSavingAthleticsResults] =
  useState(false);
  // ======================================================
  // REGISTRATION FILTER DATA
  // ======================================================

  const registrationSports = sports || [];

  const selectedSportObject = registrationSports.find(
    (sport) =>
      String(sport.id) ===
      String(selectedRegistrationSport)
  );

  const registrationCategories =
    selectedRegistrationSport === ""
      ? registrationSports.flatMap(
          (sport) => sport.categories || []
        )
      : selectedSportObject?.categories || [];

  const filteredRegistrations = entries.filter((entry) => {
    const sportId = entry.category?.sport?.id;
    const categoryId = entry.category?.id;

    const sportMatches =
      selectedRegistrationSport === "" ||
      String(sportId) ===
        String(selectedRegistrationSport);

    const categoryMatches =
      selectedRegistrationCategory === "" ||
      String(categoryId) ===
        String(selectedRegistrationCategory);

    return sportMatches && categoryMatches;
  });


  // ======================================================
// SELECTED DRAW CATEGORY
// ======================================================

const selectedDrawCategoryObject =
  drawCategories.find(
    (category) =>
      String(category.id) ===
      String(selectedDrawCategory)
  );

const selectedDrawSportObject =
  sports.find(
    (sport) =>
      String(sport.id) ===
      String(selectedDrawSport)
  );

const isAthletics =
  selectedDrawSportObject?.name
    ?.trim()
    ?.toLowerCase() === "athletics";
  // ======================================================
  // DRAW REGISTRATION STATUS
  // ======================================================

  const drawRegistrationStatus =
    selectedDrawCategoryObject
      ? getRegistrationStatus(
          selectedDrawCategoryObject
        )
      : "CLOSED";

  // ======================================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ======================================================

  const handleLogout = () => {
    sessionStorage.removeItem("famt_admin_token");
    setIsAuthenticated(false);
    setError("");
    setActiveTab("dashboard");
  };

  const adminFetch = async (url, options = {}) => {
    const token = sessionStorage.getItem("famt_admin_token");
    const headers = {
      ...(options.headers || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem("famt_admin_token");
      setIsAuthenticated(false);
      setError("Session expired or unauthorized. Please log in again.");
      throw new Error("Unauthorized. Please log in again.");
    }

    return res;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Invalid admin password");
      }

      sessionStorage.setItem("famt_admin_token", data.token);
      setIsAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("famt_admin_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    fetch(`${API_URL}/admin/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.admin) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("famt_admin_token");
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        sessionStorage.removeItem("famt_admin_token");
        setIsAuthenticated(false);
      });
  }, []);

  // ======================================================
  // FETCH ADMIN DATA
  // ======================================================

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        sportsRes,
        entriesRes,
        matchesRes,
        liveRes,
        pointRes,
        controlsRes,
        resultsRes,
      ] = await Promise.all([
        adminFetch(`${API_URL}/sports`),
        adminFetch(`${API_URL}/entries`),
        adminFetch(`${API_URL}/matches`),
        adminFetch(`${API_URL}/matches/live`),
        adminFetch(`${API_URL}/point-table`),
        adminFetch(`${API_URL}/registration-controls`),
        adminFetch(`${API_URL}/results`),
      ]);

      const sportsResult =
        await sportsRes.json();

      const entriesResult =
        await entriesRes.json();

      const matchesResult =
        await matchesRes.json();

      const liveResult =
        await liveRes.json();

      const pointsResult =
        await pointRes.json();

      const registrationResult =
        await controlsRes.json();

      const resultsResult =
        await resultsRes.json();

      if (sportsResult.success) {
        setSports(
          sportsResult.data || []
        );
      }

      if (entriesResult.success) {
        setEntries(
          entriesResult.data || []
        );
      }

      if (matchesResult.success) {
        setMatches(
          matchesResult.data || []
        );
      }

      if (liveResult.success) {
        setLiveMatches(
          liveResult.data || []
        );
      }

      if (pointsResult.success) {
        setPointTable(
          pointsResult.data || []
        );
      }

      if (registrationResult.success) {
        setRegistrationControls(
          registrationResult.data || []
        );
      }

      if (resultsResult.success) {
        setResults(
          resultsResult.data || []
        );
      }
    } catch (err) {
      console.error(
        "Admin data error:",
        err
      );

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
          const downloadRegistrationsPDF = () => {
  if (!filteredRegistrations.length) {
    setError("No registrations available to download.");
    return;
  }

  setMessage("");
  setError("");

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const sportName =
    selectedSportObject?.name || "All Sports";

  const categoryName =
    selectedRegistrationCategory === ""
      ? "All Categories"
      : registrationCategories.find(
          (category) =>
            String(category.id) ===
            String(selectedRegistrationCategory)
        )?.name || "Selected Category";

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FAMT ARENA", 14, 15);

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("SPORTS REGISTRATIONS", 14, 23);

  doc.setFontSize(10);
  doc.text(`Sport: ${sportName}`, 14, 32);
  doc.text(`Category: ${categoryName}`, 14, 39);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    14,
    46
  );

  const tableRows = filteredRegistrations.map(
    (entry, index) => {
      const category = entry.category;
      const sport = category?.sport;

      return [
        index + 1,
        entry.name ||
          entry.playerName ||
          entry.teamName ||
          `Entry ${entry.id}`,
        sport?.name || "-",
        category?.name || "-",
        entry.department?.name ||
          entry.departmentName ||
          "-",
        entry.entryType || "-",
        getMobileNumber(entry) || "-",
        getEmail(entry) || "-",
      ];
    }
  );

  autoTable(doc, {
    startY: 54,
    head: [[
      "#",
      "Entry",
      "Sport",
      "Category",
      "Department",
      "Type",
      "Mobile",
      "Email",
    ]],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 2,
      valign: "middle",
    },
    headStyles: {
      fontStyle: "bold",
    },
    margin: {
      left: 10,
      right: 10,
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      doc.text(
        `FAMT Arena • Page ${data.pageNumber}`,
        10,
        doc.internal.pageSize.height - 8
      );
    },
  });

  const safeSportName = sportName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  const safeCategoryName = categoryName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  doc.save(
    `FAMT_Arena_Registrations_${safeSportName}_${safeCategoryName}_2026-27.pdf`
  );

  setMessage(
    "Registration PDF downloaded successfully."
  );
};
  // ======================================================
  // GET MOBILE NUMBER
  // ======================================================

  const getMobileNumber = (entry) => {
    return (
      entry.mobileNo ||
      entry.mobile ||
      entry.phone ||
      entry.phoneNumber ||
      entry.contactNumber ||
      entry.contactNo ||
      entry.captain?.mobileNo ||
      entry.captain?.mobile ||
      entry.captain?.phone ||
      entry.captain?.phoneNumber ||
      "-"
    );
  };

  // ======================================================
  // GET EMAIL
  // ======================================================

  const getEmail = (entry) => {
    return (
      entry.email ||
      entry.emailId ||
      entry.captain?.email ||
      entry.captain?.emailId ||
      "-"
    );
  };

// ======================================================
// DOWNLOAD DRAW PDF
// ======================================================

const downloadDrawPDF = () => {
  // Athletics does not use draws
  if (isAthletics) {
    setError(
      "Athletics does not have a draw PDF."
    );
    return;
  }

  if (!selectedDraw) {
    setError(
      "No draw available."
    );
    return;
  }

  if (
    !Array.isArray(selectedDraw.rounds) ||
    selectedDraw.rounds.length === 0
  ) {
    setError(
      "No draw rounds available."
    );
    return;
  }

  setMessage("");
  setError("");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const sportName =
    selectedDrawSportObject?.name ||
    sports.find(
      (sport) =>
        String(sport.id) ===
        String(selectedDrawSport)
    )?.name ||
    "Sport";

  const categoryName =
    selectedDrawCategoryObject?.name ||
    "Category";

  // ----------------------------------------------------
  // HEADER
  // ----------------------------------------------------

  pdf.setFontSize(18);
  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.text(
    "FAMT ARENA",
    14,
    15
  );

  pdf.setFontSize(13);
  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.text(
    "SPORTS DRAW",
    14,
    23
  );

  pdf.setFontSize(10);

  pdf.text(
    `Sport: ${sportName}`,
    14,
    32
  );

  pdf.text(
    `Category: ${categoryName}`,
    14,
    39
  );

  pdf.text(
    `Draw: ${
      selectedDraw.name ||
      `${categoryName} Draw`
    }`,
    14,
    46
  );

  pdf.text(
    `Status: ${
      selectedDraw.status ||
      "GENERATED"
    }`,
    14,
    53
  );

  pdf.text(
    `Generated: ${new Date().toLocaleString(
      "en-IN"
    )}`,
    14,
    60
  );

  // ----------------------------------------------------
  // ROUND-WISE DRAW
  // ----------------------------------------------------

  let currentY = 70;

  selectedDraw.rounds.forEach(
    (round) => {
      const matches =
        round.matches || [];

      if (matches.length === 0) {
        return;
      }

      if (currentY > 170) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(13);
      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        round.name ||
          `Round ${round.roundNo}`,
        14,
        currentY
      );

      currentY += 5;

      const tableRows =
        matches.map(
          (match, index) => {
            const entryA =
              getEntryName(
                match.entryA,
                match.entryAId,
                "BYE"
              );

            const entryB =
              getEntryName(
                match.entryB,
                match.entryBId,
                "BYE"
              );

            return [
              index + 1,
              `Match #${match.id}`,
              entryA,
              "VS",
              entryB,
              match.status ||
                "UPCOMING",
            ];
          }
        );

      autoTable(pdf, {
        startY: currentY,

        head: [
          [
            "#",
            "Match",
            "Entry A",
            "",
            "Entry B",
            "Status",
          ],
        ],

        body: tableRows,

        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle",
        },

        headStyles: {
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 10,
          },

          1: {
            cellWidth: 22,
          },

          2: {
            cellWidth: 75,
          },

          3: {
            cellWidth: 12,
            halign: "center",
          },

          4: {
            cellWidth: 75,
          },

          5: {
            cellWidth: 25,
          },
        },

        margin: {
          left: 14,
          right: 14,
        },

        didDrawPage: (data) => {
          const pageCount =
            pdf.internal.getNumberOfPages();

          pdf.setFontSize(8);
          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.text(
            `FAMT Arena • Page ${data.pageNumber} of ${pageCount}`,
            14,
            pdf.internal.pageSize.height - 8
          );
        },
      });

      currentY =
        pdf.lastAutoTable?.finalY ||
        currentY + 20;

      currentY += 12;
    }
  );

  // ----------------------------------------------------
  // FILE NAME
  // ----------------------------------------------------

  const safeSportName =
    sportName
      .replace(
        /[^a-z0-9]/gi,
        "_"
      )
      .toLowerCase();

  const safeCategoryName =
    categoryName
      .replace(
        /[^a-z0-9]/gi,
        "_"
      )
      .toLowerCase();

  const fileName =
    `FAMT_Arena_Draw_${safeSportName}_${safeCategoryName}_2026-27.pdf`;

  pdf.save(fileName);

  setMessage(
    "Draw PDF downloaded successfully."
  );
};
  // ======================================================
  // OPEN REGISTRATION
  // ======================================================

  const openRegistration = async (categoryId) => {
    setMessage("");
    setError("");

    try {
      const deadline =
        deadlineValues[categoryId];

      const body = {};

      if (deadline) {
        body.registrationEnds =
          new Date(deadline).toISOString();
      }

      const response = await adminFetch(
        `${API_URL}/categories/${categoryId}/registration/open`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to open registration"
        );
      }

      setMessage(
        "Registration opened successfully."
      );

      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ======================================================
  // CLOSE REGISTRATION
  // ======================================================

  const closeRegistration = async (
    categoryId
  ) => {
    setMessage("");
    setError("");

    try {
      const response = await adminFetch(
        `${API_URL}/categories/${categoryId}/registration/close`,
        {
          method: "POST",
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to close registration"
        );
      }

      setMessage(
        "Registration closed successfully."
      );

      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ======================================================
// START MATCH
// ======================================================

const startMatch = async (matchId) => {
  setMessage("");
  setError("");

  try {
    const response = await adminFetch(
      `${API_URL}/matches/${matchId}/start`,
      {
        method: "POST",
      }
    );

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Failed to start match"
      );
    }

    setMessage(
      "Match started successfully."
    );

    await fetchAdminData();
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};

// ======================================================
// SCHEDULE MATCH
// ======================================================

const scheduleMatch = async (
  matchId,
  scheduledAt,
  venue
) => {
  setMessage("");
  setError("");

  try {
    const response = await adminFetch(
      `${API_URL}/matches/${matchId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledAt:
            scheduledAt || null,
          venue:
            venue || null,
        }),
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Failed to schedule match"
      );
    }

    setMessage(
      "Match schedule updated successfully."
    );

    await fetchAdminData();
  } catch (err) {
    console.error(
      "Schedule match error:",
      err
    );

    setError(
      err.message ||
        "Failed to schedule match"
    );

    throw err;
  }
};

// ======================================================
// UPDATE SCORE
// ======================================================

const updateScore = async () => {
  if (!selectedMatch) return;

  if (scoreA === "" || scoreB === "") {
    setError("Enter both scores.");
    return;
  }

  setMessage("");
  setError("");

  try {
    const response = await adminFetch(
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

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Failed to update score"
      );
    }

    setMessage(
      "Score updated successfully."
    );

    setSelectedMatch(null);
    setScoreA("");
    setScoreB("");

    await fetchAdminData();
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};
  // ======================================================
  // OPEN COMPLETE MATCH MODAL
  // ======================================================

  const openCompleteMatch = (match) => {
    setMessage("");
    setError("");

    setCompleteMatchData(match);

    if (!match.entryBId) {
      setWinnerEntryId(
        String(match.entryAId)
      );
    } else if (!match.entryAId) {
      setWinnerEntryId(
        String(match.entryBId)
      );
    } else {
      setWinnerEntryId("");
    }
  };

  // ======================================================
  // COMPLETE MATCH
  // ======================================================

  const completeMatch = async () => {
    if (!completeMatchData) return;

    if (!winnerEntryId) {
      setError(
        "Please select the winner."
      );
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await adminFetch(
        `${API_URL}/matches/${completeMatchData.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            winnerEntryId:
              Number(winnerEntryId),
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to complete match"
        );
      }

      setMessage(
        "Match completed successfully."
      );

      setCompleteMatchData(null);
      setWinnerEntryId("");

      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // ======================================================
  // DRAW - LOAD CATEGORIES
  // ======================================================

  const loadDrawCategories = (sportId) => {
    setSelectedDrawSport(sportId);
    setSelectedDrawCategory("");
    setSelectedDraw(null);
    setDrawEntries([]);

    if (!sportId) {
      setDrawCategories([]);
      return;
    }

    const sport = sports.find(
      (item) =>
        String(item.id) ===
        String(sportId)
    );

    setDrawCategories(
      sport?.categories || []
    );
  };

  // ======================================================
  // DRAW - LOAD CATEGORY
  // ======================================================

  const loadDrawCategory = async (categoryId) => {
    setSelectedDrawCategory(categoryId);
    setSelectedDraw(null);
    setDrawEntries([]);
    setMessage("");
    setError("");

    if (!categoryId) {
      return;
    }

    const categoryEntries =
      entries.filter(
        (entry) =>
          String(entry.category?.id) ===
          String(categoryId)
      );

    setDrawEntries(categoryEntries);

    // ----------------------------------------------------
    // Load latest existing draw for this category
    // ----------------------------------------------------

    try {
      setDrawLoading(true);

      const response = await adminFetch(
        `${API_URL}/categories/${categoryId}/draw`
      );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success &&
        result.data
      ) {
        setSelectedDraw(result.data);
      }
    } catch (err) {
      console.error(
        "Load draw error:",
        err
      );
    } finally {
      setDrawLoading(false);
    }
  };

  // ======================================================
  // LOAD EXISTING ATHLETICS RESULT
  // ======================================================

  const loadAthleticsResult = async (categoryId) => {
    if (!categoryId) {
      setAthleticsResults({
        first: "",
        second: "",
        third: "",
      });
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/results?categoryId=${categoryId}&year=2026-27`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load Athletics results"
        );
      }

      const categoryResults = data.data || [];

      const first = categoryResults.find(
        (result) => Number(result.position) === 1
      );

      const second = categoryResults.find(
        (result) => Number(result.position) === 2
      );

      const third = categoryResults.find(
        (result) => Number(result.position) === 3
      );

      setAthleticsResults({
        first: first ? String(first.entryId) : "",
        second: second ? String(second.entryId) : "",
        third: third ? String(third.entryId) : "",
      });
    } catch (error) {
      console.error(
        "Load Athletics result error:",
        error
      );

      setError(
        error.message ||
          "Failed to load Athletics results."
      );
    }
  };

  // ======================================================
  // LOAD ATHLETICS RESULT WHEN CATEGORY CHANGES
  // ======================================================

  useEffect(() => {
    if (
      isAthletics &&
      selectedDrawCategory
    ) {
      loadAthleticsResult(
        selectedDrawCategory
      );
    } else {
      setAthleticsResults({
        first: "",
        second: "",
        third: "",
      });
    }
  }, [
    isAthletics,
    selectedDrawCategory,
  ]);

  // ======================================================
  // CREATE DRAW
  // ======================================================

  const createDraw = async () => {
    if (!selectedDrawCategory) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (
      drawRegistrationStatus !==
      "CLOSED"
    ) {
      setError(
        "Registration must be closed before creating the draw."
      );
      return;
    }

    if (drawEntries.length < 2) {
      setError(
        "At least 2 registrations are required to create a draw."
      );
      return;
    }

    setMessage("");
    setError("");
    setDrawLoading(true);

    try {
      const categoryName =
        selectedDrawCategoryObject?.name ||
        "Sports Draw";

      const response = await adminFetch(
        `${API_URL}/draws`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            categoryId:
              Number(selectedDrawCategory),
            name: `${categoryName} Draw`,
            format: "KNOCKOUT",
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to create draw"
        );
      }

      setSelectedDraw(
        result.data
      );

      setMessage(
        "Draw created successfully. You can now generate the lots."
      );
    } catch (err) {
      console.error(
        "Create draw error:",
        err
      );

      setError(
        err.message
      );
    } finally {
      setDrawLoading(false);
    }
  };

  // ======================================================
  // GENERATE DRAW
  // ======================================================

  const generateDraw = async () => {
    if (!selectedDraw?.id) {
      setError(
        "Create a draw first."
      );
      return;
    }

    if (
      drawRegistrationStatus !==
      "CLOSED"
    ) {
      setError(
        "Registration must be closed before generating the draw."
      );
      return;
    }

    setMessage("");
    setError("");
    setDrawLoading(true);

    try {
      const response = await adminFetch(
        `${API_URL}/draws/${selectedDraw.id}/generate`,
        {
          method: "POST",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to generate draw"
        );
      }

      setSelectedDraw(
        result.data
      );

      setMessage(
        "Draw generated successfully."
      );

      await fetchAdminData();
    } catch (err) {
      console.error(
        "Generate draw error:",
        err
      );

      setError(
        err.message
      );
    } finally {
      setDrawLoading(false);
    }
  };

  // ======================================================
// LOCK DRAW
// ======================================================

const lockDraw = async () => {
  // Athletics does not use draws
  if (isAthletics) {
    setError(
      "Athletics does not use draws or matches."
    );
    return;
  }

  if (!selectedDraw?.id) {
    setError(
      "No draw selected."
    );
    return;
  }

  if (
    selectedDraw.status !==
    "GENERATED"
  ) {
    setError(
      "Only a generated draw can be locked."
    );
    return;
  }

  const confirmed =
    window.confirm(
      "Lock this draw? Once locked, the bracket should not be changed."
    );

  if (!confirmed) {
    return;
  }

  setMessage("");
  setError("");
  setDrawLoading(true);

  try {
    const response = await adminFetch(
      `${API_URL}/draws/${selectedDraw.id}/lock`,
      {
        method: "POST",
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Failed to lock draw"
      );
    }

    setSelectedDraw(
      result.data
    );

    setMessage(
      "Draw locked successfully."
    );

    await fetchAdminData();
  } catch (err) {
    console.error(
      "Lock draw error:",
      err
    );

    setError(
      err.message
    );
  } finally {
    setDrawLoading(false);
  }
};


// ======================================================
// RESET / REGENERATE DRAW
// ======================================================

const resetDraw = async () => {
  // Athletics does not use draws
  if (isAthletics) {
    setError(
      "Athletics does not use draws or matches."
    );
    return;
  }

  if (!selectedDraw?.id) {
    setError(
      "No draw selected."
    );
    return;
  }

  const confirmed =
    window.confirm(
      "RESET this draw?\n\n" +
      "The generated bracket, rounds and matches will be deleted.\n" +
      "Registrations will NOT be deleted.\n\n" +
      "You can generate the draw again."
    );

  if (!confirmed) {
    return;
  }

  setMessage("");
  setError("");
  setDrawLoading(true);

  try {
    const response = await adminFetch(
      `${API_URL}/draws/${selectedDraw.id}/reset`,
      {
        method: "POST",
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Failed to reset draw"
      );
    }

    setSelectedDraw(
      result.data
    );

    setMessage(
      "Draw reset successfully. Registrations are preserved. You can generate a new draw."
    );

    await fetchAdminData();
  } catch (err) {
    console.error(
      "Reset draw error:",
      err
    );

    setError(
      err.message
    );
  } finally {
    setDrawLoading(false);
  }
};



  // ======================================================
  // LOGIN SCREEN
  // ======================================================

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

          <h1
            style={{
              margin: "0 0 8px",
            }}
          >
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
            onChange={(e) =>
              setPassword(e.target.value)
            }
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

  // ======================================================
  // ADMIN PANEL
  // ======================================================

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
        {/* =================================================
            HEADER
        ================================================= */}

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

            <h1
              style={{
                margin: "5px 0",
              }}
            >
              SPORTS ADMIN
            </h1>

            <p
              style={{
                color: "#9ca3af",
              }}
            >
              Manage registrations, matches,
              scores, draws and results.
            </p>
          </div>

          <button
            onClick={handleLogout}
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

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          {
         [
            ["dashboard", "📊 Dashboard"],
            ["registrations", "👥 Registrations"],
            ["registration-control", "🔐 Registration Control"],
            ["draws", "🎲 Draw Lots"],
            ["matches", "🏟️ Matches"],
            ["results", "🥇 Winners / Results"],
            ["points", "🏆 Point Table"],
          ]
          .map(([id, label]) => (
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

        {/* =================================================
            LOADING
        ================================================= */}

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

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

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

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

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

        {/* =================================================
            DASHBOARD
        ================================================= */}

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

              <StatCard
                icon="🟢"
                value={
                  registrationControls.filter(
                    (item) =>
                      getRegistrationStatus(item) ===
                      "OPEN"
                  ).length
                }
                label="Open Registrations"
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
                    <strong>
                      {sport.name}
                    </strong>

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

        {/* =================================================
            REGISTRATIONS
        ================================================= */}

        {activeTab === "registrations" && (
          <Section
            title={`Registrations (${filteredRegistrations.length})`}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
                padding: "20px",
                background: "#111827",
                border: "1px solid #263044",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: "13px",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  SPORT
                </label>

                <select
                  value={
                    selectedRegistrationSport
                  }
                  onChange={(e) => {
                    setSelectedRegistrationSport(
                      e.target.value
                    );

                    setSelectedRegistrationCategory(
                      ""
                    );
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    background: "#080b14",
                    color: "#fff",
                    border: "1px solid #374151",
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    All Sports
                  </option>

                  {registrationSports.map(
                    (sport) => (
                      <option
                        key={sport.id}
                        value={sport.id}
                      >
                        {sport.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: "13px",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  CATEGORY
                </label>

                <select
                  value={
                    selectedRegistrationCategory
                  }
                  onChange={(e) =>
                    setSelectedRegistrationCategory(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    background: "#080b14",
                    color: "#fff",
                    border: "1px solid #374151",
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    All Categories
                  </option>

                  {registrationCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "20px",
                padding: "15px 0",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                Showing{" "}
                <strong
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                  }}
                >
                  {filteredRegistrations.length}
                </strong>{" "}
                registration
                {filteredRegistrations.length !==
                1
                  ? "s"
                  : ""}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {(selectedRegistrationSport !==
                  "" ||
                  selectedRegistrationCategory !==
                    "") && (
                  <button
                    onClick={() => {
                      setSelectedRegistrationSport(
                        ""
                      );
                      setSelectedRegistrationCategory(
                        ""
                      );
                    }}
                    style={{
                      padding: "10px 15px",
                      background: "transparent",
                      border:
                        "1px solid #374151",
                      color: "#facc15",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    CLEAR FILTERS
                  </button>
                )}

                <button
                  onClick={
                    downloadRegistrationsPDF
                  }
                  disabled={
                    filteredRegistrations.length ===
                    0
                  }
                  style={{
                    padding: "10px 17px",
                    border: "none",
                    background:
                      filteredRegistrations.length ===
                      0
                        ? "#374151"
                        : "#e63946",
                    color: "#fff",
                    cursor:
                      filteredRegistrations.length ===
                      0
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "800",
                    opacity:
                      filteredRegistrations.length ===
                      0
                        ? 0.6
                        : 1,
                  }}
                >
                  📄 DOWNLOAD PDF
                </button>
              </div>
            </div>

            {(selectedRegistrationSport !==
              "" ||
              selectedRegistrationCategory !==
                "") && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "12px 15px",
                  background: "#111827",
                  border:
                    "1px solid #263044",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                <strong
                  style={{
                    color: "#fff",
                  }}
                >
                  Active Filter:
                </strong>{" "}
                {selectedRegistrationSport
                  ? selectedSportObject?.name ||
                    "Selected Sport"
                  : "All Sports"}{" "}
                →{" "}
                {selectedRegistrationCategory
                  ? selectedCategoryObjectName(
                      registrationCategories,
                      selectedRegistrationCategory
                    )
                  : "All Categories"}
              </div>
            )}

            {filteredRegistrations.length ===
            0 ? (
              <div
                style={{
                  padding: "35px",
                  textAlign: "center",
                  background: "#111827",
                  border:
                    "1px solid #263044",
                  color: "#9ca3af",
                }}
              >
                No registrations found for
                the selected filter.
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>
                        #
                      </th>

                      <th style={thStyle}>
                        Entry
                      </th>

                      <th style={thStyle}>
                        Sport
                      </th>

                      <th style={thStyle}>
                        Category
                      </th>

                      <th style={thStyle}>
                        Department
                      </th>

                      <th style={thStyle}>
                        Type
                      </th>

                      <th style={thStyle}>
                        Players
                      </th>

                      <th style={thStyle}>
                        Mobile No.
                      </th>

                      <th style={thStyle}>
                        Email
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRegistrations.map(
                      (
                        entry,
                        index
                      ) => (
                        <tr
                          key={entry.id}
                        >
                          <td style={tdStyle}>
                            {index + 1}
                          </td>

                          <td style={tdStyle}>
                            {entry.name ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {entry.category
                              ?.sport
                              ?.name ||
                              entry.sport
                                ?.name ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {entry.category
                              ?.name ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {entry.department
                              ?.name ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {entry.entryType ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {Array.isArray(
                              entry.players
                            ) &&
                            entry
                              .players
                              .length >
                              0 ? (
                              entry.players.map(
                                (
                                  p,
                                  playerIndex
                                ) => (
                                  <div
                                    key={
                                      p.id ||
                                      p.playerId ||
                                      playerIndex
                                    }
                                    style={{
                                      marginBottom:
                                        "4px",
                                    }}
                                  >
                                    {p.player
                                      ?.name ||
                                      p.name ||
                                      "-"}
                                  </div>
                                )
                              )
                            ) : (
                              "-"
                            )}
                          </td>

                          <td style={tdStyle}>
                            {getMobileNumber(
                              entry
                            )}
                          </td>

                          <td style={tdStyle}>
                            {getEmail(
                              entry
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* =================================================
            REGISTRATION CONTROL
        ================================================= */}

        {activeTab ===
          "registration-control" && (
          <Section title="Registration Control">
            <p
              style={{
                color: "#9ca3af",
                marginTop: "-5px",
                marginBottom: "25px",
              }}
            >
              Open or close registration
              for each sports category.
            </p>

            {registrationControls.length ===
            0 ? (
              <p
                style={{
                  color: "#9ca3af",
                }}
              >
                No registration categories
                found.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                }}
              >
                {registrationControls.map(
                  (item) => {
                    const status =
                      getRegistrationStatus(
                        item
                      );

                    const category =
                      item.category ||
                      item;

                    const sportName =
                      item.sport?.name ||
                      category.sport
                        ?.name ||
                      "-";

                    const categoryName =
                      item.category?.name ||
                      item.name ||
                      "-";

                    const categoryId =
                      item.categoryId ||
                      item.id;

                    return (
                      <div
                        key={categoryId}
                        style={{
                          background:
                            "#111827",
                          border:
                            "1px solid #263044",
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap: "20px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#facc15",
                                fontWeight:
                                  "800",
                                letterSpacing:
                                  "1px",
                                marginBottom:
                                  "6px",
                              }}
                            >
                              {sportName}
                            </div>

                            <h3
                              style={{
                                margin:
                                  "0 0 8px",
                              }}
                            >
                              {
                                categoryName
                              }
                            </h3>

                            <div
                              style={{
                                color:
                                  "#9ca3af",
                                fontSize:
                                  "14px",
                              }}
                            >
                              Entry Type:{" "}
                              {item.entryType ||
                                category.entryType ||
                                "-"}
                            </div>

                            {item.registrationEnds && (
                              <div
                                style={{
                                  color:
                                    "#9ca3af",
                                  fontSize:
                                    "14px",
                                  marginTop:
                                    "5px",
                                }}
                              >
                                Deadline:{" "}
                                {formatDate(
                                  item.registrationEnds
                                )}
                              </div>
                            )}
                          </div>

                          <StatusBadge
                            status={status}
                          />
                        </div>

                        <div
                          style={{
                            marginTop: "20px",
                            paddingTop:
                              "18px",
                            borderTop:
                              "1px solid #263044",
                          }}
                        >
                          {status !==
                            "OPEN" && (
                            <div
                              style={{
                                marginBottom:
                                  "12px",
                              }}
                            >
                              <label
                                style={{
                                  display:
                                    "block",
                                  color:
                                    "#9ca3af",
                                  fontSize:
                                    "13px",
                                  marginBottom:
                                    "7px",
                                }}
                              >
                                Registration
                                Deadline
                              </label>

                              <input
                                type="datetime-local"
                                value={
                                  deadlineValues[
                                    categoryId
                                  ] || ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  setDeadlineValues(
                                    (
                                      previous
                                    ) => ({
                                      ...previous,
                                      [categoryId]:
                                        e.target
                                          .value,
                                    })
                                  )
                                }
                                style={{
                                  ...inputStyle,
                                  maxWidth:
                                    "300px",
                                  marginTop: 0,
                                }}
                              />
                            </div>
                          )}

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "10px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            {status !==
                              "OPEN" && (
                              <button
                                onClick={() =>
                                  openRegistration(
                                    categoryId
                                  )
                                }
                                style={
                                  primaryButton
                                }
                              >
                                🟢 OPEN
                                REGISTRATION
                              </button>
                            )}

                            {status ===
                              "OPEN" && (
                              <button
                                onClick={() =>
                                  closeRegistration(
                                    categoryId
                                  )
                                }
                                style={
                                  dangerButton
                                }
                              >
                                🔴 CLOSE
                                REGISTRATION
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </Section>
        )}

        {/* =================================================
            DRAW LOTS
        ================================================= */}

        {activeTab === "draws" && (
          <Section title="Draw Lots">
            <p
              style={{
                color: "#9ca3af",
                marginTop: "-5px",
                marginBottom: "25px",
              }}
            >
              Generate and lock knockout draws
              after registration closes.
            </p>

            {/* ==========================================
                DRAW SELECTORS
            ========================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "15px",
                padding: "20px",
                background: "#111827",
                border: "1px solid #263044",
                marginBottom: "20px",
              }}
            >
              {/* SPORT */}

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: "13px",
                    fontWeight: "800",
                    marginBottom: "8px",
                  }}
                >
                  SPORT
                </label>

                <select
                  value={selectedDrawSport}
                  onChange={(e) =>
                    loadDrawCategories(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    background: "#080b14",
                    color: "#fff",
                    border: "1px solid #374151",
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    Select Sport
                  </option>

                  {sports.map((sport) => (
                    <option
                      key={sport.id}
                      value={sport.id}
                    >
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: "13px",
                    fontWeight: "800",
                    marginBottom: "8px",
                  }}
                >
                  CATEGORY
                </label>

                <select
                  value={selectedDrawCategory}
                  onChange={(e) =>
                    loadDrawCategory(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedDrawSport
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    background: "#080b14",
                    color: "#fff",
                    border: "1px solid #374151",
                    cursor:
                      !selectedDrawSport
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      !selectedDrawSport
                        ? 0.6
                        : 1,
                  }}
                >
                  <option value="">
                    Select Category
                  </option>

                  {drawCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* ==========================================
                EMPTY STATE
            ========================================== */}

            {!selectedDrawCategory && (
              <div
                style={{
                  padding: "45px 20px",
                  textAlign: "center",
                  background: "#111827",
                  border:
                    "1px solid #263044",
                  color: "#9ca3af",
                }}
              >
                <div
                  style={{
                    fontSize: "42px",
                    marginBottom: "12px",
                  }}
                >
                  🎲
                </div>

                <h3
                  style={{
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Select a Sport and Category
                </h3>

                <p
                  style={{
                    margin: 0,
                  }}
                >
                  Choose the event for which
                  you want to manage the draw.
                </p>
              </div>
            )}

            {selectedDrawCategory && (
  <div>
    {/* ========================================
        DRAW INFORMATION
    ======================================== */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      <DrawInfoCard
        label="Sport"
        value={
          sports.find(
            (sport) =>
              String(sport.id) ===
              String(selectedDrawSport)
          )?.name || "-"
        }
      />

      <DrawInfoCard
        label="Category"
        value={
          selectedDrawCategoryObject?.name || "-"
        }
      />

      <DrawInfoCard
        label="Registrations"
        value={drawEntries.length}
      />

      <DrawInfoCard
        label="Registration"
        value={drawRegistrationStatus}
      />

      <DrawInfoCard
        label="Draw Status"
        value={
          isAthletics
            ? "NOT APPLICABLE"
            : selectedDraw?.status || "NOT CREATED"
        }
      />
    </div>

    {/* ========================================
    ATHLETICS EVENT
    NO DRAW / NO MATCH
======================================== */}

{isAthletics && (
  <div
    style={{
      padding: "25px",
      background: "#111827",
      border: "1px solid #263044",
      marginBottom: "20px",
    }}
  >
    {/* ATHLETICS HEADER */}
    <div
      style={{
        fontSize: "13px",
        color: "#facc15",
        fontWeight: "800",
        letterSpacing: "1px",
        marginBottom: "8px",
      }}
    >
      ATHLETICS EVENT
    </div>

    <h2
      style={{
        margin: "0 0 10px",
      }}
    >
      {selectedDrawCategoryObject?.name || "Athletics"}
    </h2>

    <p
      style={{
        color: "#9ca3af",
        margin: 0,
        lineHeight: 1.6,
      }}
    >
      Athletics does not use draws or matches.
      The administrator will directly enter the
      1st, 2nd and 3rd position holders after the
      event.
    </p>

    <div
      style={{
        marginTop: "18px",
        padding: "14px",
        background: "#3b2f08",
        border: "1px solid #854d0e",
        color: "#fde68a",
      }}
    >
      🏃 Direct Result Entry is available below.
    </div>

    {/* ========================================
        ATHLETICS REGISTERED ENTRIES
    ======================================== */}

    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        background: "#080b14",
        border: "1px solid #263044",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <h3
          style={{
            margin: 0,
          }}
        >
          Registered Entries
        </h3>

        <span
          style={{
            color: "#facc15",
            fontWeight: "800",
          }}
        >
          {drawEntries.length} Entries
        </span>
      </div>

      {drawEntries.length === 0 ? (
        <p
          style={{
            color: "#9ca3af",
          }}
        >
          No registrations found for this category.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          {drawEntries.map((entry, index) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                padding: "12px 14px",
                background: "#111827",
                border: "1px solid #263044",
              }}
            >
              <div>
                <strong>
                  {index + 1}.{" "}
                  {entry.name || `Entry ${entry.id}`}
                </strong>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {entry.department?.name ||
                    entry.departmentName ||
                    "Department"}
                </div>
              </div>

              <span
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                }}
              >
                #{entry.id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* ========================================
        ATHLETICS DIRECT RESULT ENTRY
    ======================================== */}

    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        background: "#080b14",
        border: "1px solid #263044",
      }}
    >
      <div
        style={{
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#facc15",
            fontWeight: "800",
            letterSpacing: "1px",
            marginBottom: "6px",
          }}
        >
          DIRECT RESULT ENTRY
        </div>

        <h3
          style={{
            margin: 0,
          }}
        >
          {selectedDrawCategoryObject?.name || "Athletics"} Results
        </h3>

        <p
          style={{
            color: "#9ca3af",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          Select the 1st, 2nd and 3rd position holders.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "14px",
        }}
      >
        {/* ========================================
            1ST POSITION
        ======================================== */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
            }}
          >
            🥇 1st Position
          </label>

          <select
            value={athleticsResults.first}
            onChange={(e) =>
              setAthleticsResults((prev) => ({
                ...prev,
                first: e.target.value,
              }))
            }
            style={{
              width: "100%",
              padding: "11px",
              background: "#111827",
              color: "#fff",
              border: "1px solid #263044",
            }}
          >
            <option value="">
              Select 1st position holder
            </option>

            {drawEntries.map((entry) => (
              <option
                key={entry.id}
                value={entry.id}
              >
                {entry.name || `Entry ${entry.id}`}{" "}
                —{" "}
                {entry.department?.name ||
                  entry.departmentName ||
                  "Department"}
              </option>
            ))}
          </select>
        </div>

        {/* ========================================
            2ND POSITION
        ======================================== */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
            }}
          >
            🥈 2nd Position
          </label>

          <select
            value={athleticsResults.second}
            onChange={(e) =>
              setAthleticsResults((prev) => ({
                ...prev,
                second: e.target.value,
              }))
            }
            style={{
              width: "100%",
              padding: "11px",
              background: "#111827",
              color: "#fff",
              border: "1px solid #263044",
            }}
          >
            <option value="">
              Select 2nd position holder
            </option>

            {drawEntries.map((entry) => (
              <option
                key={entry.id}
                value={entry.id}
              >
                {entry.name || `Entry ${entry.id}`}{" "}
                —{" "}
                {entry.department?.name ||
                  entry.departmentName ||
                  "Department"}
              </option>
            ))}
          </select>
        </div>

       {/* ========================================
    3RD POSITION
======================================== */}

<div>
  <label
    style={{
      display: "block",
      marginBottom: "7px",
      fontWeight: "700",
    }}
  >
    🥉 3rd Position
  </label>

  <select
    value={athleticsResults.third}
    onChange={(e) =>
      setAthleticsResults((prev) => ({
        ...prev,
        third: e.target.value,
      }))
    }
    style={{
      width: "100%",
      padding: "11px",
      background: "#111827",
      color: "#fff",
      border: "1px solid #263044",
    }}
  >
    <option value="">
      Select 3rd position holder
    </option>

    {drawEntries.map((entry) => (
      <option
        key={entry.id}
        value={entry.id}
      >
        {entry.name || `Entry ${entry.id}`}{" "}
        —{" "}
        {entry.department?.name ||
          entry.departmentName ||
          "Department"}
      </option>
    ))}
  </select>
</div>
{/* ========================================
    SAVE RESULT
======================================== */}

<button
  type="button"
  disabled={
    savingAthleticsResults ||
    !athleticsResults.first ||
    !athleticsResults.second ||
    !athleticsResults.third ||
    athleticsResults.first ===
      athleticsResults.second ||
    athleticsResults.first ===
      athleticsResults.third ||
    athleticsResults.second ===
      athleticsResults.third
  }
  onClick={async () => {
  const first = Number(
    athleticsResults.first
  );

  const second = Number(
    athleticsResults.second
  );

  const third = Number(
    athleticsResults.third
  );

  if (!first || !second || !third) {
    alert(
      "Please select 1st, 2nd and 3rd positions."
    );
    return;
  }

  if (
    first === second ||
    first === third ||
    second === third
  ) {
    alert(
      "The same participant cannot have multiple positions."
    );
    return;
  }

  if (!selectedDrawCategory) {
    setError(
      "Please select an Athletics category."
    );
    return;
  }

  setSavingAthleticsResults(true);
  setError("");
  setMessage("");

  try {
    const response = await adminFetch(
      `${API_URL}/results/athletics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: Number(
            selectedDrawCategory
          ),
          firstEntryId: first,
          secondEntryId: second,
          thirdEntryId: third,
          year: "2026-27",
        }),
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Failed to save Athletics results."
      );
    }

    setMessage(
      "Athletics results saved successfully. Points awarded: 5 / 3 / 1."
    );

    await fetchAdminData();

  } catch (err) {
    console.error(
      "Athletics result save error:",
      err
    );

    setError(
      err.message ||
        "Failed to save Athletics results."
    );

  } finally {
    setSavingAthleticsResults(
      false
    );
  }
}}
  style={{
    marginTop: "8px",
    padding: "12px 18px",
    border: "none",
    borderRadius: "6px",
    background:
      savingAthleticsResults ||
      !athleticsResults.first ||
      !athleticsResults.second ||
      !athleticsResults.third ||
      athleticsResults.first ===
        athleticsResults.second ||
      athleticsResults.first ===
        athleticsResults.third ||
      athleticsResults.second ===
        athleticsResults.third
        ? "#374151"
        : "#facc15",
    color:
      savingAthleticsResults ||
      !athleticsResults.first ||
      !athleticsResults.second ||
      !athleticsResults.third ||
      athleticsResults.first ===
        athleticsResults.second ||
      athleticsResults.first ===
        athleticsResults.third ||
      athleticsResults.second ===
        athleticsResults.third
        ? "#9ca3af"
        : "#111827",
    fontWeight: "800",
    cursor:
      savingAthleticsResults ||
      !athleticsResults.first ||
      !athleticsResults.second ||
      !athleticsResults.third ||
      athleticsResults.first ===
        athleticsResults.second ||
      athleticsResults.first ===
        athleticsResults.third ||
      athleticsResults.second ===
        athleticsResults.third
        ? "not-allowed"
        : "pointer",
  }}
>
  {savingAthleticsResults
    ? "SAVING..."
    : "SAVE ATHLETICS RESULT"}
</button>

     </div>
   </div>
 </div>
 )}

        {/* ========================================
            REGISTRATION STATUS WARNING
        ======================================== */}

        {!isAthletics &&
          drawRegistrationStatus !== "CLOSED" && (
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                background: "#3b2f08",
                border: "1px solid #854d0e",
                color: "#fde68a",
              }}
            >
              <strong>
                ⚠ Registration is{" "}
                {drawRegistrationStatus}
              </strong>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "14px",
                }}
              >
                Close registration before
                generating the draw.
              </div>
            </div>
          )}

        {/* ========================================
            ENTRY LIST
        ======================================== */}

        {!isAthletics && (
        <div
          style={{
            background: "#111827",
            border: "1px solid #263044",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                margin: 0,
              }}
            >
              Registered Entries
            </h3>

            <span
              style={{
                color: "#facc15",
                fontWeight: "800",
              }}
            >
              {drawEntries.length} Entries
            </span>
          </div>

          {drawEntries.length === 0 ? (
            <p
              style={{
                color: "#9ca3af",
              }}
            >
              No registrations found for this
              category.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "8px",
              }}
            >
              {drawEntries.map(
                (entry, index) => (
                  <div
                    key={entry.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                      padding: "12px 14px",
                      background: "#080b14",
                      border:
                        "1px solid #263044",
                    }}
                  >
                    <div>
                      <strong>
                        {index + 1}.{" "}
                        {entry.name ||
                          `Entry ${entry.id}`}
                      </strong>

                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                          marginTop: "4px",
                        }}
                      >
                        {entry.department?.name ||
                          entry.departmentName ||
                          "Department"}
                      </div>
                    </div>

                    <span
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                      }}
                    >
                      #{entry.id}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
        )}

    {!isAthletics && (
      <div>
        
                {/* ========================================
                    DRAW ACTIONS
                ======================================== */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "25px",
                  }}
                >
                  {!isAthletics && !selectedDraw && (
                    <button
                      onClick={createDraw}
                      disabled={
                        drawLoading ||
                        drawRegistrationStatus !== "CLOSED" ||
                        drawEntries.length < 2
                      }
                      style={{
                        ...primaryButton,
                        opacity:
                          drawLoading ||
                          drawRegistrationStatus !== "CLOSED" ||
                          drawEntries.length < 2
                            ? 0.5
                            : 1,
                        cursor:
                          drawLoading ||
                          drawRegistrationStatus !== "CLOSED" ||
                          drawEntries.length < 2
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      🎲 CREATE DRAW
                    </button>
                  )}

                  {!isAthletics &&
                    selectedDraw?.status === "DRAFT" && (
                      <button
                        onClick={generateDraw}
                        disabled={
                          drawLoading ||
                          drawRegistrationStatus !== "CLOSED"
                        }
                        style={{
                          ...primaryButton,
                          opacity:
                            drawLoading ||
                            drawRegistrationStatus !== "CLOSED"
                              ? 0.5
                              : 1,
                          cursor:
                            drawLoading ||
                            drawRegistrationStatus !== "CLOSED"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        🎲 GENERATE LOTS
                      </button>
                    )}
                      {!isAthletics &&
                        selectedDraw?.status === "GENERATED" && (
                          <button
                            onClick={lockDraw}
                            disabled={drawLoading}
                            style={{
                              ...primaryButton,
                              opacity: drawLoading ? 0.5 : 1,
                              cursor: drawLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            🔒 LOCK DRAW
                          </button>
                        )}
                  {!isAthletics && selectedDraw && (
                    <button
                      onClick={downloadDrawPDF}
                      disabled={drawLoading}
                      style={{
                        ...secondaryButton,
                        opacity: drawLoading ? 0.5 : 1,
                      }}
                    >
                      📄 DOWNLOAD DRAW PDF
                    </button>
                  )}

                  {!isAthletics &&
                    selectedDraw &&
                    (selectedDraw.status === "GENERATED" ||
                      selectedDraw.status === "LOCKED") && (
                      <button
                        onClick={resetDraw}
                        disabled={drawLoading}
                        style={{
                          ...secondaryButton,
                          opacity: drawLoading ? 0.5 : 1,
                          border: "1px solid #ef4444",
                          color: "#fca5a5",
                        }}
                      >
                        ♻️ RESET / REGENERATE
                      </button>
                    )}

                  {!isAthletics && selectedDraw && (
                    <button
                      onClick={() =>
                        loadDrawCategory(selectedDrawCategory)
                      }
                      disabled={drawLoading}
                      style={secondaryButton}
                    >
                      ↻ REFRESH DRAW
                    </button>
                  )}
                </div>
                {/* ========================================
                    DRAW STATUS
                ======================================== */}

                {!isAthletics && selectedDraw && (
                <div
                  style={{
                    padding: "15px",
                    marginBottom: "20px",
                    background: "#111827",
                    border: "1px solid #263044",
                }}
                >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "15px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#9ca3af",
                            marginBottom:
                              "5px",
                          }}
                        >
                          DRAW
                        </div>

                        <strong
                          style={{
                            fontSize:
                              "18px",
                          }}
                        >
                          {selectedDraw.name ||
                            `${selectedDrawCategoryObject?.name} Draw`}
                        </strong>
                      </div>

                      <DrawStatusBadge
                        status={
                          selectedDraw.status
                        }
                      />
                    </div>

                    {selectedDraw.createdAt && (
                      <div
                        style={{
                          marginTop:
                            "10px",
                          color:
                            "#6b7280",
                          fontSize:
                            "13px",
                        }}
                      >
                        Created:{" "}
                        {formatDate(
                          selectedDraw.createdAt
                        )}
                      </div>
                    )}

                    {selectedDraw.lockedAt && (
                      <div
                        style={{
                          marginTop:
                            "5px",
                          color:
                            "#86efac",
                          fontSize:
                            "13px",
                        }}
                      >
                        Locked:{" "}
                        {formatDate(
                          selectedDraw.lockedAt
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================
    BRACKET
======================================== */}

{!isAthletics &&
  selectedDraw &&
  Array.isArray(
    selectedDraw.rounds
  ) &&
  selectedDraw.rounds.length >
    0 && (
    <div>
      <h3
        style={{
          marginBottom: "15px",
        }}
      >
        Tournament Bracket
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            `repeat(${selectedDraw.rounds.length}, minmax(230px, 1fr))`,
          gap: "15px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {selectedDraw.rounds.map(
          (round) => (
            <div
              key={round.id}
              style={{
                minWidth: "230px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#e63946",
                  color: "#fff",
                  fontWeight: "900",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                {round.name ||
                  `Round ${round.roundNo}`}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {(round.matches || []).map(
                  (
                    match,
                    matchIndex
                  ) => (
                    <BracketMatch
                      key={match.id}
                      match={match}
                      index={matchIndex}
                    />
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )}
                {/* ========================================
                    GENERATED BUT NO ROUNDS
                ======================================== */}

                {selectedDraw &&
                  selectedDraw.status !==
                    "DRAFT" &&
                  (!Array.isArray(
                    selectedDraw.rounds
                  ) ||
                    selectedDraw.rounds
                      .length ===
                      0) && (
                    <div
                      style={{
                        padding:
                          "30px",
                        textAlign:
                          "center",
                        background:
                          "#111827",
                        border:
                          "1px solid #263044",
                        color:
                          "#9ca3af",
                      }}
                    >
                      Draw data exists, but
                      no bracket rounds were
                      returned.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          </Section>
        )}
        {/* =================================================
    MATCHES
================================================= */}

{activeTab === "matches" && (() => {
  const selectedSportMatches = selectedMatchSport
    ? matches.filter(
        (match) =>
          String(match.sport?.id) ===
          String(selectedMatchSport)
      )
    : matches;

  const filteredMatches = selectedMatchCategory
    ? selectedSportMatches.filter(
        (match) =>
          String(match.category?.id) ===
          String(selectedMatchCategory)
      )
    : selectedSportMatches;

  const finalMatches =
    matchStatusFilter === "ALL"
      ? filteredMatches
      : filteredMatches.filter(
          (match) =>
            match.status === matchStatusFilter
        );

  return (
    <Section
      title={`Matches (${finalMatches.length})`}
    >
      {/* FILTERS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
          padding: "18px",
          background: "#111827",
          borderRadius: "12px",
        }}
      >
        {/* SPORT */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#facc15",
              fontWeight: "600",
            }}
          >
            SPORT
          </label>

          <select
            value={selectedMatchSport}
            onChange={(e) => {
              setSelectedMatchSport(e.target.value);
              setSelectedMatchCategory("");
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
            }}
          >
            <option value="">
              All Sports
            </option>

            {sports.map((sport) => (
              <option
                key={sport.id}
                value={sport.id}
              >
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#facc15",
              fontWeight: "600",
            }}
          >
            CATEGORY
          </label>

          <select
            value={selectedMatchCategory}
            onChange={(e) =>
              setSelectedMatchCategory(
                e.target.value
              )
            }
            disabled={!selectedMatchSport}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: selectedMatchSport
                ? "#1f2937"
                : "#374151",
              color: "white",
              opacity: selectedMatchSport
                ? 1
                : 0.6,
            }}
          >
            <option value="">
              All Categories
            </option>

            {[
                ...new Map(
                  selectedSportMatches
                    .filter((match) => match.category)
                    .map((match) => [
                      match.category.id,
                      match.category,
                    ])
                ).values(),
              ].map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#facc15",
              fontWeight: "600",
            }}
          >
            STATUS
          </label>

          <select
            value={matchStatusFilter}
            onChange={(e) =>
              setMatchStatusFilter(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
            }}
          >
            <option value="ALL">
              All
            </option>

            <option value="UPCOMING">
              Upcoming
            </option>

            <option value="LIVE">
              Live
            </option>

            <option value="COMPLETED">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* MATCH LIST */}
      {finalMatches.length === 0 ? (
        <p
          style={{
            color: "#9ca3af",
          }}
        >
          No matches found for the selected
          filters.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {finalMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onStart={startMatch}
              onScore={setSelectedMatch}
              onComplete={openCompleteMatch}
              onSchedule={scheduleMatch}
            />
          ))}
        </div>
      )}
    </Section>
  );
})()}

      {/* =================================================
    WINNERS / RESULTS
================================================= */}

{activeTab === "results" && (() => {
  // -------------------------------------------------
  // FILTER RESULTS
  // -------------------------------------------------

  const filteredResults = results.filter((result) => {
    const categoryId = result.category?.id;

    // Find the sport which owns this category
    const resultSport = sports.find((sport) =>
      (sport.categories || []).some(
        (category) =>
          String(category.id) === String(categoryId)
      )
    );

    const sportId = resultSport?.id;

    const sportMatches =
      selectedResultSport === "" ||
      String(sportId) === String(selectedResultSport);

    const categoryMatches =
      selectedResultCategory === "" ||
      String(categoryId) ===
        String(selectedResultCategory);

    return sportMatches && categoryMatches;
  });

  // -------------------------------------------------
  // AVAILABLE CATEGORIES
  // -------------------------------------------------

  const selectedSportObject = sports.find(
    (sport) =>
      String(sport.id) ===
      String(selectedResultSport)
  );

  const availableCategories =
    selectedResultSport === ""
      ? []
      : selectedSportObject?.categories || [];

  return (
    <Section
      title={`Winners / Results (${filteredResults.length})`}
    >
      {/* =================================================
          FILTERS
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
          padding: "18px",
          background: "#111827",
          borderRadius: "12px",
        }}
      >
        {/* =================================================
            SPORT FILTER
        ================================================= */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#facc15",
              fontWeight: "600",
            }}
          >
            SPORT
          </label>

          <select
            value={selectedResultSport}
            onChange={(e) => {
              setSelectedResultSport(e.target.value);
              setSelectedResultCategory("");
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
            }}
          >
            <option value="">
              All Sports
            </option>

            {sports.map((sport) => (
              <option
                key={sport.id}
                value={sport.id}
              >
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        {/* =================================================
            CATEGORY FILTER
        ================================================= */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              color: "#facc15",
              fontWeight: "600",
            }}
          >
            CATEGORY
          </label>

          <select
            value={selectedResultCategory}
            onChange={(e) =>
              setSelectedResultCategory(
                e.target.value
              )
            }
            disabled={!selectedResultSport}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: selectedResultSport
                ? "#1f2937"
                : "#374151",
              color: "white",
              opacity: selectedResultSport
                ? 1
                : 0.6,
            }}
          >
            <option value="">
              All Categories
            </option>

            {availableCategories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* =================================================
          RESULTS
      ================================================= */}

      {resultsLoading ? (
        <p
          style={{
            color: "#9ca3af",
          }}
        >
          Loading results...
        </p>
      ) : filteredResults.length === 0 ? (
        <p
          style={{
            color: "#9ca3af",
          }}
        >
          No results found.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {filteredResults.map(
            (result) => {
              // Find sport for this result
              const resultSport = sports.find(
                (sport) =>
                  (sport.categories || []).some(
                    (category) =>
                      String(category.id) ===
                      String(result.category?.id)
                  )
              );

              return (
                <div
                  key={result.id}
                  style={{
                    padding: "18px",
                    borderRadius: "12px",
                    background: "#111827",
                    border:
                      "1px solid #374151",
                  }}
                >
                  {/* =================================================
                      HEADER
                  ================================================= */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <strong
                      style={{
                        color: "white",
                        fontSize: "17px",
                      }}
                    >
                      {resultSport?.name ||
                        result.category?.sport
                          ?.name ||
                        "Sport"}
                    </strong>

                    <span
                      style={{
                        color: "#facc15",
                        fontWeight: "600",
                      }}
                    >
                      {result.category?.name ||
                        "Category"}
                    </span>
                  </div>

                  {/* =================================================
                      RESULT DETAILS
                  ================================================= */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {/* POSITION */}

                    <div>
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        POSITION
                      </span>

                      <div
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: "18px",
                        }}
                      >
                        {result.position === 1
                          ? "🥇 1st"
                          : result.position === 2
                          ? "🥈 2nd"
                          : result.position === 3
                          ? "🥉 3rd"
                          : `${result.position}th`}
                      </div>
                    </div>

                    {/* ENTRY */}

                    <div>
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        ENTRY
                      </span>

                      <div
                        style={{
                          color: "white",
                          fontWeight: "600",
                        }}
                      >
                        {result.entry?.name ||
                          `Entry #${result.entryId}`}
                      </div>
                    </div>

                    {/* DEPARTMENT */}

                    <div>
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        DEPARTMENT
                      </span>

                      <div
                        style={{
                          color: "white",
                          fontWeight: "600",
                        }}
                      >
                        {result.entry?.department
                          ?.name || "-"}
                      </div>
                    </div>

                    {/* POINTS */}

                    <div>
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        POINTS
                      </span>

                      <div
                        style={{
                          color: "#facc15",
                          fontWeight: "700",
                          fontSize: "18px",
                        }}
                      >
                        {result.pointsAwarded ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </Section>
  );
})()}
        {/* =================================================
            POINT TABLE
        ================================================= */}

        {activeTab === "points" && (
          <Section title="Point Table">
            {pointTable.length === 0 ? (
              <p
                style={{
                  color: "#9ca3af",
                }}
              >
                No point table data
                found.
              </p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>
                        #
                      </th>

                      <th style={thStyle}>
                        Department
                      </th>

                      <th style={thStyle}>
                        Points
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pointTable.map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            row.id ||
                            index
                          }
                        >
                          <td style={tdStyle}>
                            {index + 1}
                          </td>

                          <td style={tdStyle}>
                            {row
                              .department
                              ?.name ||
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
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* =================================================
            SCORE MODAL
        ================================================= */}

        {selectedMatch && (
          <div
            style={modalOverlay}
          >
            <div
              style={modalBox}
            >
              <h2>
                Update Score
              </h2>

              <p
                style={{
                  color: "#9ca3af",
                }}
              >
                Match #
                {
                  selectedMatch.id
                }
              </p>

              <div
                style={{
                  marginBottom:
                    "20px",
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
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "15px",
                  margin:
                    "25px 0",
                }}
              >
                <div>
                  <label>
                    Score A
                  </label>

                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) =>
                      setScoreA(
                        e.target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Score B
                  </label>

                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) =>
                      setScoreB(
                        e.target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => {
                    setSelectedMatch(
                      null
                    );
                    setScoreA("");
                    setScoreB("");
                  }}
                  style={
                    secondaryButton
                  }
                >
                  CANCEL
                </button>

                <button
                  onClick={
                    updateScore
                  }
                  style={
                    primaryButton
                  }
                >
                  UPDATE SCORE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            COMPLETE MATCH MODAL
        ================================================= */}

        {completeMatchData && (
          <div
            style={
              modalOverlay
            }
          >
            <div
              style={modalBox}
            >
              <div
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#facc15",
                  fontWeight:
                    "800",
                  letterSpacing:
                    "1px",
                }}
              >
                MATCH #
                {
                  completeMatchData.id
                }
              </div>

              <h2
                style={{
                  marginTop:
                    "8px",
                }}
              >
                Complete Match
              </h2>

              <p
                style={{
                  color:
                    "#9ca3af",
                }}
              >
                Select the winner
                before recording
                the result.
              </p>

              <div
                style={{
                  background:
                    "#080b14",
                  border:
                    "1px solid #263044",
                  padding:
                    "18px",
                  margin:
                    "20px 0",
                }}
              >
                <div
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <strong>
                    {getEntryName(
                      completeMatchData.entryA,
                      completeMatchData.entryAId,
                      "Entry A"
                    )}
                  </strong>

                  <span
                    style={{
                      margin:
                        "0 12px",
                      color:
                        "#6b7280",
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
                  completeMatchData.scoreA !==
                    undefined ||
                  completeMatchData.scoreB !==
                    undefined) && (
                  <div
                    style={{
                      color:
                        "#9ca3af",
                      fontSize:
                        "14px",
                    }}
                  >
                    Score:{" "}
                    {completeMatchData
                      .score
                      ?.scoreA ??
                      completeMatchData.scoreA ??
                      "-"}{" "}
                    -{" "}
                    {completeMatchData
                      .score
                      ?.scoreB ??
                      completeMatchData.scoreB ??
                      "-"}
                  </div>
                )}
              </div>

              <label
                style={{
                  display:
                    "block",
                  marginBottom:
                    "8px",
                  fontWeight:
                    "700",
                }}
              >
                Winner
              </label>

              <select
                value={
                  winnerEntryId
                }
                onChange={(e) =>
                  setWinnerEntryId(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "13px",
                  background:
                    "#080b14",
                  color:
                    "#fff",
                  border:
                    "1px solid #374151",
                  marginBottom:
                    "20px",
                }}
              >
                <option value="">
                  Select winner
                </option>

                {completeMatchData.entryAId && (
                  <option
                    value={
                      completeMatchData.entryAId
                    }
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
                    value={
                      completeMatchData.entryBId
                    }
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
                  display:
                    "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => {
                    setCompleteMatchData(
                      null
                    );
                    setWinnerEntryId(
                      ""
                    );
                  }}
                  style={
                    secondaryButton
                  }
                >
                  CANCEL
                </button>

                <button
                  onClick={
                    completeMatch
                  }
                  style={
                    primaryButton
                  }
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
// REGISTRATION STATUS HELPER
// ======================================================

function getRegistrationStatus(item) {
  if (!item) return "CLOSED";

  const status =
    item.registrationStatus ||
    item.category
      ?.registrationStatus ||
    "CLOSED";

  const ends =
    item.registrationEnds ||
    item.category?.registrationEnds;

  if (status === "CLOSED") {
    return "CLOSED";
  }

  if (
    ends &&
    new Date(ends).getTime() <=
      Date.now()
  ) {
    return "CLOSED";
  }

  if (status !== "OPEN") {
    return "CLOSED";
  }

  if (ends) {
    const remaining =
      new Date(ends).getTime() -
      Date.now();

    if (
      remaining <=
      24 * 60 * 60 * 1000
    ) {
      return "CLOSING_SOON";
    }
  }

  return "OPEN";
}

// ======================================================
// CATEGORY NAME HELPER
// ======================================================

function selectedCategoryObjectName(
  categories,
  categoryId
) {
  const category = categories.find(
    (item) =>
      String(item.id) ===
      String(categoryId)
  );

  return (
    category?.name ||
    "Selected Category"
  );
}

// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "-";
  }

  return parsed.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <div
      style={{
        background: "#111827",
        border:
          "1px solid #263044",
        padding: "22px",
      }}
    >
      <div
        style={{
          fontSize: "28px",
        }}
      >
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

      <div
        style={{
          color: "#9ca3af",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ======================================================
// DRAW INFO CARD
// ======================================================

function DrawInfoCard({
  label,
  value,
}) {
  const isClosed =
    value === "CLOSED";

  const isOpen =
    value === "OPEN" ||
    value === "CLOSING_SOON";

  return (
    <div
      style={{
        background: "#111827",
        border:
          "1px solid #263044",
        padding: "18px",
      }}
    >
      <div
        style={{
          color: "#9ca3af",
          fontSize: "12px",
          fontWeight: "800",
          letterSpacing: "1px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            isClosed
              ? "#86efac"
              : isOpen
              ? "#fde68a"
              : "#fff",
          fontWeight: "900",
          fontSize: "18px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ======================================================
// DRAW STATUS BADGE
// ======================================================

function DrawStatusBadge({
  status,
}) {
  let background = "#351519";
  let color = "#fca5a5";
  let label =
    status || "NOT CREATED";

  if (status === "DRAFT") {
    background = "#3b2f08";
    color = "#fde68a";
    label = "DRAFT";
  }

  if (status === "GENERATED") {
    background = "#12351f";
    color = "#86efac";
    label = "GENERATED";
  }

  if (status === "LOCKED") {
    background = "#172554";
    color = "#93c5fd";
    label = "LOCKED";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "8px 13px",
        background,
        color,
        border:
          "1px solid currentColor",
        fontSize: "12px",
        fontWeight: "900",
        letterSpacing: "1px",
      }}
    >
      {label}
    </span>
  );
}

// ======================================================
// BRACKET MATCH
// ======================================================

function BracketMatch({
  match,

}) {
  const entryAName =
    getEntryName(
      match.entryA,
      match.entryAId,
      "BYE"
    );

  const entryBName =
    getEntryName(
      match.entryB,
      match.entryBId,
      "BYE"
    );

  const winnerId =
    match.winnerEntryId ||
    match.winnerEntry?.id;

  const scoreA =
    match.score?.scoreA ??
    match.scoreA ??
    null;

  const scoreB =
    match.score?.scoreB ??
    match.scoreB ??
    null;

  const status =
    match.status ||
    "SCHEDULED";

  return (
    <div
      style={{
        background: "#111827",
        border:
          "1px solid #263044",
        padding: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "10px",
          color: "#6b7280",
          fontSize: "11px",
        }}
      >
        <span>
          MATCH #{match.id}
        </span>

        <span
          style={{
            color:
              status ===
              "COMPLETED"
                ? "#86efac"
                : status ===
                  "LIVE"
                ? "#f87171"
                : "#facc15",
            fontWeight: "800",
          }}
        >
          {status}
        </span>
      </div>

      <BracketEntry
        name={entryAName}
        score={scoreA}
        isWinner={
          String(winnerId) ===
          String(match.entryAId)
        }
      />

      <div
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "11px",
          padding: "5px 0",
          fontWeight: "800",
        }}
      >
        VS
      </div>

      <BracketEntry
        name={entryBName}
        score={scoreB}
        isWinner={
          String(winnerId) ===
          String(match.entryBId)
        }
      />

      {match.nextMatchId && (
        <div
          style={{
            marginTop: "10px",
            paddingTop: "8px",
            borderTop:
              "1px solid #263044",
            color: "#6b7280",
            fontSize: "10px",
          }}
        >
          Advances to Match #
          {match.nextMatchId}
        </div>
      )}
    </div>
  );
}

// ======================================================
// BRACKET ENTRY
// ======================================================

function BracketEntry({
  name,
  score,
  isWinner,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        gap: "10px",
        padding: "9px 10px",
        background:
          isWinner
            ? "#12351f"
            : "#080b14",
        border:
          isWinner
            ? "1px solid #26733c"
            : "1px solid #263044",
      }}
    >
      <span
        style={{
          fontWeight:
            isWinner
              ? "900"
              : "600",
          color:
            name === "BYE"
              ? "#6b7280"
              : "#fff",
        }}
      >
        {name}
      </span>

      {score !== null &&
        score !== undefined && (
          <strong>
            {score}
          </strong>
        )}
    </div>
  );
}

// ======================================================
// SECTION
// ======================================================

function Section({
  title,
  children,
}) {
  return (
    <section
      style={{
        background: "#0f172a",
        border:
          "1px solid #263044",
        padding: "25px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}) {
  let background = "#351519";
  let color = "#fca5a5";
  let label = "CLOSED";

  if (status === "OPEN") {
    background = "#12351f";
    color = "#86efac";
    label = "OPEN";
  }

  if (
    status ===
    "CLOSING_SOON"
  ) {
    background = "#3b2f08";
    color = "#fde68a";
    label =
      "CLOSING SOON";
  }

  return (
    <div
      style={{
        display:
          "inline-block",
        padding:
          "8px 13px",
        background,
        color,
        border:
          "1px solid currentColor",
        fontSize:
          "12px",
        fontWeight:
          "900",
        letterSpacing:
          "1px",
      }}
    >
      {label}
    </div>
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
  onSchedule,
}) {
  const status =
    match.status ||
    "SCHEDULED";

  const isBronzeMatch =
  match.matchNumber === "Bronze Match";

const roundName = isBronzeMatch
  ? "🥉 Bronze Match"
  : match.round?.name ||
    match.roundName ||
    (match.round?.roundNo
      ? `Round ${match.round.roundNo}`
      : "Match");

  const entryAName =
  getEntryName(
    match.entryA,
    match.entryAId,
    isBronzeMatch
      ? "Waiting for Semi Final"
      : "Waiting for previous match"
  );

const entryBName =
  getEntryName(
    match.entryB,
    match.entryBId,
    isBronzeMatch
      ? "Waiting for Semi Final"
      : "Waiting for previous match"
  );

  const scoreA =
    match.score?.scoreA ??
    match.scoreA ??
    null;

  const scoreB =
    match.score?.scoreB ??
    match.scoreB ??
    null;

    const [showSchedule, setShowSchedule] =
  useState(false);

const [scheduledAt, setScheduledAt] =
  useState(
    match.scheduledAt
      ? new Date(match.scheduledAt)
          .toISOString()
          .slice(0, 16)
      : ""
  );

const [venue, setVenue] =
  useState(match.venue || "");

const [savingSchedule, setSavingSchedule] =
  useState(false);
  

  const saveSchedule = async () => {
    if (!scheduledAt) {
      alert(
        "Please select date and time."
      );
      return;
    }

    setSavingSchedule(true);

    try {
      await onSchedule(
        match.id,
        scheduledAt,
        venue
      );

      setShowSchedule(false);
    } catch (error) {
      console.error(
        "Schedule error:",
        error
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  const clearSchedule = async () => {
    const confirmed =
      window.confirm(
        "Clear the scheduled date, time and venue for this match?"
      );

    if (!confirmed) {
      return;
    }

    setSavingSchedule(true);

    try {
      await onSchedule(
        match.id,
        null,
        null
      );

      setScheduledAt("");
      setVenue("");
      setShowSchedule(false);
    } catch (error) {
      console.error(
        "Clear schedule error:",
        error
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#111827",
        border:
          "1px solid #263044",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
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
            {" VS "}
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

      {/* ================================================== */}
      {/* SCHEDULE INFORMATION */}
      {/* ================================================== */}

      <div
        style={{
          marginTop: "18px",
          padding: "14px",
          background: "#080b14",
          border:
            "1px solid #263044",
          display: "flex",
          gap: "25px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            SCHEDULE
          </div>

          <div
            style={{
              marginTop: "4px",
              color: match.scheduledAt
                ? "#e5e7eb"
                : "#6b7280",
              fontWeight: "600",
            }}
          >
            {match.scheduledAt
              ? new Date(
                  match.scheduledAt
                ).toLocaleString(
                  "en-IN"
                )
              : "Not scheduled"}
          </div>
        </div>

        <div>
          <div
            style={{
              color: "#6b7280",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            VENUE
          </div>

          <div
            style={{
              marginTop: "4px",
              color: match.venue
                ? "#e5e7eb"
                : "#6b7280",
              fontWeight: "600",
            }}
          >
            {match.venue ||
              "Not assigned"}
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* SCORE */}
      {/* ================================================== */}

      {(scoreA !== null ||
        scoreB !== null) && (
        <div
          style={{
            display: "flex",
            gap: "25px",
            marginTop: "18px",
            padding: "15px",
            background: "#080b14",
            border:
              "1px solid #263044",
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

      {/* ================================================== */}
      {/* SCHEDULE EDITOR */}
      {/* ================================================== */}

      {showSchedule &&
        status !== "COMPLETED" && (
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              background: "#0b1020",
              border:
                "1px solid #374151",
            }}
          >
            <div
              style={{
                fontWeight: "800",
                marginBottom: "14px",
                color: "#facc15",
              }}
            >
              SCHEDULE MATCH
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#9ca3af",
                    fontSize: "13px",
                  }}
                >
                  DATE & TIME
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) =>
                    setScheduledAt(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "#111827",
                    color: "#fff",
                    border:
                      "1px solid #374151",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#9ca3af",
                    fontSize: "13px",
                  }}
                >
                  VENUE
                </label>

                <input
                  type="text"
                  value={venue}
                  onChange={(e) =>
                    setVenue(
                      e.target.value
                    )
                  }
                  placeholder="Enter venue"
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "#111827",
                    color: "#fff",
                    border:
                      "1px solid #374151",
                    borderRadius: "6px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={
                    saveSchedule
                  }
                  disabled={
                    savingSchedule
                  }
                  style={
                    primaryButton
                  }
                >
                  {savingSchedule
                    ? "SAVING..."
                    : "SAVE SCHEDULE"}
                </button>

                <button
                  onClick={
                    clearSchedule
                  }
                  disabled={
                    savingSchedule
                  }
                  style={
                    secondaryButton
                  }
                >
                  CLEAR SCHEDULE
                </button>

                <button
                  onClick={() =>
                    setShowSchedule(
                      false
                    )
                  }
                  style={{
                    ...secondaryButton,
                    opacity: 0.8,
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ================================================== */}
      {/* ACTIONS */}
      {/* ================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "18px",
        }}
      >
        {status !== "COMPLETED" && (
          <button
            onClick={() =>
              setShowSchedule(
                (prev) => !prev
              )
            }
            style={
              secondaryButton
            }
          >
            {showSchedule
              ? "CLOSE SCHEDULE"
              : match.scheduledAt
              ? "EDIT SCHEDULE"
              : "SCHEDULE MATCH"}
          </button>
        )}

        {status !== "LIVE" &&
              status !== "COMPLETED" &&
              match.entryAId &&
              match.entryBId && (
            <button
              onClick={() =>
                onStart(
                  match.id
                )
              }
              style={
                primaryButton
              }
            >
              START MATCH
            </button>
          )}

        {status === "LIVE" && (
          <>
            <button
              onClick={() =>
                onScore(
                  match
                )
              }
              style={
                primaryButton
              }
            >
              UPDATE SCORE
            </button>

            <button
              onClick={() =>
                onComplete(
                  match
                )
              }
              style={
                secondaryButton
              }
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

function getEntryName(
  entry,
  entryId,
  fallback
) {
  if (!entry) {
    return entryId
      ? `Entry ${entryId}`
      : fallback;
  }

  return (
    entry.name ||
    entry.department
      ?.name ||
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
  position:
    "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,.8)",
  display:
    "flex",
  alignItems:
    "center",
  justifyContent:
    "center",
  padding: "20px",
  zIndex: 9999,
};

const modalBox = {
  width: "100%",
  maxWidth: "500px",
  background:
    "#111827",
  padding: "30px",
  border:
    "1px solid #374151",
};

// ======================================================
// TABLE STYLES
// ======================================================

const thStyle = {
  textAlign:
    "left",
  padding:
    "13px",
  borderBottom:
    "1px solid #374151",
  color:
    "#9ca3af",
  fontSize:
    "13px",
};

const tdStyle = {
  padding:
    "14px 13px",
  borderBottom:
    "1px solid #1f2937",
  verticalAlign:
    "top",
};

const inputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  padding:
    "12px",
  marginTop:
    "7px",
  background:
    "#080b14",
  color:
    "#fff",
  border:
    "1px solid #374151",
};

const primaryButton = {
  padding:
    "11px 16px",
  border:
    "none",
  background:
    "#e63946",
  color:
    "#fff",
  fontWeight:
    "800",
  cursor:
    "pointer",
};

const secondaryButton = {
  padding:
    "11px 16px",
  border:
    "1px solid #374151",
  background:
    "transparent",
  color:
    "#fff",
  fontWeight:
    "700",
  cursor:
    "pointer",
};

const dangerButton = {
  padding:
    "11px 16px",
  border:
    "none",
  background:
    "#991b1b",
  color:
    "#fff",
  fontWeight:
    "800",
  cursor:
    "pointer",
};

export default Admin;

