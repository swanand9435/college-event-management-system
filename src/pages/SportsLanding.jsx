import React, { useEffect, useMemo, useState } from "react";

import {
  sports,
  upcomingMatches,
  highlights,
  committee,
} from "./sportsData";

import "./SportsLanding.css";

const API_URL = "http://localhost:5000/api";

const REFRESH_INTERVAL = 10000;

/* =========================================================
   HELPERS
========================================================= */

function getEntryName(entry, fallback = "TBD") {
  if (!entry) return fallback;

  if (entry.teamName) return entry.teamName;
  if (entry.name) return entry.name;
  if (entry.playerName) return entry.playerName;
  if (entry.title) return entry.title;

  if (entry.players?.length) {
    const names = entry.players
      .map((item) => {
        return (
          item.player?.name ||
          item.playerName ||
          item.name ||
          ""
        );
      })
      .filter(Boolean);

    if (names.length) {
      return names.join(" / ");
    }
  }

  if (entry.department?.name) {
    return entry.department.name;
  }

  return `Entry #${entry.id ?? "?"}`;
}


function getCategoryName(category) {
  if (!category) return "Sports";

  return (
    category.name ||
    category.categoryName ||
    "Sports"
  );
}


function getSportName(category) {
  return (
    category?.sport?.name ||
    category?.sportName ||
    "Sports"
  );
}


function getMatchEntryName(match, side) {
  if (side === "A") {
    return getEntryName(
      match.entryA,
      match.entryAId
        ? `Entry #${match.entryAId}`
        : "TBD"
    );
  }

  return getEntryName(
    match.entryB,
    match.entryBId
      ? `Entry #${match.entryBId}`
      : "TBD"
  );
}


/* =========================================================
   COMPONENT
========================================================= */

