/**
 * Event detail page: shows full event info, fundraising progress and the list
 * of people who have registered (newest first). Upcoming events link to the
 * registration page; past events show a disabled button.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CharityEvent } from '../../models/event';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  event: CharityEvent | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEvent(id).subscribe({
      next: (ev) => { this.event = ev; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Event not found. It may have been removed.'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  priceText(): string {
    if (!this.event) return '';
    return Number(this.event.ticket_price) === 0 ? 'Free entry' : '$' + this.event.ticket_price;
  }

  goalText(): string {
    if (!this.event) return '';
    return '$' + Number(this.event.goal_amount).toLocaleString();
  }

  progressPercent(): number {
    if (!this.event) return 0;
    return Math.min(Number(this.event.progress_percent) || 0, 100);
  }

  progressLabel(): string {
    if (!this.event) return '';
    if (this.event.status === 'past') return '100% funded — completed';
    return this.progressPercent() + '% funded';
  }

  statusText(): string {
    if (!this.event) return '';
    if (this.event.status === 'past') return 'Past event';
    return this.progressPercent() > 0 ? 'Fundraising in progress' : 'Upcoming';
  }
}
