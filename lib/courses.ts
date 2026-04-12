import { Course } from './types';

export const COURSES: Course[] = [
  {
    id: 'grafarholt',
    name: 'Grafarholt Golf Club',
    shortName: 'Grafarholt',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1342,
    lon: -21.7769,
    description: 'A premier 18-hole course in the heart of Reykjavík with views of the surrounding mountains.',
    holes: 18,
    imageId: 'golf-iceland-1',
  },
  {
    id: 'korpa',
    name: 'Korpa Golf Club',
    shortName: 'Korpa',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1087,
    lon: -21.8734,
    description: 'The premier 27-hole facility in the East, offering challenging coastal winds and expansive fairways.',
    holes: 27,
    imageId: 'golf-iceland-2',
  },
  {
    id: 'keilir',
    name: 'Keilir Golf Club',
    shortName: 'Keilir',
    location: 'Hafnarfjörður',
    region: 'Capital Region',
    lat: 64.0347,
    lon: -22.0283,
    description: 'A dramatic coastal course where green fairways meet dark volcanic rock and the North Atlantic.',
    holes: 18,
    imageId: 'golf-iceland-3',
  },
  {
    id: 'gkg',
    name: 'Golfklúbburinn í Kópavogi',
    shortName: 'GKG',
    location: 'Kópavogur',
    region: 'Capital Region',
    lat: 64.1072,
    lon: -21.9283,
    description: 'A well-maintained 18-hole course in the Kópavogur municipality close to the capital.',
    holes: 18,
    imageId: 'golf-iceland-4',
  },
  {
    id: 'brautarholt',
    name: 'Brautarholt Golf Club',
    shortName: 'Brautarholt',
    location: 'Reykjavík',
    region: 'Capital Region',
    lat: 64.1423,
    lon: -21.8547,
    description: 'One of Iceland\'s most established golf clubs with a challenging 18-hole layout and rich history.',
    holes: 18,
    imageId: 'golf-iceland-5',
  },
  {
    id: 'nesklubburinn',
    name: 'Nesklúbburinn',
    shortName: 'Nesklúbburinn',
    location: 'Seltjarnarnes',
    region: 'Capital Region',
    lat: 64.1553,
    lon: -21.9724,
    description: 'A scenic coastal course on the Seltjarnarnes peninsula with panoramic ocean views.',
    holes: 18,
    imageId: 'golf-iceland-6',
  },
  {
    id: 'basar',
    name: 'Básar Golf Club',
    shortName: 'Básar',
    location: 'Mosfellsbær',
    region: 'Capital Region',
    lat: 64.1673,
    lon: -21.6932,
    description: 'A picturesque 18-hole course nestled in the valley between Mosfellsbær and Þingvellir.',
    holes: 18,
    imageId: 'golf-iceland-7',
  },
  {
    id: 'akureyri',
    name: 'Akureyri Golf Club',
    shortName: 'Akureyri',
    location: 'Akureyri',
    region: 'North Iceland',
    lat: 65.6812,
    lon: -18.1002,
    description: 'One of the northernmost 18-hole golf courses in the world. Famous for midnight sun golf tournaments.',
    holes: 18,
    imageId: 'golf-iceland-8',
  },
  {
    id: 'selfoss',
    name: 'Selfoss Golf Club',
    shortName: 'Selfoss',
    location: 'Selfoss',
    region: 'South Iceland',
    lat: 63.9342,
    lon: -20.9972,
    description: 'A classic South Iceland course set along the banks of the Ölfusá river.',
    holes: 18,
    imageId: 'golf-iceland-9',
  },
  {
    id: 'vestmannaeyjar',
    name: 'Vestmannaeyjar Golf Club',
    shortName: 'Vestmannaeyjar',
    location: 'Vestmannaeyjar',
    region: 'South Iceland',
    lat: 63.4308,
    lon: -20.2788,
    description: 'An island course with stunning ocean views surrounded by dramatic volcanic landscape.',
    holes: 18,
    imageId: 'golf-iceland-10',
  },
  {
    id: 'husavik',
    name: 'Húsavík Golf Club',
    shortName: 'Húsavík',
    location: 'Húsavík',
    region: 'North Iceland',
    lat: 66.0442,
    lon: -17.3382,
    description: 'An Arctic golf experience near the whale watching capital of Iceland.',
    holes: 9,
    imageId: 'golf-iceland-11',
  },
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
    imageId: 'golf-iceland-12',
  },
  {
    id: 'egilsstadir',
    name: 'Egilsstaðir Golf Club',
    shortName: 'Egilsstaðir',
    location: 'Egilsstaðir',
    region: 'East Iceland',
    lat: 65.2682,
    lon: -14.3952,
    description: 'The premier golf destination in East Iceland near the birch forests of Hallormsstaðaskógur.',
    holes: 18,
    imageId: 'golf-iceland-13',
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function searchCourses(query: string): Course[] {
  const q = query.toLowerCase().trim();
  if (!q) return COURSES;
  return COURSES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
  );
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Returns a deterministic landscape image URL for a course using picsum
export function getCourseImageUrl(course: Course, width = 800, height = 400): string {
  return `https://picsum.photos/seed/${course.id}/${width}/${height}`;
}