function SportsLanding() {

  /* =======================================================
     UI STATE
  ======================================================= */

  const [selectedSport, setSelectedSport] =
    useState("All");

  const [selectedMatch, setSelectedMatch] =
    useState(null);

  const [selectedDrawCategory, setSelectedDrawCategory] =
    useState("");


  /* =======================================================
     BACKEND STATE
  ======================================================= */

  const [liveMatches, setLiveMatches] =
    useState([]);

  const [allMatches, setAllMatches] =
    useState([]);

  const [pointTable, setPointTable] =
    useState([]);

  const [backendSports, setBackendSports] =
    useState([]);

  const [draws, setDraws] =
    useState([]);

  const [competitionResults, setCompetitionResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     STATIC SPORTS FILTER
  ======================================================= */

  const filteredSports =
    selectedSport === "All"
      ? sports
      : sports.filter(
          (sport) =>
            sport.type === selectedSport
        );


  /* =======================================================
     FETCH SPORTS
  ======================================================= */

  const fetchSports = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/sports`
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success
      ) {
        setBackendSports(
          result.data || []
        );
      }

    } catch (err) {

      console.error(
        "Sports fetch error:",
        err
      );

    }
  };


  /* =======================================================
     FETCH LIVE MATCHES
  ======================================================= */

  const fetchLiveMatches = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/matches/live`
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success
      ) {
        setLiveMatches(
          result.data || []
        );
      }

    } catch (err) {

      console.error(
        "Live matches error:",
        err
      );

    }
  };


  /* =======================================================
     FETCH ALL MATCHES
  ======================================================= */

  const fetchMatches = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/matches`
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success
      ) {
        setAllMatches(
          result.data || []
        );
      }

    } catch (err) {

      console.error(
        "Matches fetch error:",
        err
      );

    }
  };


  /* =======================================================
     FETCH POINT TABLE
  ======================================================= */

  const fetchPointTable = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/point-table`
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success
      ) {

        setPointTable(
          result.data || []
        );

      }

    } catch (err) {

      console.error(
        "Point table error:",
        err
      );

    }
  };


  /* =======================================================
     FETCH RESULTS
  ======================================================= */

  const fetchResults = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/results?year=2026-27`
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success
      ) {

        setCompetitionResults(
          result.data || []
        );

      }

    } catch (err) {

      console.error(
        "Results fetch error:",
        err
      );

    }
  };


  /* =======================================================
     FETCH DRAWS
  ======================================================= */

  const fetchDraws = async () => {

    try {

      /*
       * We first fetch all sports/categories.
       * Then we ask the backend for the latest draw
       * of every category.
       */

      const sportsResponse =
        await fetch(
          `${API_URL}/sports`
        );

      const sportsResult =
        await sportsResponse.json();

      if (
        !sportsResponse.ok ||
        !sportsResult.success
      ) {
        return;
      }

      const sportsData =
        sportsResult.data || [];

      const categories = [];

      sportsData.forEach(
        (sport) => {

          (sport.categories || []).forEach(
            (category) => {

              categories.push({
                ...category,
                sportName:
                  sport.name,
              });

            }
          );

        }
      );


      const drawResponses =
        await Promise.all(

          categories.map(
            async (category) => {

              try {

                const response =
                  await fetch(
                    `${API_URL}/categories/${category.id}/draw`
                  );

                const result =
                  await response.json();

                if (
                  response.ok &&
                  result.success &&
                  result.data
                ) {

                  return {
                    ...result.data,
                    categoryInfo:
                      category,
                    sportName:
                      category.sportName,
                  };

                }

              } catch (err) {

                console.error(
                  `Draw error for category ${category.id}:`,
                  err
                );

              }

              return null;

            }
          )

        );


      /*
       * Only Admin-generated/locked draws
       * are visible to students.
       */

      const publishedDraws =
        drawResponses.filter(
          (draw) =>
            draw &&
            (
              draw.status === "GENERATED" ||
              draw.status === "LOCKED"
            ) &&
            draw.rounds?.length
        );

      setDraws(
        publishedDraws
      );


      /*
       * Select the first available draw
       * automatically.
       */

      if (
        publishedDraws.length > 0
      ) {

        setSelectedDrawCategory(
          (current) => {

            if (
              current &&
              publishedDraws.some(
                (draw) =>
                  String(
                    draw.categoryId
                  ) === String(current)
              )
            ) {
              return current;
            }

            return String(
              publishedDraws[0].categoryId
            );

          }
        );

      } else {

        setSelectedDrawCategory("");

      }

    } catch (err) {

      console.error(
        "Draw fetch error:",
        err
      );

    }
  };


  /* =======================================================
     FETCH EVERYTHING
  ======================================================= */

  const fetchAllData = async () => {

    try {

      setError("");

      await Promise.all([
        fetchSports(),
        fetchLiveMatches(),
        fetchMatches(),
        fetchPointTable(),
        fetchResults(),
        fetchDraws(),
      ]);

    } catch (err) {

      console.error(
        "Sports data error:",
        err
      );

      setError(
        "Unable to load latest sports data."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {

    fetchAllData();

    const interval =
      setInterval(
        fetchAllData,
        REFRESH_INTERVAL
      );

    return () =>
      clearInterval(interval);

  }, []);


  /* =======================================================
     CURRENT DRAW
  ======================================================= */

  const currentDraw =
    useMemo(() => {

      return draws.find(
        (draw) =>
          String(
            draw.categoryId
          ) ===
          String(
            selectedDrawCategory
          )
      );

    }, [
      draws,
      selectedDrawCategory,
    ]);


  /* =======================================================
     COMPLETED MATCH RESULTS
  ======================================================= */

  const completedMatches =
    useMemo(() => {

      return allMatches
        .filter(
          (match) =>
            String(
              match.status
            ).toUpperCase() ===
            "COMPLETED"
        )
        .sort(
          (a, b) =>
            Number(b.id || 0) -
            Number(a.id || 0)
        );

    }, [allMatches]);


  /* =======================================================
     WINNERS / MEDALS
  ======================================================= */

  const winners =
    useMemo(() => {

      return competitionResults
        .filter(
          (result) =>
            [1, 2, 3].includes(
              Number(
                result.position
              )
            )
        )
        .sort(
          (a, b) => {

            if (
              Number(a.position) !==
              Number(b.position)
            ) {
              return (
                Number(a.position) -
                Number(b.position)
              );
            }

            return (
              Number(a.categoryId || 0) -
              Number(b.categoryId || 0)
            );

          }
        );

    }, [competitionResults]);


  /* =======================================================
     ENTRY NAME FOR RESULT
  ======================================================= */

  const getResultEntryName =
    (result) => {

      if (
        result.entry
      ) {
        return getEntryName(
          result.entry,
          `Entry #${result.entry.id}`
        );
      }

      return `Entry #${
        result.entryId || "?"
      }`;

    };


  /* =======================================================
     MEDAL
  ======================================================= */

  const getMedal =
    (position) => {

      const value =
        Number(position);

      if (value === 1)
        return "🥇 GOLD";

      if (value === 2)
        return "🥈 SILVER";

      if (value === 3)
        return "🥉 BRONZE";

      return "-";

    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <main className="sports-page">

      {/* ===================================================
          HERO
      =================================================== */}

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
            CONNECT
            <span> • </span>
            COMPETE
            <span> • </span>
            CELEBRATE
          </p>


          <div className="hero-buttons">

            <a
              href="#live"
              className="primary-btn"
            >
              🔴 LIVE NOW
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

          <span>
            ↓
          </span>

        </div>

      </section>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="sports-error">
          {error}
        </div>

      )}


      {/* ===================================================
          LIVE NOW
      =================================================== */}

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
            Matches currently being played.
          </p>

        </div>


        {liveMatches.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🔴
            </div>

            <h3>
              No Match Live Right Now
            </h3>

            <p>
              When Admin starts a match,
              it will appear here automatically.
            </p>

          </div>

        ) : (

          <div className="live-simple-grid">

            {liveMatches.map(
              (match) => (

                <article
                  className="live-simple-card"
                  key={match.id}
                >

                  <div className="live-simple-badge">
                    🔴 LIVE NOW
                  </div>


                  <h3>

                    {match.sport?.name ||
                      "Sports"}

                    {" — "}

                    {match.category?.name ||
                      "Match"}

                  </h3>


                  <strong>
                    LIVE
                  </strong>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          POINT TABLE
      =================================================== */}

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
            Updated automatically from Admin results.
          </p>

        </div>


        <div className="table-wrapper">

          {pointTable.length === 0 ? (

            <div className="empty-state">

              <h3>
                Point Table Not Available
              </h3>

              <p>
                Points will appear here when
                results are recorded.
              </p>

            </div>

          ) : (

            <table className="points-table">

              <thead>

                <tr>

                  <th>
                    RANK
                  </th>

                  <th>
                    DEPARTMENT
                  </th>

                  <th>
                    🥇
                  </th>

                  <th>
                    🥈
                  </th>

                  <th>
                    🥉
                  </th>

                  <th>
                    POINTS
                  </th>

                </tr>

              </thead>


              <tbody>

                {pointTable.map(
                  (team, index) => (

                    <tr
                      key={
                        team.department?.id ||
                        team.departmentId ||
                        index
                      }
                    >

                      <td className="rank-number">

                        {index < 3
                          ? [
                              "🥇",
                              "🥈",
                              "🥉",
                            ][index]
                          : index + 1}

                      </td>


                      <td>

                        <strong>

                          {team.department?.name ||
                            team.departmentName ||
                            team.name ||
                            "-"}

                        </strong>

                        {team.department?.code && (

                          <small className="department-code">

                            {team.department.code}

                          </small>

                        )}

                      </td>


                      <td>
                        {team.gold ?? 0}
                      </td>


                      <td>
                        {team.silver ?? 0}
                      </td>


                      <td>
                        {team.bronze ?? 0}
                      </td>


                      <td className="total-points">

                        {team.points ??
                          team.totalPoints ??
                          0}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </section>


      {/* ===================================================
          SPORTS & REGISTRATION
      =================================================== */}

      <section className="sports-section events-section">

        <div className="section-heading">

          <span>
            03 / COMPETE
          </span>

          <h2>
            SPORTS <strong>& EVENTS</strong>
          </h2>

          <p>
            Explore sports and event information.
          </p>

        </div>


        <div className="sport-filters">

          {[
            "All",
            "Team Sport",
            "Individual Events",
            "Doubles / Mixed",
            "Team Event",
            "Individual Event",
          ].map(
            (filter) => (

              <button
                key={filter}
                className={
                  selectedSport === filter
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSelectedSport(
                    filter
                  )
                }
              >
                {filter}
              </button>

            )
          )}

        </div>


        <div className="sports-grid">

          {filteredSports.map(
            (sport) => (

              <article
                className="sport-card"
                key={sport.id}
              >

                <div className="sport-card-icon">
                  {sport.icon}
                </div>


                <div className="sport-card-header">

                  <span className="sport-type">
                    {sport.type}
                  </span>

                  <h3>
                    {sport.name}
                  </h3>

                </div>


                <span
                  className={`registration-status ${
                    sport.status || "upcoming"
                  }`}
                >

                  {sport.status === "open" &&
                    "● REGISTRATION OPEN"}

                  {sport.status === "closing" &&
                    "● CLOSING SOON"}

                  {sport.status === "closed" &&
                    "● REGISTRATION CLOSED"}

                  {sport.status === "upcoming" &&
                    "● REGISTRATION UPCOMING"}

                </span>


                <p>
                  {sport.description}
                </p>


                <div className="sport-details">

                  <div>

                    <small>
                      REGISTRATION DEADLINE
                    </small>

                    <strong>
                      {sport.deadline || "-"}
                    </strong>

                  </div>


                  <div>

                    <small>
                      EVENT DATE
                    </small>

                    <strong>
                      {sport.eventDate || "-"}
                    </strong>

                  </div>


                  <div>

                    <small>
                      VENUE
                    </small>

                    <strong>
                      {sport.venue || "-"}
                    </strong>

                  </div>

                </div>

              </article>

            )
          )}

        </div>

      </section>


      {/* ===================================================
          UPCOMING MATCHES
      =================================================== */}

      <section className="sports-section upcoming-section">

        <div className="section-heading">

          <span>
            04 / NEXT UP
          </span>

          <h2>
            UPCOMING <strong>MATCHES</strong>
          </h2>

        </div>


        <div className="upcoming-grid">

          {upcomingMatches.map(
            (match) => (

              <article
                className="upcoming-card"
                key={match.id}
              >

                <div className="upcoming-top">

                  <span>
                    {match.icon}{" "}
                    {match.sport}
                  </span>

                  <small>
                    UPCOMING
                  </small>

                </div>


                <div className="upcoming-teams">

                  <strong>
                    {match.teamA}
                  </strong>

                  <span>
                    VS
                  </span>

                  <strong>
                    {match.teamB}
                  </strong>

                </div>


                <div className="upcoming-info">

                  <span>
                    📅 {match.date}
                  </span>

                  <span>
                    ⏰ {match.time}
                  </span>

                  <span>
                    📍 {match.venue}
                  </span>

                </div>

              </article>

            )
          )}

        </div>

      </section>


      {/* ===================================================
          DRAW LOTS
      =================================================== */}

      <section
        className="sports-section lots-section"
        id="draws"
      >

        <div className="section-heading">

          <span>
            05 / TOURNAMENT
          </span>

          <h2>
            <strong>DRAW</strong>
          </h2>

          <p>
            Official draws published by Sports Admin.
          </p>

        </div>


        {draws.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🎲
            </div>

            <h3>
              No Draw Published Yet
            </h3>

            <p>
              Once Admin generates and publishes
              a draw, it will appear here automatically.
            </p>

          </div>

        ) : (

          <>

            {/* DRAW CATEGORY SELECTOR */}

            <div className="draw-category-selector">

              <label>
                SELECT SPORT / CATEGORY
              </label>

              <select
                value={
                  selectedDrawCategory
                }
                onChange={(e) =>
                  setSelectedDrawCategory(
                    e.target.value
                  )
                }
              >

                {draws.map(
                  (draw) => (

                    <option
                      key={draw.id}
                      value={
                        draw.categoryId
                      }
                    >

                      {draw.sportName ||
                        getSportName(
                          draw.category
                        )}

                      {" — "}

                      {draw.categoryInfo?.name ||
                        getCategoryName(
                          draw.category
                        )}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* CURRENT DRAW */}

            {currentDraw && (

              <div className="student-draw">

                <div className="student-draw-header">

                  <div>

                    <span>
                      {currentDraw.sportName ||
                        getSportName(
                          currentDraw.category
                        )}
                    </span>

                    <h3>

                      {currentDraw.categoryInfo?.name ||
                        getCategoryName(
                          currentDraw.category
                        )}

                    </h3>

                  </div>


                  <span
                    className={`draw-status ${
                      String(
                        currentDraw.status
                      ).toLowerCase()
                    }`}
                  >
                    {currentDraw.status}
                  </span>

                </div>


                {currentDraw.rounds?.map(
                  (round) => (

                    <div
                      className="draw-round"
                      key={round.id}
                    >

                      <div className="draw-round-title">

                        <span>
                          ROUND
                        </span>

                        <h4>
                          {round.name ||
                            `Round ${
                              round.roundNo
                            }`}
                        </h4>

                      </div>


                      <div className="draw-match-list">

                        {(round.matches || []).map(
                          (match, index) => (

                            <div
                              className="draw-match"
                              key={
                                match.id ||
                                index
                              }
                            >

                              <div className="draw-match-number">

                                MATCH{" "}
                                {index + 1}

                              </div>


                              <div className="draw-player">

                                {getMatchEntryName(
                                  match,
                                  "A"
                                )}

                              </div>


                              <div className="draw-vs">
                                VS
                              </div>


                              <div className="draw-player">

                                {getMatchEntryName(
                                  match,
                                  "B"
                                )}

                              </div>


                              <div className="draw-match-status">

                                {match.status ||
                                  "UPCOMING"}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </>

        )}

      </section>


      {/* ===================================================
          RESULTS
      =================================================== */}

      <section
        className="sports-section results-section"
        id="results"
      >

        <div className="section-heading">

          <span>
            06 / MATCH RESULTS
          </span>

          <h2>
            MATCH <strong>RESULTS</strong>
          </h2>

          <p>
            Results updated from the Admin panel.
          </p>

        </div>


        {completedMatches.length === 0 &&
        competitionResults.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🏟️
            </div>

            <h3>
              No Results Published Yet
            </h3>

            <p>
              Completed matches and official
              results will appear here.
            </p>

          </div>

        ) : (

          <div className="results-list">

            {completedMatches.map(
              (match) => (

                <article
                  className="result-card"
                  key={match.id}
                >

                  <div className="result-card-top">

                    <span>
                      {match.sport?.name ||
                        "Sports"}
                    </span>

                    <small>
                      {match.category?.name ||
                        "Match"}
                    </small>

                  </div>


                  <div className="result-teams">

                    <div>

                      <strong>
                        {getMatchEntryName(
                          match,
                          "A"
                        )}
                      </strong>

                      <span>
                        {match.score?.scoreA ??
                          "-"}
                      </span>

                    </div>


                    <b>
                      VS
                    </b>


                    <div>

                      <strong>
                        {getMatchEntryName(
                          match,
                          "B"
                        )}
                      </strong>

                      <span>
                        {match.score?.scoreB ??
                          "-"}
                      </span>

                    </div>

                  </div>


                  <div className="result-winner">

                    🏆 Winner:{" "}

                    <strong>

                      {getEntryName(
                        match.winnerEntry,
                        "Winner updated by Admin"
                      )}

                    </strong>

                  </div>

                </article>

              )
            )}


            {/* OFFICIAL COMPETITION RESULTS */}

            {competitionResults.map(
              (result) => (

                <article
                  className="result-card official-result"
                  key={`result-${result.id}`}
                >

                  <div className="result-card-top">

                    <span>
                      OFFICIAL RESULT
                    </span>

                    <small>
                      {result.category?.name ||
                        "Sports"}
                    </small>

                  </div>


                  <div className="official-result-body">

                    <strong>
                      {getResultEntryName(
                        result
                      )}
                    </strong>


                    <span>
                      {getMedal(
                        result.position
                      )}
                    </span>


                    <span>
                      {result.pointsAwarded ??
                        0}{" "}
                      POINTS
                    </span>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          WINNERS
      =================================================== */}

      <section
        className="sports-section winners-section"
        id="winners"
      >

        <div className="section-heading">

          <span>
            07 / CHAMPIONS
          </span>

          <h2>
            WINNERS <strong>& MEDALS</strong>
          </h2>

          <p>
            Official Gold, Silver and Bronze results.
          </p>

        </div>


        {winners.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🏆
            </div>

            <h3>
              Winners Not Published Yet
            </h3>

            <p>
              Medal results will appear here
              after Admin records the results.
            </p>

          </div>

        ) : (

          <div className="winners-grid">

            {winners.map(
              (winner) => (

                <article
                  className={`winner-card position-${winner.position}`}
                  key={winner.id}
                >

                  <div className="winner-medal">

                    {Number(
                      winner.position
                    ) === 1 && "🥇"}

                    {Number(
                      winner.position
                    ) === 2 && "🥈"}

                    {Number(
                      winner.position
                    ) === 3 && "🥉"}

                  </div>


                  <span className="winner-medal-name">

                    {getMedal(
                      winner.position
                    )}

                  </span>


                  <h3>

                    {getResultEntryName(
                      winner
                    )}

                  </h3>


                  <p>

                    {winner.category?.name ||
                      "Sports Category"}

                  </p>


                  {winner.entry?.department && (

                    <span className="winner-department">

                      {winner.entry.department.name}

                    </span>

                  )}


                  <strong className="winner-points">

                    {winner.pointsAwarded ??
                      0}

                    <small>
                      POINTS
                    </small>

                  </strong>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          PLAYER RANKINGS
      =================================================== */}

      {/* Kept only if already present in sportsData.
          This is NOT Best Sportsperson. */}

      {/* ===================================================
          HIGHLIGHTS
      =================================================== */}

      <section className="sports-section highlights-section">

        <div className="section-heading">

          <span>
            08 / MOMENTS
          </span>

          <h2>
            SPORTS <strong>HIGHLIGHTS</strong>
          </h2>

        </div>


        <div className="highlights-grid">

          {highlights.map(
            (item, index) => (

              <div
                className={`highlight-card highlight-${
                  index + 1
                }`}
                key={item.title}
              >

                <img
                  src={item.image}
                  alt={item.title}
                />


                <div className="highlight-overlay">

                  <span>
                    0{index + 1}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                </div>

              </div>

            )
          )}

        </div>


        <button className="outline-btn gallery-btn">
          VIEW FULL GALLERY →
        </button>

      </section>


      {/* ===================================================
          COMMITTEE
      =================================================== */}

      <section className="sports-section committee-section">

        <div className="section-heading">

          <span>
            09 / OUR TEAM
          </span>

          <h2>
            SPORTS <strong>COMMITTEE</strong>
          </h2>

        </div>


        <div className="committee-grid">

          {committee.map(
            (member) => (

              <article
                className="committee-card"
                key={member.name}
              >

                <div className="committee-photo">

                  <img
                    src={member.image}
                    alt={member.name}
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

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


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="sports-footer">

        <div className="footer-logo">

          FAMT{" "}
          <span>
            ARENA
          </span>

        </div>


        <p>
          CONNECT • COMPETE • CELEBRATE
        </p>


        <div className="footer-links">

          <a href="/sports">
            SPORTS
          </a>

          <a href="#live">
            LIVE NOW
          </a>

          <a href="#draws">
            DRAWS
          </a>

          <a href="#results">
            RESULTS
          </a>

          <a href="#winners">
            WINNERS
          </a>

          <a href="#points">
            POINT TABLE
          </a>

        </div>


        <div className="footer-bottom">

          © 2026 FAMT ARENA.
          ALL RIGHTS RESERVED.

        </div>

      </footer>


      {/* ===================================================
          SIMPLE LIVE MODAL
      =================================================== */}

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


            <div className="simple-live-modal">

              <div className="live-simple-badge">
                🔴 LIVE NOW
              </div>


              <h2>

                {selectedMatch.sport?.name ||
                  "Sports"}

                {" — "}

                {selectedMatch.category?.name ||
                  "Match"}

              </h2>


              <strong>
                LIVE
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (

        <div className="sports-loading">

          <div className="sports-loading-spinner"></div>

          <span>
            Loading latest sports data...
          </span>

        </div>

      )}

    </main>

  );

}

export default SportsLanding;