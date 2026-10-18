/**
 * weather.service.ts
 * Fetches current weather and a 5-day forecast for Liuzhou from the free
 * Open-Meteo API (no API key required). Used by the home page widget.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Shape of the data we actually use from Open-Meteo. */
export interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  /** Liuzhou coordinates. */
  private readonly LAT = 24.33;
  private readonly LON = 109.42;

  /**
   * Get current weather and 5-day forecast for Liuzhou.
   * @returns Observable of the Open-Meteo response
   */
  getLiuzhouWeather(): Observable<WeatherResponse> {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${this.LAT}&longitude=${this.LON}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=Asia%2FShanghai&forecast_days=5`;
    return this.http.get<WeatherResponse>(url);
  }

  /**
   * Map a WMO weather code to an emoji icon and a short English label.
   * @param code WMO weather_code from Open-Meteo
   * @returns object with emoji and description
   */
  static describe(code: number): { icon: string; label: string } {
    if (code === 0) return { icon: '☀️', label: 'Clear sky' };
    if (code <= 2) return { icon: '⛅', label: 'Partly cloudy' };
    if (code === 3) return { icon: '☁️', label: 'Overcast' };
    if (code === 45 || code === 48) return { icon: '🌫️', label: 'Fog' };
    if (code >= 51 && code <= 55) return { icon: '🌦️', label: 'Drizzle' };
    if (code >= 61 && code <= 65) return { icon: '🌧️', label: 'Rain' };
    if (code >= 71 && code <= 77) return { icon: '🌨️', label: 'Snow' };
    if (code >= 80 && code <= 82) return { icon: '🌧️', label: 'Showers' };
    if (code >= 95) return { icon: '⛈️', label: 'Thunderstorm' };
    return { icon: '🌡️', label: 'Unknown' };
  }
}
