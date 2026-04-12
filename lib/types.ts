export interface Course {
  id: string;
  name: string;
  shortName: string;
  location: string;
  region: string;
  lat: number;
  lon: number;
  description: string;
  holes: number;
  logoUrl?: string; // club logo from rastimar.golf.is
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  weatherCode: number;
  humidity: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface CourseWithWeather extends Course {
  weather?: WeatherData;
  distanceKm?: number;
}

export type PlayabilityStatus =
  | 'Playable'
  | 'Chilly'
  | 'Wind Advisory'
  | 'Arctic Exposure'
  | 'Loading';
