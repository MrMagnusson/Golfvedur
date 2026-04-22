import { WeatherData, CurrentWeather, HourlyForecast, DailyForecast, PlayabilityStatus } from './types';

// ---------------------------------------------------------------------------
// met.no (yr.no) — Norwegian Meteorological Institute
// Uses the HARMONIE-AROME Arctic model, optimised for Iceland & North Atlantic
// Docs: https://api.met.no/weatherapi/locationforecast/2.0/documentation
// ---------------------------------------------------------------------------
const MET_NO_BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const MET_NO_USER_AGENT = 'Golfvedur/1.0 (kallimagg8@gmail.com)';

// ---------------------------------------------------------------------------
// Symbol code → app representation
// met.no uses symbol strings; we map to WMO-equivalent codes so the rest of
// the app (icons, playability logic) doesn't need to change.
// ---------------------------------------------------------------------------
interface SymbolInfo { label: string; icon: string; wmoCode: number }

const SYMBOL_CODES: Record<string, SymbolInfo> = {
  clearsky:            { label: 'Clear sky',             icon: 'sunny',           wmoCode: 0  },
  fair:                { label: 'Mainly clear',           icon: 'partly_cloudy_day', wmoCode: 1 },
  partlycloudy:        { label: 'Partly cloudy',          icon: 'partly_cloudy_day', wmoCode: 2 },
  cloudy:              { label: 'Overcast',               icon: 'cloud',           wmoCode: 3  },
  fog:                 { label: 'Fog',                    icon: 'foggy',           wmoCode: 45 },
  lightrain:           { label: 'Light rain',             icon: 'rainy',           wmoCode: 61 },
  rain:                { label: 'Rain',                   icon: 'rainy',           wmoCode: 63 },
  heavyrain:           { label: 'Heavy rain',             icon: 'rainy',           wmoCode: 65 },
  lightrainshowers:    { label: 'Light showers',          icon: 'rainy',           wmoCode: 80 },
  rainshowers:         { label: 'Showers',                icon: 'rainy',           wmoCode: 81 },
  heavyrainshowers:    { label: 'Heavy showers',          icon: 'rainy',           wmoCode: 82 },
  lightsleet:          { label: 'Light sleet',            icon: 'grain',           wmoCode: 61 },
  sleet:               { label: 'Sleet',                  icon: 'grain',           wmoCode: 63 },
  heavysleet:          { label: 'Heavy sleet',            icon: 'grain',           wmoCode: 65 },
  lightsleetshowers:   { label: 'Light sleet showers',   icon: 'grain',           wmoCode: 80 },
  sleetshowers:        { label: 'Sleet showers',          icon: 'grain',           wmoCode: 81 },
  heavysleetshowers:   { label: 'Heavy sleet showers',   icon: 'grain',           wmoCode: 82 },
  lightsnow:           { label: 'Light snow',             icon: 'weather_snowy',   wmoCode: 71 },
  snow:                { label: 'Snow',                   icon: 'weather_snowy',   wmoCode: 73 },
  heavysnow:           { label: 'Heavy snow',             icon: 'weather_snowy',   wmoCode: 75 },
  lightsnowshowers:    { label: 'Light snow showers',     icon: 'weather_snowy',   wmoCode: 85 },
  snowshowers:         { label: 'Snow showers',           icon: 'weather_snowy',   wmoCode: 85 },
  heavysnowshowers:    { label: 'Heavy snow showers',     icon: 'weather_snowy',   wmoCode: 86 },
  thunderstorm:        { label: 'Thunderstorm',           icon: 'thunderstorm',    wmoCode: 95 },
  lightrainandthunder: { label: 'Thunderstorm',           icon: 'thunderstorm',    wmoCode: 95 },
  rainandthunder:      { label: 'Thunderstorm',           icon: 'thunderstorm',    wmoCode: 95 },
  sleetandthunder:     { label: 'Sleet & thunder',        icon: 'thunderstorm',    wmoCode: 95 },
  snowandthunder:      { label: 'Snow & thunder',         icon: 'thunderstorm',    wmoCode: 99 },
  lightsnoWandthunder: { label: 'Snow & thunder',         icon: 'thunderstorm',    wmoCode: 99 },
};

