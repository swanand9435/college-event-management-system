import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SportsRegistration.css";

const API_URL = "http://localhost:5000/api";

export default function SportsRegistration() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    departmentId: "",
    teamName: "",

    player1: {
      name: "",
      year: "",
      mobile: "",
      email: "",
    },

    player2: {
      name: "",
      year: "",
      mobile: "",
      email: "",
    },
  });

  /* =====================================================
     LOAD CATEGORY
  ===================================================== */

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/categories/${categoryId}`
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.message || "Unable to load event."
          );
        }

        setCategory(json.data);
      } catch (err) {
        console.error("Category error:", err);
        setError(
          err.message || "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  /* =====================================================
     LOAD DEPARTMENTS
  ===================================================== */

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetch(
          `${API_URL}/departments`
        );

        const json = await response.json();

        if (!response.ok) {
          throw new Error(
            "Unable to load departments."
          );
        }

        if (Array.isArray(json.data)) {
          setDepartments(json.data);
        } else if (Array.isArray(json)) {
          setDepartments(json);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error(
          "Department error:",
          err
        );
      }
    };

    loadDepartments();
  }, []);

  /* =====================================================
     USER PREFILL
  ===================================================== */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("famtUser");

      if (!storedUser) {
        return;
      }

      const user = JSON.parse(storedUser);

      setForm((previous) => ({
        ...previous,

        player1: {
          ...previous.player1,
          name: user?.name || "",
          email: user?.email || "",
          mobile: user?.mobile || "",
        },
      }));
    } catch (err) {
      console.error(
        "User data error:",
        err
      );
    }
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */

  const entryType = String(
    category?.entryType || "SINGLE"
  ).toUpperCase();

  const registrationStatus =
    category?.registrationStatus ||
    "OPEN";

  const updatePlayer = (
    player,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,

      [player]: {
        ...previous[player],
        [field]: value,
      },
    }));
  };

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const submitRegistration = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* -----------------------------------------------
       DEPARTMENT
    ----------------------------------------------- */

    if (!form.departmentId) {
      setError(
        "Please select your department."
      );
      return;
    }

    const departmentId =
      Number(form.departmentId);

    let players = [];
    let entryName = "";

    /* -----------------------------------------------
       SINGLE
    ----------------------------------------------- */

    if (entryType === "SINGLE") {
      const player = form.player1;

      if (!player.name.trim()) {
        setError(
          "Please enter the student's name."
        );
        return;
      }

      if (!player.year) {
        setError(
          "Please select the year of study."
        );
        return;
      }

      if (!/^\d{10}$/.test(
        player.mobile.trim()
      )) {
        setError(
          "Please enter a valid 10-digit mobile number."
        );
        return;
      }

      if (!player.email.trim()) {
        setError(
          "Please enter your email."
        );
        return;
      }

      entryName =
        player.name.trim();

      players = [
        {
          name: player.name.trim(),
          year: player.year,
          mobile: player.mobile.trim(),
          email: player.email.trim(),
          departmentId,
        },
      ];
    }

    /* -----------------------------------------------
       PAIR
    ----------------------------------------------- */

    if (entryType === "PAIR") {
      const player1 = form.player1;
      const player2 = form.player2;

      if (!player1.name.trim()) {
        setError(
          "Please enter Player 1 name."
        );
        return;
      }

      if (!player1.year) {
        setError(
          "Please select Player 1 year."
        );
        return;
      }

      if (!/^\d{10}$/.test(
        player1.mobile.trim()
      )) {
        setError(
          "Please enter a valid Player 1 mobile number."
        );
        return;
      }

      if (!player1.email.trim()) {
        setError(
          "Please enter Player 1 email."
        );
        return;
      }

      if (!player2.name.trim()) {
        setError(
          "Please enter Player 2 name."
        );
        return;
      }

      if (!player2.year) {
        setError(
          "Please select Player 2 year."
        );
        return;
      }

      if (!/^\d{10}$/.test(
        player2.mobile.trim()
      )) {
        setError(
          "Please enter a valid Player 2 mobile number."
        );
        return;
      }

      if (!player2.email.trim()) {
        setError(
          "Please enter Player 2 email."
        );
        return;
      }

      if (
        player1.mobile.trim() ===
        player2.mobile.trim()
      ) {
        setError(
          "Player 1 and Player 2 cannot have the same mobile number."
        );
        return;
      }

      if (
        player1.email.trim().toLowerCase() ===
        player2.email.trim().toLowerCase()
      ) {
        setError(
          "Player 1 and Player 2 cannot have the same email."
        );
        return;
      }

      entryName =
        `${player1.name.trim()} / ${player2.name.trim()}`;

      players = [
        {
          name: player1.name.trim(),
          year: player1.year,
          mobile: player1.mobile.trim(),
          email: player1.email.trim(),
          departmentId,
        },
        {
          name: player2.name.trim(),
          year: player2.year,
          mobile: player2.mobile.trim(),
          email: player2.email.trim(),
          departmentId,
        },
      ];
    }

    /* -----------------------------------------------
       TEAM
    ----------------------------------------------- */

    if (entryType === "TEAM") {
      const captain = form.player1;

      if (!form.teamName.trim()) {
        setError(
          "Please enter the team name."
        );
        return;
      }

      if (!captain.name.trim()) {
        setError(
          "Please enter the captain's name."
        );
        return;
      }

      if (!captain.year) {
        setError(
          "Please select the captain's year."
        );
        return;
      }

      if (!/^\d{10}$/.test(
        captain.mobile.trim()
      )) {
        setError(
          "Please enter a valid 10-digit captain mobile number."
        );
        return;
      }

      if (!captain.email.trim()) {
        setError(
          "Please enter the captain's email."
        );
        return;
      }

      entryName =
        form.teamName.trim();

      players = [
        {
          name: captain.name.trim(),
          year: captain.year,
          mobile: captain.mobile.trim(),
          email: captain.email.trim(),
          departmentId,
        },
      ];
    }

    /* -----------------------------------------------
       BODY
    ----------------------------------------------- */

    const body = {
      categoryId: Number(categoryId),
      departmentId,
      name: entryName,
      entryType,
      players,
    };

    /* -----------------------------------------------
       API
    ----------------------------------------------- */

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/entries`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(body),
        }
      );

      const json =
        await response.json();

      if (
        !response.ok ||
        !json.success
      ) {
        throw new Error(
          json.message ||
            "Registration failed."
        );
      }

      setSuccess(
        "Registration successful! Your registration has been submitted."
      );

      setError("");

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.message ||
          "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="sports-registration-page">
        <div className="registration-loading">
          <span>FAMT ARENA</span>
          <h2>
            LOADING EVENT...
          </h2>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (!category) {
    return (
      <div className="sports-registration-page">
        <div className="registration-error-page">

          <span>
            FAMT ARENA
          </span>

          <h1>
            EVENT NOT FOUND
          </h1>

          <p>
            {error ||
              "This event could not be found."}
          </p>

          <button
            onClick={() =>
              navigate("/sports")
            }
          >
            ← BACK TO SPORTS
          </button>

        </div>
      </div>
    );
  }

  /* =====================================================
     CLOSED
  ===================================================== */

  if (
    registrationStatus ===
      "CLOSED" ||
    registrationStatus ===
      "REGISTRATION_CLOSED"
  ) {
    return (
      <div className="sports-registration-page">

        <div className="registration-closed-page">

          <span>
            FAMT ARENA
          </span>

          <h1>
            REGISTRATION CLOSED
          </h1>

          <h2>
            {category.name}
          </h2>

          <p>
            Registration for this event
            is currently closed.
          </p>

          <button
            onClick={() =>
              navigate("/sports")
            }
          >
            ← BACK TO SPORTS
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="sports-registration-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="registration-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/sports")
          }
        >
          ← BACK TO SPORTS
        </button>

        <div className="registration-brand">
          FAMT{" "}
          <span>ARENA</span>
        </div>

        <div className="registration-status-open">
          ● REGISTRATION OPEN
        </div>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="registration-hero">

        <div className="registration-hero-inner">

          <span className="registration-kicker">
            SPORTS REGISTRATION
          </span>

          <h1>
            {category.name}
          </h1>

          <p>
            Complete the form below to
            participate in this event.
          </p>

          <div className="registration-meta">

            <div>
              <span>
                SPORT
              </span>

              <strong>
                {category.sport?.name ||
                  category.sportName ||
                  "FAMT SPORTS"}
              </strong>
            </div>

            <div>
              <span>
                ENTRY TYPE
              </span>

              <strong>
                {entryType}
              </strong>
            </div>

            {category.registrationEnds && (
              <div>
                <span>
                  DEADLINE
                </span>

                <strong>
                  {new Date(
                    category.registrationEnds
                  ).toLocaleString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </strong>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          FORM
      ================================================= */}

      <main className="registration-main">

        <div className="registration-form-card">

          <div className="form-heading">

            <span>
              REGISTRATION FORM
            </span>

            <h2>
              Enter Your Details
            </h2>

            <p>
              Please provide accurate
              information. The submitted
              information will be visible
              to Sports Admin.
            </p>

          </div>

          {error && (
            <div className="form-message error">
              <strong>
                Registration Error
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

          {success && (
            <div className="form-message success">

              <strong>
                ✓ Registration Successful
              </strong>

              <span>
                {success}
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate("/sports")
                }
              >
                BACK TO SPORTS
              </button>

            </div>
          )}

          <form
            onSubmit={
              submitRegistration
            }
          >

            {/* ==========================================
                DEPARTMENT
            ========================================== */}

            <div className="form-section">

              <div className="form-section-title">
                01
                <span>
                  DEPARTMENT
                </span>
              </div>

              <label className="form-field">

                <span>
                  DEPARTMENT
                </span>

                <select
                  value={
                    form.departmentId
                  }
                  onChange={(event) =>
                    updateField(
                      "departmentId",
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select your department
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {department.name}
                      </option>
                    )
                  )}

                </select>

              </label>

            </div>

            {/* ==========================================
                SINGLE
            ========================================== */}

            {entryType === "SINGLE" && (

              <div className="form-section">

                <div className="form-section-title">
                  02
                  <span>
                    STUDENT DETAILS
                  </span>
                </div>

                <div className="form-grid">

                  <label className="form-field full">

                    <span>
                      STUDENT NAME
                    </span>

                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={
                        form.player1.name
                      }
                      onChange={(event) =>
                        updatePlayer(
                          "player1",
                          "name",
                          event.target.value
                        )
                      }
                      required
                    />

                  </label>

                  <label className="form-field">

                    <span>
                      YEAR OF STUDY
                    </span>

                    <select
                      value={
                        form.player1.year
                      }
                      onChange={(event) =>
                        updatePlayer(
                          "player1",
                          "year",
                          event.target.value
                        )
                      }
                      required
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

                  <label className="form-field">

                    <span>
                      MOBILE NUMBER
                    </span>

                    <input
                      type="tel"
                      maxLength="10"
                      placeholder="10 digit number"
                      value={
                        form.player1.mobile
                      }
                      onChange={(event) =>
                        updatePlayer(
                          "player1",
                          "mobile",
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      required
                    />

                  </label>

                  <label className="form-field full">

                    <span>
                      EMAIL ADDRESS
                    </span>

                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={
                        form.player1.email
                      }
                      onChange={(event) =>
                        updatePlayer(
                          "player1",
                          "email",
                          event.target.value
                        )
                      }
                      required
                    />

                  </label>

                </div>

              </div>

            )}

            {/* ==========================================
                PAIR
            ========================================== */}

            {entryType === "PAIR" && (

              <>

                {/* PLAYER 1 */}

                <div className="form-section">

                  <div className="form-section-title">
                    02
                    <span>
                      PLAYER 1
                    </span>
                  </div>

                  <div className="form-grid">

                    <label className="form-field full">

                      <span>
                        PLAYER 1 NAME
                      </span>

                      <input
                        type="text"
                        placeholder="Enter Player 1 name"
                        value={
                          form.player1.name
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "name",
                            event.target.value
                          )
                        }
                        required
                      />

                    </label>

                    <label className="form-field">

                      <span>
                        YEAR
                      </span>

                      <select
                        value={
                          form.player1.year
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "year",
                            event.target.value
                          )
                        }
                        required
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

                    <label className="form-field">

                      <span>
                        MOBILE
                      </span>

                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10 digit number"
                        value={
                          form.player1.mobile
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "mobile",
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        required
                      />

                    </label>

                    <label className="form-field full">

                      <span>
                        EMAIL
                      </span>

                      <input
                        type="email"
                        placeholder="Player 1 email"
                        value={
                          form.player1.email
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "email",
                            event.target.value
                          )
                        }
                        required
                      />

                    </label>

                  </div>

                </div>

                {/* PLAYER 2 */}

                <div className="form-section">

                  <div className="form-section-title">
                    03
                    <span>
                      PLAYER 2
                    </span>
                  </div>

                  <div className="form-grid">

                    <label className="form-field full">

                      <span>
                        PLAYER 2 NAME
                      </span>

                      <input
                        type="text"
                        placeholder="Enter Player 2 name"
                        value={
                          form.player2.name
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player2",
                            "name",
                            event.target.value
                          )
                        }
                        required
                      />

                    </label>

                    <label className="form-field">

                      <span>
                        YEAR
                      </span>

                      <select
                        value={
                          form.player2.year
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player2",
                            "year",
                            event.target.value
                          )
                        }
                        required
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

                    <label className="form-field">

                      <span>
                        MOBILE
                      </span>

                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10 digit number"
                        value={
                          form.player2.mobile
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player2",
                            "mobile",
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        required
                      />

                    </label>

                    <label className="form-field full">

                      <span>
                        EMAIL
                      </span>

                      <input
                        type="email"
                        placeholder="Player 2 email"
                        value={
                          form.player2.email
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player2",
                            "email",
                            event.target.value
                          )
                        }
                        required
                      />

                    </label>

                  </div>

                </div>

              </>

            )}

            {/* ==========================================
                TEAM
            ========================================== */}

            {entryType === "TEAM" && (

              <>

                <div className="form-section">

                  <div className="form-section-title">
                    02
                    <span>
                      TEAM DETAILS
                    </span>
                  </div>

                  <label className="form-field">

                    <span>
                      TEAM NAME
                    </span>

                    <input
                      type="text"
                      placeholder="Enter team name"
                      value={
                        form.teamName
                      }
                      onChange={(event) =>
                        updateField(
                          "teamName",
                          event.target.value
                        )
                      }
                      required
                    />

                  </label>

                </div>

                <div className="form-section">

                  <div className="form-section-title">
                    03
                    <span>
                      CAPTAIN DETAILS
                    </span>
                  </div>

                  <div className="team-note">

                    Team registration is
                    currently completed by
                    the captain. Team members
                    can be added during the
                    later team-management
                    stage.

                  </div>

                  <div className="form-grid">

                    <label className="form-field full">

                      <span>
                        CAPTAIN NAME
                      </span>

                      <input
                        type="text"
                        placeholder="Enter captain name"
                        value={
                          form.player1.name
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "name",
                            event.target.value
                          )
                        }
                        required
                      />

                    </label>

                    <label className="form-field">

                      <span>
                        YEAR
                      </span>

                      <select
                        value={
                          form.player1.year
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "year",
                            event.target.value
                          )
                        }
                        required
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

                    <label className="form-field">

                      <span>
                        MOBILE
                      </span>

                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10 digit number"
                        value={
                          form.player1.mobile
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "mobile",
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        required
                      />

                    </label>

                    <label className="form-field full">

                      <span>
                        EMAIL
                      </span>

                      <input
                        type="email"
                        placeholder="Captain email"
                        value={
                          form.player1.email
                        }
                        onChange={(event) =>
                          updatePlayer(
                            "player1",
                            "email",
                            event.target.value
                          )
                        }
                        required
                      />

                    </label>

                  </div>

                </div>

              </>

            )}

            {/* ==========================================
                SUBMIT
            ========================================== */}

            {!success && (

              <div className="registration-submit-area">

                <div className="submit-note">

                  By submitting this form,
                  you confirm that the
                  information provided is
                  correct.

                </div>

                <button
                  type="submit"
                  className="registration-submit"
                  disabled={
                    submitting
                  }
                >

                  {submitting
                    ? "SUBMITTING..."
                    : "SUBMIT REGISTRATION →"}

                </button>

              </div>

            )}

          </form>

        </div>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="registration-footer">

        <strong>
          FAMT ARENA
        </strong>

        <span>
          CONNECT • COMPETE • CELEBRATE
        </span>

        <small>
          © 2026 FAMT Arena
        </small>

      </footer>

    </div>
  );
}