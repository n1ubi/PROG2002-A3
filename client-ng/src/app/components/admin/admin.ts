/**
 * Admin page: CRUD interface for managing charity events.
 * Lists all events in a table, with create / edit / delete actions.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CharityEvent, Category } from '../../models/event';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  events: CharityEvent[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  message = '';

  editingId: number | null = null;
  showForm = false;

  form: any = this.emptyForm();

  ngOnInit(): void {
    this.loadAll();
  }

  emptyForm() {
    return {
      event_name: '',
      category_id: null,
      event_description: '',
      event_date: '',
      event_time: '',
      location: '',
      district: '',
      org_name: '',
      ticket_price: 0,
      goal_amount: 0,
      image_url: ''
    };
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load events. Is the API running?';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.eventService.getCategories().subscribe(c => {
      this.categories = c;
      this.cdr.detectChanges();
    });
  }

  newEvent(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.message = '';
    this.cdr.detectChanges();
  }

  editEvent(e: CharityEvent): void {
    this.editingId = e.event_id;
    this.form = { ...e };
    this.showForm = true;
    this.message = '';
    this.cdr.detectChanges();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
    this.cdr.detectChanges();
  }

  saveForm(): void {
    this.error = '';
    this.message = '';
    if (!this.form.event_name || !this.form.event_date) {
      this.error = 'Event name and date are required.';
      this.cdr.detectChanges();
      return;
    }
    const req = this.editingId
      ? this.eventService.updateEvent(this.editingId, this.form)
      : this.eventService.createEvent(this.form);
    req.subscribe({
      next: () => {
        this.message = this.editingId ? 'Event updated.' : 'Event created.';
        this.showForm = false;
        this.editingId = null;
        this.loadAll();
      },
      error: (err) => {
        this.error = err.error?.error || 'Save failed.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteEvent(e: CharityEvent): void {
    if (!confirm(`Delete "${e.event_name}"? This cannot be undone.`)) return;
    this.eventService.deleteEvent(e.event_id).subscribe({
      next: () => {
        this.message = 'Event deleted.';
        this.loadAll();
      },
      error: (err) => {
        this.error = err.error?.error || 'Delete failed (event may have registrations).';
        this.cdr.detectChanges();
      }
    });
  }
}
