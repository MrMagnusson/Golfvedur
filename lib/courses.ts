import { Course } from './types';

export const COURSES: Course[] = [
  // ── Capital Region ───────────────────────────────────────────────────
  {
    id: 'grafarholt',
    name: 'Grafarholt Golf Club',
    shortName: 'Grafarholt',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1342,
    lon: -21.7769,
    description: 'Premier 18-hole course in the heart of Reykjavík with views of the surrounding mountains and Esja.',
    holes: 18,
  },
  {
    id: 'korpa',
    name: 'Korpa Golf Club',
    shortName: 'Korpa',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1087,
    lon: -21.8734,
    description: '27-hole facility in east Reykjavík offering challenging coastal winds and expansive fairways.',
    holes: 27,
  },
  {
    id: 'brautarholt',
    name: 'Brautarholt Golf Club',
    shortName: 'Brautarholt',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1423,
    lon: -21.8547,
    description: 'One of Iceland\'s oldest and most established golf clubs with a challenging 18-hole layout.',
    holes: 18,
  },
  {
    id: 'vatnahverfi',
    name: 'Vatnahverfisvöllur',
    shortName: 'Vatnahverfi',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1270,
    lon: -21.8953,
    description: 'Well-maintained course in the Vatnahverfi district of Reykjavík.',
    holes: 18,
  },
  {
    id: 'nesklubburinn',
    name: 'Nesklúbburinn',
    shortName: 'Nesklúbburinn',
    location: 'Seltjarnarnes',
    region: 'Capital Region',
    lat: 64.1553,
    lon: -21.9724,
    description: 'Scenic coastal course on the Seltjarnarnes peninsula with panoramic ocean views.',
    holes: 18,
  },
  {
    id: 'basar',
    name: 'Básar Golf Club',
    shortName: 'Básar',
    location: 'Mosfellsbær',
    region: 'Capital Region',
    lat: 64.1673,
    lon: -21.6932,
    description: 'Picturesque course nestled in the valley between Mosfellsbær and Þingvellir.',
    holes: 18,
  },
  {
    id: 'keilir',
    name: 'Keilir Golf Club',
    shortName: 'Keilir',
    location: 'Hafnarfjörður',
    region: 'Capital Region',
    lat: 64.0347,
    lon: -22.0283,
    description: 'Dramatic coastal course where green fairways meet dark volcanic rock and the North Atlantic.',
    holes: 18,
  },
  {
    id: 'gkg',
    name: 'Golfklúbburinn í Kópavogi',
    shortName: 'GKG',
    location: 'Kópavogur',
    region: 'Capital Region',
    lat: 64.1072,
    lon: -21.9283,
    description: 'Well-maintained 18-hole course in Kópavogur municipality, close to the capital.',
    holes: 18,
  },
  {
    id: 'alftanes',
    name: 'Álftanesvöllur',
    shortName: 'Álftanes',
    location: 'Álftanes',
    region: 'Capital Region',
    lat: 64.0932,
    lon: -22.0012,
    description: 'Peaceful course on the Álftanes peninsula near the Presidential residence, with sea views.',
    holes: 18,
  },
  {
    id: 'gardavollur',
    name: 'Garðavöllur – Leynir',
    shortName: 'Garðavöllur',
    location: 'Garðabær',
    region: 'Capital Region',
    lat: 64.0832,
    lon: -21.9442,
    description: 'Flat, welcoming course run by Golfklúbburinn Leynir in the Garðabær suburb.',
    holes: 18,
  },
  {
    id: 'byggdarholt',
    name: 'Byggðarholtsvöllur',
    shortName: 'Byggðarholt',
    location: 'Borgarbyggð',
    region: 'West Iceland',
    lat: 64.5402,
    lon: -21.9132,
    description: 'Rural course in the Borgarbyggð region of West Iceland.',
    holes: 9,
  },

  // ── Reykjanes Peninsula ──────────────────────────────────────────────
  {
    id: 'thorbergsvollur',
    name: 'Þórbergsvöllur – Grindavík',
    shortName: 'Þórbergsvöllur',
    location: 'Grindavík',
    region: 'Reykjanes',
    lat: 63.8458,
    lon: -22.4321,
    description: 'Volcanic lava-field course near the Blue Lagoon. Wind-swept and dramatic, with ocean views.',
    holes: 9,
  },
  {
    id: 'sandfell',
    name: 'Sandfellsvöllur',
    shortName: 'Sandfell',
    location: 'Reykjanesbær',
    region: 'Reykjanes',
    lat: 63.9852,
    lon: -22.5563,
    description: 'Course near Keflavík Airport in the Reykjanesbær municipality.',
    holes: 18,
  },

  // ── South Iceland ────────────────────────────────────────────────────
  {
    id: 'selfoss',
    name: 'Selfoss Golf Club',
    shortName: 'Selfoss',
    location: 'Selfoss',
    region: 'South Iceland',
    lat: 63.9342,
    lon: -20.9972,
    description: 'Classic South Iceland course set along the banks of the Ölfusá river.',
    holes: 18,
  },
  {
    id: 'vestmannaeyjar',
    name: 'Vestmannaeyjar Golf Club',
    shortName: 'Vestmannaeyjar',
    location: 'Vestmannaeyjar',
    region: 'South Iceland',
    lat: 63.4308,
    lon: -20.2788,
    description: 'Island course with stunning ocean views surrounded by dramatic volcanic landscape.',
    holes: 18,
  },
  {
    id: 'hvolsvollur',
    name: 'Hvolsvöllur Golf Club',
    shortName: 'Hvolsvöllur',
    location: 'Hvolsvöllur',
    region: 'South Iceland',
    lat: 63.7502,
    lon: -20.2302,
    description: 'Course on the South Iceland plains with views of Eyjafjallajökull volcano.',
    holes: 9,
  },
  {
    id: 'frodarvollur',
    name: 'Fróðárvöllur',
    shortName: 'Fróðárvöllur',
    location: 'Snæfellsnes',
    region: 'West Iceland',
    lat: 64.8652,
    lon: -23.4912,
    description: 'Remote Snæfellsnes course with views of the Snæfellsjökull glacier.',
    holes: 9,
  },

  // ── West & North Iceland ──────────────────────────────────────────────
  {
    id: 'akureyri',
    name: 'Akureyri Golf Club',
    shortName: 'Akureyri',
    location: 'Akureyri',
    region: 'North Iceland',
    lat: 65.6812,
    lon: -18.1002,
    description: 'One of the northernmost 18-hole courses in the world. Famous for midnight sun golf tournaments.',
    holes: 18,
  },
  {
    id: 'arnarholt',
    name: 'Arnarholtsvöllur',
    shortName: 'Arnarholt',
    location: 'Dalvík',
    region: 'North Iceland',
    lat: 65.9702,
    lon: -18.5342,
    description: 'Scenic course in Dalvík, run by Golfklúbburinn Hamar, with fjord views.',
    holes: 9,
  },
  {
    id: 'husavik',
    name: 'Húsavík Golf Club',
    shortName: 'Húsavík',
    location: 'Húsavík',
    region: 'North Iceland',
    lat: 66.0442,
    lon: -17.3382,
    description: 'Arctic golf experience near the whale watching capital of Iceland.',
    holes: 9,
  },
  {
    id: 'dalbui',
    name: 'Dalbúi Golf Club',
    shortName: 'Dalbúi',
    location: 'Dalsmynni',
    region: 'North Iceland',
    lat: 65.3802,
    lon: -20.1602,
    description: 'Peaceful rural course in the North Iceland highlands.',
    holes: 9,
  },
  {
    id: 'asbyrgi',
    name: 'Ásbyrgisvöllur',
    shortName: 'Ásbyrgi',
    location: 'Ásbyrgi',
    region: 'North Iceland',
    lat: 66.0162,
    lon: -16.5112,
    description: 'Remote course near the horseshoe-shaped canyon of Ásbyrgi.',
    holes: 9,
  },

  // ── East Iceland ──────────────────────────────────────────────────────
  {
    id: 'egilsstadir',
    name: 'Egilsstaðir Golf Club',
    shortName: 'Egilsstaðir',
    location: 'Egilsstaðir',
    region: 'East Iceland',
    lat: 65.2682,
    lon: -14.3952,
    description: 'Premier golf destination in East Iceland near the birch forests of Hallormsstaðaskógur.',
    holes: 18,
  },
  {
    id: 'ekkjufell',
    name: 'Ekkjufellsvöllur',
    shortName: 'Ekkjufell',
    location: 'Fljótsdalshérað',
    region: 'East Iceland',
    lat: 65.1202,
    lon: -14.8902,
    description: 'East Iceland course run by Golfklúbbur Fljótsdalshéraðs.',
    holes: 9,
  },

  // ── Westfjords ────────────────────────────────────────────────────────
  {
    id: 'isafjordur',
    name: 'Ísafjörður Golf Club',
    shortName: 'Ísafjörður',
    location: 'Ísafjörður',
    region: 'Westfjords',
    lat: 66.0732,
    lon: -23.1272,
    description: 'Golf in the dramatic Westfjords with towering fjord walls on all sides.',
    holes: 9,
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function searchCourses(query: string): Course[] {
  const q = query
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip accents for fuzzy match

  if (!q) return COURSES;

  return COURSES.filter((c) => {
    const fields = [
      c.name,
      c.shortName,
      c.location,
      c.region,
      c.description,
    ]
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return fields.includes(q);
  });
}

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getCourseImageUrl(course: Course, width = 800, height = 400): string {
  return `https://picsum.photos/seed/${course.id}/${width}/${height}`;
}
