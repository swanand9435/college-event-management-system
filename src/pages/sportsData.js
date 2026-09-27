// ============================================================
// FAMT ARENA - SPORTS DATA
// Change the values here to update the frontend.
// Later this file can be replaced with API/database data.
// ============================================================

export const departments = [
  "Information Technology",
  "CSE-AIML",
  "CSE-CYSE",
  "Mechanical",
  "Electrical",
  "Chemical",
  "Electronics & Telecommunication",
  "MCA",
];

export const liveMatches = [
  {
    id: 1,
    sport: "Cricket",
    icon: "🏏",
    stage: "Semi Final",
    teamA: "Information Technology",
    teamB: "CSE-AIML",
    scoreA: "142/5",
    scoreB: "138/8",
    detail: "18.4 Overs",
    status: "LIVE",
    venue: "Main Ground",
  },
  {
    id: 2,
    sport: "Football",
    icon: "⚽",
    stage: "Group A",
    teamA: "Mechanical",
    teamB: "CSE-CYSE",
    scoreA: "1",
    scoreB: "2",
    detail: "72'",
    status: "LIVE",
    venue: "Football Ground",
  },
];

export const pointTable = [
  {
    rank: 1,
    department: "Information Technology",
    gold: 4,
    silver: 2,
    bronze: 1,
    points: 68,
  },
  {
    rank: 2,
    department: "CSE-AIML",
    gold: 3,
    silver: 3,
    bronze: 2,
    points: 61,
  },
  {
    rank: 3,
    department: "Mechanical",
    gold: 2,
    silver: 2,
    bronze: 3,
    points: 49,
  },
  {
    rank: 4,
    department: "CSE-CYSE",
    gold: 2,
    silver: 1,
    bronze: 2,
    points: 40,
  },
  {
    rank: 5,
    department: "Electrical",
    gold: 1,
    silver: 2,
    bronze: 1,
    points: 31,
  },
  {
    rank: 6,
    department: "Chemical",
    gold: 1,
    silver: 1,
    bronze: 2,
    points: 28,
  },
  {
    rank: 7,
    department: "Electronics & Telecommunication",
    gold: 1,
    silver: 1,
    bronze: 0,
    points: 24,
  },
  {
    rank: 8,
    department: "MCA",
    gold: 0,
    silver: 1,
    bronze: 1,
    points: 16,
  },
];

export const sports = [
  {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    type: "Team Sport",
    status: "open",
    deadline: "18 September 2026",
    eventDate: "21 September 2026",
    venue: "Main Ground",
    description:
      "Inter-department cricket tournament for FAMT students.",
  },

  {
    id: "football",
    name: "Football",
    icon: "⚽",
    type: "Team Sport",
    status: "closed",
    deadline: "15 September 2026",
    eventDate: "20 September 2026",
    venue: "Football Ground",
    description:
      "Inter-department football championship.",
  },

  {
    id: "volleyball",
    name: "Volleyball",
    icon: "🏐",
    type: "Team Sport",
    status: "closing",
    deadline: "17 September 2026",
    eventDate: "22 September 2026",
    venue: "Volleyball Court",
    description:
      "Inter-department volleyball tournament.",
  },

  {
    id: "athletics",
    name: "Athletics",
    icon: "🏃",
    type: "Individual Events",
    status: "open",
    deadline: "19 September 2026",
    eventDate: "23 September 2026",
    venue: "Athletics Track",
    description:
      "Track and field events including sprints, relay and field events.",
  },

  {
    id: "badminton",
    name: "Badminton",
    icon: "🏸",
    type: "Doubles / Mixed",
    status: "open",
    deadline: "20 September 2026",
    eventDate: "24 September 2026",
    venue: "Indoor Hall",
    description:
      "Inter-department badminton tournament.",
  },

  {
    id: "table-tennis",
    name: "Table Tennis",
    icon: "🏓",
    type: "Doubles / Mixed",
    status: "closed",
    deadline: "14 September 2026",
    eventDate: "22 September 2026",
    venue: "Indoor Hall",
    description:
      "Inter-department table tennis competition.",
  },

  {
    id: "chess",
    name: "Chess",
    icon: "♟️",
    type: "Team Event",
    status: "open",
    deadline: "21 September 2026",
    eventDate: "25 September 2026",
    venue: "Chess Hall",
    description:
      "Strategic inter-department chess competition.",
  },

  {
    id: "carrom",
    name: "Carrom",
    icon: "🎯",
    type: "Doubles / Mixed",
    status: "open",
    deadline: "21 September 2026",
    eventDate: "25 September 2026",
    venue: "Indoor Hall",
    description:
      "Inter-department carrom competition.",
  },

  {
    id: "swimming",
    name: "Swimming",
    icon: "🏊",
    type: "Individual / Relay",
    status: "upcoming",
    deadline: "24 September 2026",
    eventDate: "27 September 2026",
    venue: "Swimming Pool",
    description:
      "Swimming and mixed relay events.",
  },

  {
    id: "dodgeball",
    name: "Dodgeball",
    icon: "🥎",
    type: "Team Sport",
    status: "upcoming",
    deadline: "25 September 2026",
    eventDate: "28 September 2026",
    venue: "Main Ground",
    description:
      "Inter-department dodgeball tournament.",
  },

  {
    id: "throwball",
    name: "Throwball",
    icon: "🏐",
    type: "Team Sport",
    status: "upcoming",
    deadline: "25 September 2026",
    eventDate: "28 September 2026",
    venue: "Main Ground",
    description:
      "Inter-department throwball tournament.",
  },

  {
    id: "kho-kho",
    name: "Kho-Kho",
    icon: "🏃",
    type: "Team Sport",
    status: "upcoming",
    deadline: "26 September 2026",
    eventDate: "29 September 2026",
    venue: "Main Ground",
    description:
      "Inter-department Kho-Kho championship.",
  },

  {
    id: "tug-of-war",
    name: "Tug of War",
    icon: "🤼",
    type: "Team Sport",
    status: "upcoming",
    deadline: "26 September 2026",
    eventDate: "29 September 2026",
    venue: "Main Ground",
    description:
      "Department-versus-department strength competition.",
  },

  {
    id: "powerlifting",
    name: "Powerlifting",
    icon: "🏋️",
    type: "Individual Event",
    status: "upcoming",
    deadline: "27 September 2026",
    eventDate: "30 September 2026",
    venue: "Gymnasium",
    description:
      "Individual powerlifting competition.",
  },
];

