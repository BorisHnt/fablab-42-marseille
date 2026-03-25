export const modules = [
  {
    id: "electronique-01",
    title: "Electronique 01",
    shortText: "Module d’introduction aux bases de l’électronique.",
    presentation:
      "On y apprend ce qu’est un circuit, la tension, le courant, la résistance, la loi d’Ohm, le rôle des composants simples, et les premiers montages sur breadboard.",
    description: "Initiation aux bases de l’électronique pour débutants.",
    objectives:
      "Comprendre les notions de base et réaliser un premier circuit simple.",
    prerequisites: "Aucun.",
    bring: [
      "Ordinateur portable",
      "Carnet ou support pour prendre des notes",
    ],
    duration: "À définir",
    level: "Débutant",
    focus: ["Circuit", "Mesure", "Breadboard"],
    mood:
      "Le module pose des bases concrètes pour manipuler sereinement les notions essentielles avant d’aller vers des montages plus riches.",
  },
  {
    id: "arduino-01",
    title: "Arduino 01",
    shortText: "Module d’introduction à Arduino.",
    presentation:
      "On y découvre ce qu’est une carte Arduino, comment la programmer, comment lire des capteurs simples, contrôler des sorties, et faire les premiers montages interactifs.",
    description:
      "Découverte de la programmation et des montages simples avec Arduino.",
    objectives:
      "Comprendre le fonctionnement d’une carte Arduino et réaliser des premiers essais.",
    prerequisites: "Electronique 01 conseillé.",
    bring: [
      "Ordinateur portable",
      "Câble USB-C pour connecter l’Arduino",
      "Carnet ou support pour prendre des notes",
    ],
    duration: "À définir",
    level: "Débutant",
    focus: ["Code", "Capteurs", "Prototypes"],
    mood:
      "On y relie programmation, capteurs et actionneurs pour créer des premiers objets interactifs lisibles et motivants.",
  },
];

export const sessions = [
  {
    id: "sess-elec-2026-04-10",
    moduleId: "electronique-01",
    date: "2026-04-10",
    time: "18:30 - 21:00",
    level: "Débutant",
    seats: 12,
    location: "Campus 42 Marseille",
    label: "Découverte",
  },
  {
    id: "sess-arduino-2026-04-17",
    moduleId: "arduino-01",
    date: "2026-04-17",
    time: "18:30 - 21:00",
    level: "Débutant",
    seats: 10,
    location: "Atelier prototypage",
    label: "Montage interactif",
  },
  {
    id: "sess-elec-2026-04-24",
    moduleId: "electronique-01",
    date: "2026-04-24",
    time: "18:30 - 21:00",
    level: "Débutant",
    seats: 8,
    location: "Campus 42 Marseille",
    label: "Premiers circuits",
  },
  {
    id: "sess-arduino-2026-05-05",
    moduleId: "arduino-01",
    date: "2026-05-05",
    time: "19:00 - 21:30",
    level: "Débutant",
    seats: 10,
    location: "Atelier prototypage",
    label: "Capteurs et sorties",
  },
];

export const events = [
  {
    id: "open-lab-creatif",
    title: "Open Lab créatif",
    date: "2026-04-03",
    category: "Découverte",
    description:
      "Une soirée ouverte pour visiter le lieu, voir des prototypes en cours et échanger avec l’équipe du fablab.",
  },
  {
    id: "repair-test-night",
    title: "Repair & Test Night",
    date: "2026-04-15",
    category: "Communauté",
    description:
      "On démonte, on teste, on répare et on documente ensemble des objets du quotidien dans une ambiance atelier.",
  },
  {
    id: "mini-demo-day",
    title: "Mini Demo Day",
    date: "2026-05-09",
    category: "Projets",
    description:
      "Présentation de prototypes étudiants, essais de dispositifs interactifs et retours d’expérience sur les modules.",
  },
  {
    id: "atelier-premiers-montages",
    title: "Atelier premiers montages",
    date: "2026-05-20",
    category: "Pédagogie",
    description:
      "Un format accessible pour découvrir les composants de base, poser des questions et manipuler sans pression.",
  },
];

export const highlights = [
  {
    title: "Pédagogie concrète",
    text: "Des modules courts, clairs et orientés pratique pour apprendre en fabriquant dès les premières minutes.",
  },
  {
    title: "Événements vivants",
    text: "La page d’accueil rend l’activité du lieu visible avec des rendez-vous éditorialisés et faciles à repérer.",
  },
  {
    title: "Base prête à évoluer",
    text: "L’inscription, l’inventaire et les besoins matériels sont déjà structurés pour la suite.",
  },
];

export const inventory = [
  {
    name: "Kits breadboard",
    category: "Electronique",
    quantity: 14,
    condition: "Bon état",
    location: "Armoire A1",
  },
  {
    name: "Cartes Arduino Uno",
    category: "Microcontrôleurs",
    quantity: 9,
    condition: "Bon état",
    location: "Bac B2",
  },
  {
    name: "Multimètres",
    category: "Mesure",
    quantity: 6,
    condition: "À vérifier",
    location: "Étagère atelier",
  },
  {
    name: "Fers à souder",
    category: "Outillage",
    quantity: 5,
    condition: "Très bon état",
    location: "Zone établi",
  },
];

export const materialNeeds = [
  {
    name: "Résistances assorties",
    wanted: 3,
    priority: "Haute",
    status: "À commander",
  },
  {
    name: "Capteurs ultrason",
    wanted: 6,
    priority: "Moyenne",
    status: "Recherche partenaires",
  },
  {
    name: "Cartes Arduino Nano",
    wanted: 8,
    priority: "Haute",
    status: "Budget en cours",
  },
  {
    name: "Boîtes de rangement",
    wanted: 4,
    priority: "Basse",
    status: "Peut attendre",
  },
];
