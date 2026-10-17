/**
 * event.service.ts
 * Angular service that wraps the Express REST API for charity events and
 * registrations. Uses HttpClient so every call returns an Observable.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CharityEvent, Category, RegistrationPayload } from '../models/event';

const API_BASE = 'http://127.0.0.1:3000/api';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);

  /**
   * List events, optionally filtered by date, location and category.
   * @param filters object with optional date/location/category query values
   */
  getEvents(filters: { date?: string; location?: string; category?: string } = {}): Observable<CharityEvent[]> {
    let params = new HttpParams();
    if (filters.date) params = params.set('date', filters.date);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.category) params = params.set('category', filters.category);
    console.log('[EventService] GET', `${API_BASE}/events`, params.toString());
    return this.http.get<CharityEvent[]>(`${API_BASE}/events`, { params }).pipe(
      tap({
        next: (data) => console.log('[EventService] received', data?.length, 'events'),
        error: (err) => console.error('[EventService] error', err)
      })
    );
  }

  /**
   * Get one event by id, including its registrations (newest first).
   * @param id event id
   */
  getEvent(id: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(`${API_BASE}/events/${id}`);
  }

  /** List all categories for the search dropdown. */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE}/categories`);
  }

  /**
   * Submit a new registration.
   * @param payload registration details from the user
   */
  register(payload: RegistrationPayload): Observable<{ message: string; registration_id: number }> {
    return this.http.post<{ message: string; registration_id: number }>(
      `${API_BASE}/registrations`, payload
    );
  }
}