// Keep WMO_CODES for any components that still reference it
export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',          icon: 'sunny'           },
  1:  { label: 'Mainly clear',       icon: 'partly_cloudy_day' },
  2:  { label: 'Partly cloudy',      icon: 'partly_cloudy_day' },
  3:  { label: 'Overcast',           icon: 'cloud'           },
  45: { label: 'Fog',                icon: 'foggy'           },
  48: { label: 'Rime fog',           icon: 'foggy'           },
  51: { label: 'Light drizzle',      icon: 'grain'           },
  53: { label: 'Drizzle',            icon: 'grain'           },
  55: { label: 'Heavy drizzle',      icon: 'grain'           },
  61: { label: 'Light rain',         icon: 'rainy'           },
  63: { label: 'Rain',               icon: 'rainy'           },
  65: { label: 'Heavy rain',         icon: 'rainy'           },
  71: { label: 'Light snow',         icon: 'weather_snowy'   },
  73: { label: 'Snow',               icon: 'weather_snowy'   },
  75: { label: 'Heavy snow',         icon: 'weather_snowy'   },
  77: { label: 'Snow grains',        icon: 'weather_snowy'   },
  80: { label: 'Light showers',      icon: 'rainy'           },
  81: { label: 'Showers',            icon: 'rainy'           },
  82: { label: 'Heavy showers',      icon: 'rainy'           },
  85: { label: 'Snow showers',       icon: 'weather_snowy'   },
  86: { label: 'Heavy snow showers', icon: 'weather_snowy'   },
  95: { label: 'Thunderstorm',       icon: 'thunderstorm'    },
  96: { label: 'Thunderstorm w/ hail', icon: 'thunderstorm'  },
  99: { label: 'Heavy thunderstorm', icon: 'thunderstorm'    },
};

function parseSymbol(symbolCode: string): SymbolInfo {
  // Strip _day / _night / _polartwilight suffixes
  const base = symbolCode.replace(/_(day|night|polartwilight)$/, '');
  return SYMBOL_CODES[base] ?? SYMBOL_CODES[symbolCode] ?? { label: 'Unknown', icon: 'help', wmoCode: 3 };
}

// Wind chill / apparent temperature (°C, m/s)
function apparentTemp(tempC: number, windMs: number): number {
  if (tempC < 10 && windMs > 1.3) {
    const v = windMs * 3.6; // km/h
    return Math.round(13.12 + 0.6215 * tempC - 11.37 * v ** 0.16 + 0.3965 * tempC * v ** 0.16);
  }
  return Math.round(tempC);
}

// ---------------------------------------------------------------------------
// Astronomical sunrise / sunset  (accurate to ~1 min for Iceland latitudes)
// ---------------------------------------------------------------------------
function sunriseSunset(lat: number, lon: number, dateStr: string): { sunrise: string; sunset: string } {
  const date = new Date(dateStr + 'T12:00:00Z');
  const J = date.getTime() / 86400000 + 2440587.5;
  const n = Math.ceil(J - 2451545.0 + 0.5);

  const M = ((357.5291 + 0.98560028 * n) % 360 + 360) % 360;
  const Mr = (M * Math.PI) / 180;
  const C = 1.9148 * Math.sin(Mr) + 0.02 * Math.sin(2 * Mr) + 0.0003 * Math.sin(3 * Mr);
  const lambda = ((M + C + 180 + 102.9372) % 360 + 360) % 360;
  const lr = (lambda * Math.PI) / 180;

  const Jtransit = 2451545.0 + n + 0.0053 * Math.sin(Mr) - 0.0069 * Math.sin(2 * lr);

  const sinDec = Math.sin(lr) * Math.sin((23.4397 * Math.PI) / 180);
  const cosDec = Math.cos(Math.asin(sinDec));
  const latR = (lat * Math.PI) / 180;

  const cosOmega =
    (Math.sin((-0.833 * Math.PI) / 180) - Math.sin(latR) * sinDec) /
    (Math.cos(latR) * cosDec);

  const jToIso = (j: number) => new Date((j - 2440587.5) * 86400000).toISOString();

  // Polar night / midnight sun
  if (cosOmega > 1) return { sunrise: dateStr + 'T12:00:00Z', sunset: dateStr + 'T12:00:00Z' };
  if (cosOmega < -1) return { sunrise: dateStr + 'T00:00:00Z', sunset: dateStr + 'T23:59:59Z' };

  const omega = (Math.acos(cosOmega) * 180) / Math.PI;
  return {
    sunrise: jToIso(Jtransit - omega / 360),
    sunset:  jToIso(Jtransit + omega / 360),
  };
}

