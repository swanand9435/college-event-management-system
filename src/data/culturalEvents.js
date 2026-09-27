export const culturalEvents = [
  {
    id: "one-act-play",
    name: "One Act Play",
    committee: "Natyarang",
    category: "Theatre",
    description:
      "A theatrical performance where teams present a short one-act play.",
    registrationOpen: true,

    commonFields: {
      department: true,
      year: true,
      experience: true,
    },

    customFields: [
      {
        name: "teamName",
        label: "Team Name",
        type: "text",
        required: true,
      },
      {
        name: "playName",
        label: "Play Name",
        type: "text",
        required: true,
      },
      {
        name: "language",
        label: "Language",
        type: "select",
        required: true,
        options: ["Marathi", "Hindi", "English", "Other"],
      },
      {
        name: "duration",
        label: "Performance Duration",
        type: "text",
        required: true,
      },
      {
        name: "numberOfParticipants",
        label: "Number of Participants",
        type: "number",
        required: true,
      },
      {
        name: "synopsis",
        label: "Synopsis",
        type: "textarea",
        required: true,
      },
      {
        name: "specialRequirements",
        label: "Special Requirements",
        type: "textarea",
        required: false,
      },
    ],
  },

  {
    id: "mime",
    name: "Mime",
    committee: "Natyarang",
    category: "Theatre",
    description:
      "A silent theatrical performance based on expressions, movement and storytelling.",
    registrationOpen: true,

    commonFields: {
      department: true,
      year: true,
      experience: true,
    },

    customFields: [
      {
        name: "teamName",
        label: "Team Name",
        type: "text",
        required: true,
      },
      {
        name: "numberOfParticipants",
        label: "Number of Participants",
        type: "number",
        required: true,
      },
      {
        name: "theme",
        label: "Theme",
        type: "text",
        required: true,
      },
      {
        name: "duration",
        label: "Performance Duration",
        type: "text",
        required: true,
      },
      {
        name: "musicRequired",
        label: "Music Required?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
      {
        name: "propsRequired",
        label: "Props Required?",
        type: "select",
        required: true,
        options: ["Yes", "No"],
      },
    ],
  },

  {
    id: "mono-acting",
    name: "Mono Acting",
    committee: "Natyarang",
    category: "Theatre",
    description:
      "A solo theatrical performance where one performer carries the entire act.",
    registrationOpen: true,

    commonFields: {
      department: false,
      year: false,
      experience: true,
    },

    customFields: [
      {
        name: "performanceTitle",
        label: "Performance Title",
        type: "text",
        required: true,
      },
      {
        name: "language",
        label: "Language",
        type: "select",
        required: true,
        options: ["Marathi", "Hindi", "English", "Other"],
      },
      {
        name: "duration",
        label: "Performance Duration",
        type: "text",
        required: true,
      },
      {
        name: "description",
        label: "Performance Description",
        type: "textarea",
        required: true,
      },
      {
        name: "specialRequirements",
        label: "Special Requirements",
        type: "textarea",
        required: false,
      },
    ],
  },

  {
    id: "dance",
    name: "Dance",
    committee: "Dance",
    category: "Dance",
    description:
      "A stage performance showcasing individual or group dance talent.",
    registrationOpen: true,

    commonFields: {
      department: false,
      year: false,
      experience: true,
    },

    customFields: [
      {
        name: "teamName",
        label: "Team / Group Name",
        type: "text",
        required: true,
      },
      {
        name: "danceForm",
        label: "Dance Form",
        type: "text",
        required: true,
      },
      {
        name: "numberOfParticipants",
        label: "Number of Participants",
        type: "number",
        required: true,
      },
      {
        name: "theme",
        label: "Theme / Concept",
        type: "textarea",
        required: true,
      },
      {
        name: "musicTrack",
        label: "Music Track",
        type: "text",
        required: false,
      },
      {
        name: "specialRequirements",
        label: "Special Requirements",
        type: "textarea",
        required: false,
      },
    ],
  },

  {
    id: "voice-of-famt",
    name: "Voice of FAMT",
    committee: "Voice of FAMT",
    category: "Music",
    description:
      "A singing competition celebrating vocal talent.",
    registrationOpen: true,

    commonFields: {
      department: false,
      year: false,
      experience: true,
    },

    customFields: [
      {
        name: "singingCategory",
        label: "Singing Category",
        type: "select",
        required: true,
        options: ["Solo", "Duet", "Group"],
      },
      {
        name: "language",
        label: "Preferred Language",
        type: "text",
        required: true,
      },
      {
        name: "genre",
        label: "Genre",
        type: "text",
        required: true,
      },
      {
        name: "instrument",
        label: "Instrument Used",
        type: "text",
        required: false,
      },
    ],
  },

  {
    id: "fashion-walk",
    name: "Fashion Walk",
    committee: "Fashion Walk",
    category: "Fashion",
    description:
      "A creative fashion presentation combining theme, costume and stage presence.",
    registrationOpen: true,

    commonFields: {
      department: false,
      year: false,
      experience: true,
    },

    customFields: [
      {
        name: "teamName",
        label: "Team / Group Name",
        type: "text",
        required: false,
      },
      {
        name: "theme",
        label: "Theme",
        type: "text",
        required: true,
      },
      {
        name: "numberOfParticipants",
        label: "Number of Participants",
        type: "number",
        required: true,
      },
      {
        name: "costumeDescription",
        label: "Costume Description",
        type: "textarea",
        required: true,
      },
      {
        name: "specialRequirements",
        label: "Special Requirements",
        type: "textarea",
        required: false,
      },
    ],
  },
];