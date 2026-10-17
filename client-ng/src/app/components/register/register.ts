/**
 * Registration page: reads the event id from the URL query, shows the event
 * summary, validates the form and POSTs the registration to the API.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CharityEvent } from '../../models/event';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  event: CharityEvent | null = null;
  error = '';
  submitted = false;

  model = { name: '', email: '', phone: '', tickets: 1 };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (!id) { this.error = 'No event selected.'; this.cdr.detectChanges(); return; }
    this.eventService.getEvent(id).subscribe({
      next: (ev) => { this.event = ev; this.cdr.detectChanges(); },
      error: () => { this.error = 'Event not found.'; this.cdr.detectChanges(); }
    });
  }

  submit(): void {
    this.error = '';
    if (!this.model.name.trim()) { this.error = 'Please enter your full name.'; this.cdr.detectChanges(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.model.email)) {
      this.error = 'Please enter a valid email address.'; this.cdr.detectChanges(); return;
    }
    if (!this.model.tickets || this.model.tickets < 1) {
      this.error = 'Please choose at least 1 ticket.'; this.cdr.detectChanges(); return;
    }

    this.eventService.register({
      event_id: this.event!.event_id,
      user_name: this.model.name,
      user_email: this.model.email,
      user_phone: this.model.phone,
      tickets_purchased: this.model.tickets
    }).subscribe({
      next: () => {
        alert(`Thank you, ${this.model.name}! Your registration is confirmed.`);
        this.router.navigate(['/event', this.event!.event_id]);
      },
      error: (err) => {
        this.error = err.error?.error || 'Submission failed. Is the API running?';
        this.cdr.detectChanges();
      }
    });
  }
}
