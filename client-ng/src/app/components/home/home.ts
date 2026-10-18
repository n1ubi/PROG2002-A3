/**
 * Home page: fetches events from the API and renders them into three groups
 * (ongoing, upcoming, completed), plus a live weather widget for Liuzhou.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { WeatherService, WeatherResponse } from '../../services/weather.service';
import { CharityEvent } from '../../models/event';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private eventService = inject(EventService);
  private weatherService = inject(WeatherService);
  private cdr = inject(ChangeDetectorRef);

  ongoing: CharityEvent[] = [];
  upcoming: CharityEvent[] = [];
  past: CharityEvent[] = [];
  loading = true;
  error = '';

  /** Weather widget state. */
  weather: WeatherResponse | null = null;
  weatherError = false;

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.ongoing = events.filter(e => e.status !== 'past' && (e.progress_percent || 0) > 0);
        this.upcoming = events.filter(e => e.status !== 'past' && !(e.progress_percent > 0));
        this.past = events.filter(e => e.status === 'past');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Sorry, we could not load the events. Please make sure the API server is running.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.weatherService.getLiuzhouWeather().subscribe({
      next: (data) => {
        this.weather = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.weatherError = true;
        this.cdr.detectChanges();
      }
    });
  }

  formatPrice(price: number | string): string {
    const p = Number(price);
    return p === 0 ? 'Free entry' : '$' + price;
  }

  shortTime(t: string | null | undefined): string {
    return t ? t.slice(0, 5) : '';
  }

  /** WMO code -> emoji + label for the template. */
  describe(code: number): { icon: string; label: string } {
    return WeatherService.describe(code);
  }

  /** Format an ISO date (2026-10-18) as a short weekday like "Sun". */
  shortDay(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
}