// ---------------------------------------------------------------------------
// Public helpers (unchanged API — used by components)
// ---------------------------------------------------------------------------
export function getWeatherInfo(code: number): { label: string; icon: string } {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: 'help' };
}

export function getPlayabilityStatus(weather: CurrentWeather): PlayabilityStatus {
  const { temperature, windSpeed, weatherCode } = weather;
  const isSnow    = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isHeavyRain = [65, 82].includes(weatherCode);
  const isThunder = [95, 96, 99].includes(weatherCode);

  if (temperature < 0 || windSpeed > 15 || isSnow || isThunder) return 'Arctic Exposure';
  if (windSpeed > 10 || isHeavyRain) return 'Wind Advisory';
  if (temperature < 5 || windSpeed > 8)  return 'Chilly';
  return 'Playable';
}

export function getPlayabilityColor(status: PlayabilityStatus): string {
  switch (status) {
    case 'Playable':       return 'bg-primary-container/80 text-primary';
    case 'Chilly':         return 'bg-tertiary-container/80 text-tertiary';
    case 'Wind Advisory':  return 'bg-tertiary-container/80 text-tertiary';
    case 'Arctic Exposure':return 'bg-tertiary-container/80 text-tertiary';
    default:               return 'bg-surface-container-highest text-on-surface-variant';
  }
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Atlantic/Reykjavik',
  });
}

export function formatDay(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    timeZone: 'Atlantic/Reykjavik',
  });
}

