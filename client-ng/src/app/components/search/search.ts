/**
 * Search page: lets users filter events by date, location and category,
 * then displays the matching event cards.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CharityEvent, Category } from '../../models/event';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent implements OnInit {
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  results: CharityEvent[] = [];
  searched = false;
  error = '';

  filters = { date: '', location: '', category: '' };

  ngOnInit(): void {
    this.eventService.getCategories().subscribe(c => {
      this.categories = c;
      this.cdr.detectChanges();
    });
  }

  search(): void {
    this.error = '';
    this.eventService.getEvents(this.filters).subscribe({
      next: (events) => {
        this.results = events;
        this.searched = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Search failed. Is the API running?';
        this.searched = true;
        this.cdr.detectChanges();
      }
    });
  }

  clear(): void {
    this.filters = { date: '', location: '', category: '' };
    this.results = [];
    this.searched = false;
    this.error = '';
    this.cdr.detectChanges();
  }

  priceText(price: number | string): string {
    return Number(price) === 0 ? 'Free entry' : '$' + price;
  }
}
