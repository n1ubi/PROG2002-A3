/**
 * TypeScript interfaces matching the /api/events JSON shape returned by the
 * Express backend.
 */

export interface Registration {
  registration_id: number;
  event_id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  tickets_purchased: number;
  registration_date: string;
}

export interface CharityEvent {
  event_id: number;
  event_name: string;
  event_description: string;
  event_date: string;
  event_time: string | null;
  location: string;
  district: string;
  goal_amount: number;
  progress_percent: number;
  ticket_price: number;
  image_url: string;
  category_id: number;
  org_id: number;
  category_name: string;
  org_name: string;
  status: 'upcoming' | 'past';
  /** Only present on GET /api/events/:id */
  registrations?: Registration[];
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface RegistrationPayload {
  event_id: number;
  user_name: string;
  user_email: string;
  user_phone?: string;
  tickets_purchased: number;
}