export const upcomingMatches = [
  {
    id: 1,
    sport: "Cricket",
    icon: "🏏",
    teamA: "IT",
    teamB: "Mechanical",
    date: "21 SEP",
    time: "10:00 AM",
    venue: "Main Ground",
  },
  {
    id: 2,
    sport: "Football",
    icon: "⚽",
    teamA: "MCA",
    teamB: "CSE-CYSE",
    date: "21 SEP",
    time: "02:00 PM",
    venue: "Football Ground",
  },
  {
    id: 3,
    sport: "Badminton",
    icon: "🏸",
    teamA: "CSE-AIML",
    teamB: "Electrical",
    date: "22 SEP",
    time: "09:00 AM",
    venue: "Indoor Hall",
  },
];

export const schedule = [
  {
    date: "21 September",
    matches: [
      {
        time: "10:00 AM",
        sport: "Cricket",
        icon: "🏏",
        teams: "IT vs Mechanical",
        venue: "Main Ground",
      },
      {
        time: "02:00 PM",
        sport: "Football",
        icon: "⚽",
        teams: "MCA vs CSE-CYSE",
        venue: "Football Ground",
      },
    ],
  },
  {
    date: "22 September",
    matches: [
      {
        time: "09:00 AM",
        sport: "Badminton",
        icon: "🏸",
        teams: "CSE-AIML vs Electrical",
        venue: "Indoor Hall",
      },
      {
        time: "03:00 PM",
        sport: "Volleyball",
        icon: "🏐",
        teams: "Chemical vs IT",
        venue: "Volleyball Court",
      },
    ],
  },
  {
    date: "23 September",
    matches: [
      {
        time: "08:00 AM",
        sport: "Athletics",
        icon: "🏃",
        teams: "All Departments",
        venue: "Athletics Track",
      },
    ],
  },
];

export const players = [
  {
    rank: 1,
    name: "Rahul Patil",
    department: "Information Technology",
    points: 42,
    gold: 3,
    silver: 1,
    bronze: 0,
  },
  {
    rank: 2,
    name: "Aditya More",
    department: "Mechanical",
    points: 38,
    gold: 2,
    silver: 2,
    bronze: 0,
  },
  {
    rank: 3,
    name: "Omkar Sawant",
    department: "CSE-AIML",
    points: 35,
    gold: 2,
    silver: 1,
    bronze: 1,
  },
  {
    rank: 4,
    name: "Yash Patil",
    department: "CSE-CYSE",
    points: 31,
    gold: 2,
    silver: 0,
    bronze: 1,
  },
];

export const lots = [
  {
    match: "Quarter Final 1",
    teamA: "IT",
    teamB: "Mechanical",
  },
  {
    match: "Quarter Final 2",
    teamA: "CSE-AIML",
    teamB: "MCA",
  },
  {
    match: "Quarter Final 3",
    teamA: "CSE-CYSE",
    teamB: "Electrical",
  },
  {
    match: "Quarter Final 4",
    teamA: "Chemical",
    teamB: "ENTC",
  },
];

export const highlights = [
  {
    image: "/images/sports/sports1.jpg",
    title: "Championship Begins",
  },
  {
    image: "/images/sports/sports2.jpg",
    title: "On The Field",
  },
  {
    image: "/images/sports/sports3.jpg",
    title: "Victory Moments",
  },
  {
    image: "/images/sports/sports4.jpg",
    title: "Team Spirit",
  },
];

export const committee = [
  {
    name: "Yogesh R. Sawant",
    role: "Sports Secretary — Boys",
    image: "/images/sports/committee/yogesh.jpg",
  },
  {
    name: "Urvi M. Jain",
    role: "Sports Secretary — Girls",
    image: "/images/sports/committee/urvi.jpg",
  },
  {
    name: "Dr. Prashant A. Giri",
    role: "Faculty Coordinator",
    image: "/images/sports/committee/prashant.jpg",
  },
  {
    name: "Prof. Sumit S. Malusare",
    role: "Faculty Coordinator",
    image: "/images/sports/committee/sumit.jpg",
  },
];