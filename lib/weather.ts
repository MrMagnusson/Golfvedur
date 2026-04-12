import { WeatherData, CurrentWeather, HourlyForecast, DailyForecast, PlayabilityStatus } from './types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather Interpretation Codes
export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: 'sunny' },
  1: { label: 'Mainly clear', icon: 'partly_cloudy_day' },
  2: { label: 'Partly cloudy', icon: 'partly_cloudy_day' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'foggy' },
  48: { label: 'Rime fog', icon: 'foggy' },
  51: { label: 'Light drizzle', icon: 'grain' },
  53: { label: 'Drizzle', icon: 'grain' },
  55: { label: 'Heavy drizzle', icon: 'grain' },
  61: { label: 'Light rain', icon: 'rainy' },
  63: { label: 'Rain', icon: 'rainy' },
  65: { label: 'Heavy rain', icon: 'rainy' },
  71: { label: 'Light snow', icon: 'weather_snowy' },
  73: { label: 'Snow', icon: 'weather_snowy' },
  75: { label: 'Heavy snow', icon: 'weather_snowy' },
  77: { label: 'Snow grains', icon: 'weather_snowy' },
  80: { label: 'Light showers', icon: 'rainy' },
  81: { label: 'Showers', icon: 'rainy' },
  82: { label: 'Heavy showers', icon: 'rainy' },
  85: { label: 'Snow showers', icon: 'weather_snowy' },
  86: { label: 'Heavy snow showers', icon: 'weather_snowy' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm w/ hail', icon: 'thunderstorm' },
  99: { label: 'Heavy thunderstorm', icon: 'thunderstorm' },
};

export function getWeatherInfo(code: number): { label: string; icon: string } {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: 'help' };
}

export function getPlayabilityStatus(weather: CurrentWeather): PlayabilityStatus {
  const { temperature, windSpeed, weatherCode } = weather;
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isHeavyRain = [65, 82].includes(weatherCode);
  const isThunder = [95, 96, 99].includes(weatherCode);

  if (temperature < 0 || windSpeed > 15 || isSnow || isThunder) return 'Arctic Exposure';
  if (windSpeed > 10 || isHeavyRain) return 'Wind Advisory';
  if (temperature < 5 || windSpeed > 8) return 'Chilly';
  return 'Playable';
}

export function getPlayabilityColor(status: PlayabilityStatus): string {
  switch (status) {
    case 'Playable':
      return 'bg-primary-container/80 text-primary';
    case 'Chilly':
      return 'bg-tertiary-container/80 text-tertiary';
    case 'Wind Advisory':
      return 'bg-tertiary-container/80 text-tertiary';
    case 'Arctic Exposure':
      return 'bg-tertiary-container/80 text-tertiary';
    default:
      return 'bg-surface-container-highest text-on-surface-variant';
  }
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const durationMs = sunsetMs - sunriseMs;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation',
      'weather_code',
      'relative_humidity_2m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'sunrise',
      'sunset',
    ].join(','),
    wind_speed_unit: 'ms',
    timezone: 'Atlantic/Reykjavik',
    forecast_days: '7',
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`, {
    next: { revalidate: 300 }, // Cache 5 minutes
  });

  if (!res.ok) throw new Error('Failed to fetch weather data');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  // Get current hour index for hourly data
  const now = new Date();
  const currentHourStr = `${now.toISOString().slice(0, 13)}:00`;
  const hourlyTimes: string[] = data.hourly.time;
  const startIdx = Math.max(
    0,
    hourlyTimes.findIndex((t: string) => t >= currentHourStr)
  );

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
    windDirection: data.current.wind_direction_10m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
  };

  const hourly: HourlyForecast[] = hourlyTimes
    .slice(startIdx, startIdx + 24)
    .map((time: string, i: number) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[startIdx + i]),
      precipitationProbability: data.hourly.precipitation_probability[startIdx + i] ?? 0,
      windSpeed: Math.round(data.hourly.wind_speed_10m[startIdx + i] * 10) / 10,
      windDirection: data.hourly.wind_direction_10m[startIdx + i],
      weatherCode: data.hourly.weather_code[startIdx + i],
    }));

  const daily: DailyForecast[] = (data.daily.time as string[]).map((date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    maxTemp: Math.round(data.daily.temperature_2m_max[i]),
    minTemp: Math.round(data.daily.temperature_2m_min[i]),
    precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
    windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i] * 10) / 10,
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  }));

  return { current, hourly, daily };
}