export function getDaylightDuration(sunrise: string, sunset: string): string {
  const ms = new Date(sunset).getTime() - new Date(sunrise).getTime();
  const hours   = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

// ---------------------------------------------------------------------------
// met.no fetch
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Timeslot = Record<string, any>;

export async function fetchWeatherMetNo(lat: number, lon: number): Promise<WeatherData> {
  const url = `${MET_NO_BASE}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': MET_NO_USER_AGENT },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`met.no error ${res.status}`);

  const data = await res.json();
  const ts: Timeslot[] = data.properties.timeseries;

  const nowMs = Date.now();
  const current1 = ts.reduce((best: Timeslot, entry: Timeslot) => {
    const d = Math.abs(new Date(entry.time).getTime() - nowMs);
    return d < Math.abs(new Date(best.time).getTime() - nowMs) ? entry : best;
  });

  const inst = current1.data.instant.details;
  const n1h  = current1.data.next_1_hours ?? current1.data.next_6_hours;
  const curSym = parseSymbol(n1h?.summary?.symbol_code ?? 'cloudy');

  const current: CurrentWeather = {
    temperature:         Math.round(inst.air_temperature),
    apparentTemperature: apparentTemp(inst.air_temperature, inst.wind_speed),
    windSpeed:           Math.round(inst.wind_speed * 10) / 10,
    windDirection:       inst.wind_from_direction,
    precipitation:       n1h?.details?.precipitation_amount ?? 0,
    weatherCode:         curSym.wmoCode,
    humidity:            Math.round(inst.relative_humidity ?? 0),
  };

  const hourly: HourlyForecast[] = ts
    .filter((e: Timeslot) => {
      const t = new Date(e.time).getTime();
      const hasData = e.data.next_1_hours ?? e.data.next_6_hours;
      return t >= nowMs && hasData;
    })
    .map((e: Timeslot) => {
      const d   = e.data.instant.details;
      const n1  = e.data.next_1_hours ?? e.data.next_6_hours;
      const sym = parseSymbol(n1?.summary?.symbol_code ?? 'cloudy');
      return {
        time:                     e.time,
        temperature:              Math.round(d.air_temperature),
        precipitationProbability: Math.round(n1?.details?.probability_of_precipitation ?? 0),
        windSpeed:                Math.round(d.wind_speed * 10) / 10,
        windDirection:            d.wind_from_direction,
        weatherCode:              sym.wmoCode,
      };
    });

  const byDay = new Map<string, Timeslot[]>();
  for (const e of ts) {
    const day = e.time.slice(0, 10);
    const arr = byDay.get(day) ?? [];
    arr.push(e);
    byDay.set(day, arr);
  }

  const daily: DailyForecast[] = [...byDay.entries()].slice(0, 7).map(([dateStr, entries]) => {
    const temps  = entries.map((e: Timeslot) => e.data.instant.details.air_temperature as number);
    const winds  = entries.map((e: Timeslot) => e.data.instant.details.wind_speed as number);
    const maxTemp = Math.round(Math.max(...temps));
    const minTemp = Math.round(Math.min(...temps));
    const maxWind = Math.round(Math.max(...winds) * 10) / 10;

    const midday = entries.find((e: Timeslot) => e.time.includes('T12:00:00')) ??
                   entries[Math.floor(entries.length / 2)];
    const reprSlot = midday?.data?.next_1_hours ?? midday?.data?.next_6_hours ?? midday?.data?.next_12_hours;
    const daySym = parseSymbol(reprSlot?.summary?.symbol_code ?? 'cloudy');

    const precipProbs = entries.map((e: Timeslot) =>
      e.data?.next_1_hours?.details?.probability_of_precipitation ??
      e.data?.next_6_hours?.details?.probability_of_precipitation ?? 0
    );

    const { sunrise, sunset } = sunriseSunset(lat, lon, dateStr);
    return {
      date:                    dateStr,
      weatherCode:             daySym.wmoCode,
      maxTemp,
      minTemp,
      precipitationProbability: Math.round(Math.max(...precipProbs)),
      windSpeedMax:            maxWind,
      sunrise,
      sunset,
    };
  });

  return { current, hourly, daily };
}

// ---------------------------------------------------------------------------
// vedur.is (Veðurstofa Íslands) — Icelandic Meteorological Office
// Station-based XML forecast API with Beaufort wind and cardinal directions.
// Accurate local NWP model, accessible from all server environments.
// Docs: https://www.vedur.is/um-vi/vefthjonustur/
// ---------------------------------------------------------------------------

const VEDUR_BASE = 'https://xmlweather.vedur.is/';

// Known vedur.is station IDs and their coordinates.
// We pick the nearest station to the requested lat/lon at query time.
interface VedurStation { id: number; name: string; lat: number; lon: number }

const VEDUR_STATIONS: VedurStation[] = [
  // Capital Region & SW
  { id: 1,    name: 'Reykjavík',      lat: 64.133, lon: -21.900 },
  { id: 422,  name: 'Keflavík',       lat: 63.967, lon: -22.605 },
  { id: 2911, name: 'Akranes',        lat: 64.317, lon: -22.067 },
  // South Iceland
  { id: 1393, name: 'Eyrarbakki',     lat: 63.867, lon: -21.150 },
  { id: 1475, name: 'Vestmannaeyjar', lat: 63.433, lon: -20.283 },
  { id: 1919, name: 'Vík',            lat: 63.418, lon: -18.987 },
  // West Iceland & Snæfellsnes
  { id: 2000, name: 'Stykkishólmur',  lat: 65.083, lon: -22.733 },
  // Westfjords
  { id: 2642, name: 'Ísafjörður',     lat: 66.067, lon: -23.133 },
  // North Iceland
  { id: 3454, name: 'Sauðárkrókur',  lat: 65.733, lon: -19.633 },
  { id: 4820, name: 'Akureyri',       lat: 65.683, lon: -18.083 },
  { id: 5789, name: 'Siglufjörður',   lat: 66.150, lon: -18.917 },
  { id: 6061, name: 'Húsavík',        lat: 66.033, lon: -17.317 },
  { id: 7020, name: 'Mývatn',         lat: 65.600, lon: -16.967 },
  // East Iceland
  { id: 7222, name: 'Egilsstaðir',    lat: 65.283, lon: -14.400 },
  { id: 8410, name: 'Höfn',           lat: 64.267, lon: -15.233 },
];

/** Haversine distance in km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestVedurStation(lat: number, lon: number): VedurStation {
  return VEDUR_STATIONS.reduce((best, s) =>
    haversineKm(lat, lon, s.lat, s.lon) < haversineKm(lat, lon, best.lat, best.lon) ? s : best
  );
}

// Beaufort force → approximate midpoint wind speed in m/s
const BEAUFORT_MS: Record<number, number> = {
  0: 0.2, 1: 0.9, 2: 2.4, 3: 4.4, 4: 6.7, 5: 9.3,
  6: 12.3, 7: 15.5, 8: 18.9, 9: 22.6, 10: 26.4, 11: 30.5, 12: 34.0,
};
function beaufortToMs(bf: number): number {
  return BEAUFORT_MS[Math.round(bf)] ?? Math.round(bf) * 2.9;
}

// Cardinal / intercardinal direction text → degrees (wind-from convention)
const DIR_DEG: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5,
  SE: 135, SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
  W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
  // Icelandic abbreviations sometimes appear
  NA: 45, SUA: 135, SV: 225, NV: 315,
};
function dirToDeg(dir: string): number {
  return DIR_DEG[dir.trim().toUpperCase()] ?? 0;
}

// vedur.is weather description text → WMO code
function vedurDescToWmo(desc: string): number {
  const d = desc.toLowerCase();
  if (d.includes('thunder'))                       return 95;
  if (d.includes('heavy snow') || d.includes('heavy sleet')) return 75;
  if (d.includes('snow shower'))                   return 85;
  if (d.includes('light snow') || d.includes('light sleet')) return 71;
  if (d.includes('snow') || d.includes('sleet'))   return 73;
  if (d.includes('heavy rain') || d.includes('heavy shower')) return 65;
  if (d.includes('shower'))                        return 81;
  if (d.includes('light rain') || d.includes('drizzle'))     return 61;
  if (d.includes('rain'))                          return 63;
  if (d.includes('fog') || d.includes('mist'))     return 45;
  if (d.includes('overcast') || d.includes('cloudy')) return 3;
  if (d.includes('partly cloudy') || d.includes('mostly cloudy')) return 2;
  if (d.includes('mainly clear') || d.includes('mostly clear'))   return 1;
  if (d.includes('clear') || d.includes('sunny') || d.includes('fair')) return 0;
  return 3; // default to overcast if unknown
}

/** Extract first text content of an exact tag (no prefix-match false positives).
 *  <F> will NOT match <ftime> because after 'F' the pattern requires '>' or whitespace. */
function xmlFirst(xml: string, tag: string): string {
  const esc = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = xml.match(new RegExp(`<${esc}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${esc}>`, 'i'));
  return m ? m[1].trim() : '';
}

/** Extract all block contents of an exact tag from an XML string */
function xmlAll(xml: string, tag: string): string[] {
  const esc = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${esc}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${esc}>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

/** Parse "YYYY-MM-DD HH:MM:SS" (Iceland = UTC+0) → ISO string */
function ftimeToIso(ftime: string): string {
  // e.g. "2025-04-21 14:00:00" → "2025-04-21T14:00:00Z"
  return ftime.replace(' ', 'T') + (ftime.endsWith('Z') ? '' : 'Z');
}

export async function fetchWeatherVedur(lat: number, lon: number): Promise<WeatherData> {
  const station = nearestVedurStation(lat, lon);

  const url =
    `${VEDUR_BASE}?op_w=xml&type=forec&lang=en&view=xml` +
    `&ids=${station.id}&time=1h&interval=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`vedur.is error ${res.status} for station ${station.id}`);

  const xml = await res.text();

  // Parse all <forecast> blocks from the station
  const blocks = xmlAll(xml, 'forecast');
  if (blocks.length === 0) throw new Error(`vedur.is: no forecast blocks for station ${station.id}`);

  interface VedurSlot {
    time: string;     // ISO
    tempC: number;
    windMs: number;
    windDeg: number;
    wmoCode: number;
  }

  const nowMs = Date.now();

  const slots: VedurSlot[] = blocks
    .map((b) => {
      const ftime = xmlFirst(b, 'ftime');
      const T = parseFloat(xmlFirst(b, 'T'));
      const F = parseFloat(xmlFirst(b, 'F'));
      const D = xmlFirst(b, 'D');
      const W = xmlFirst(b, 'W');
      if (!ftime || isNaN(T) || isNaN(F)) return null;
      return {
        time:    ftimeToIso(ftime),
        tempC:   Math.round(T),
        windMs:  Math.round(beaufortToMs(F) * 10) / 10,
        windDeg: dirToDeg(D),
        wmoCode: vedurDescToWmo(W),
      };
    })
    .filter((s): s is VedurSlot => s !== null);

  if (slots.length === 0) throw new Error('vedur.is: could not parse any forecast slots');

  // Current = closest slot to now
  const current1 = slots.reduce((best, s) =>
    Math.abs(new Date(s.time).getTime() - nowMs) <
    Math.abs(new Date(best.time).getTime() - nowMs)
      ? s : best
  );

  const current: CurrentWeather = {
    temperature:         current1.tempC,
    apparentTemperature: apparentTemp(current1.tempC, current1.windMs),
    windSpeed:           current1.windMs,
    windDirection:       current1.windDeg,
    precipitation:       0,   // vedur.is forecast doesn't include precip amount
    weatherCode:         current1.wmoCode,
    humidity:            0,   // not available from vedur.is forecast
  };

  // Hourly — all future slots
  const hourly: HourlyForecast[] = slots
    .filter((s) => new Date(s.time).getTime() >= nowMs)
    .map((s) => ({
      time:                     s.time,
      temperature:              s.tempC,
      precipitationProbability: 0,   // not in vedur.is forecast XML
      windSpeed:                s.windMs,
      windDirection:            s.windDeg,
      weatherCode:              s.wmoCode,
    }));

  // Daily — group by date, derive min/max/dominant weather
  const byDay = new Map<string, VedurSlot[]>();
  for (const s of slots) {
    const day = s.time.slice(0, 10);
    const arr = byDay.get(day) ?? [];
    arr.push(s);
    byDay.set(day, arr);
  }

  const daily: DailyForecast[] = [...byDay.entries()].slice(0, 7).map(([dateStr, daySlots]) => {
    const temps  = daySlots.map((s) => s.tempC);
    const winds  = daySlots.map((s) => s.windMs);
    // Pick representative weather from midday slot or middle of array
    const midSlot = daySlots.find((s) => s.time.includes('T12:')) ?? daySlots[Math.floor(daySlots.length / 2)];
    const { sunrise, sunset } = sunriseSunset(lat, lon, dateStr);
    return {
      date:                    dateStr,
      weatherCode:             midSlot.wmoCode,
      maxTemp:                 Math.round(Math.max(...temps)),
      minTemp:                 Math.round(Math.min(...temps)),
      precipitationProbability: 0,
      windSpeedMax:            Math.round(Math.max(...winds) * 10) / 10,
      sunrise,
      sunset,
    };
  });

  return { current, hourly, daily };
}

// ---------------------------------------------------------------------------
// Main entry point — met.no preferred (best accuracy), vedur.is as fallback
// (met.no can be blocked from Vercel IPs; vedur.is is always reachable)
// ---------------------------------------------------------------------------
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    return await fetchWeatherMetNo(lat, lon);
  } catch (err) {
    console.warn('met.no unavailable, falling back to vedur.is:', err);
    return await fetchWeatherVedur(lat, lon);
  }
}
