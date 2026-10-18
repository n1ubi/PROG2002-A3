# Charity Events Website (PROG2002 A3)

A full-stack dynamic charity events website built for Web Development II (PROG2002) Assessment 3.

## Tech Stack

- **Frontend:** Angular 22 (standalone components, TypeScript)
- **Backend:** Node.js + Express (RESTful API)
- **Database:** MySQL (mysql2 driver, parameterised queries)
- **Deployment:** SCU cPanel (Phusion Passenger on `/api`, Angular static files in `public_html`)
- **Third-party API:** Open-Meteo (live weather widget for Liuzhou)

## Features

- Browse charity events grouped by Ongoing / Upcoming / Completed
- Search events by keyword, category and date range
- Event detail pages with a fundraising progress bar
- User registration (name, email, phone, tickets) with duplicate-email protection
- Admin panel at `/admin` for full CRUD on events
- Live weather widget on the home page
- Responsive layout, shared Header / Nav / Footer components


## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | List / search events |
| GET | `/api/events/:id` | Single event detail |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/:id` | Update event (admin) |
| DELETE | `/api/events/:id` | Delete event (admin) |
| POST | `/api/events/:id/register` | Submit a registration |
| GET | `/api/categories` | List categories |

## Database

Four tables: `organisations`, `categories`, `events`, `registrations`.
Foreign keys use `ON DELETE CASCADE`; a unique constraint on `(event_id, visitor_email)` prevents double registration.

## Live Demo

Deployed at `https://24832753.it.scu.edu.au`

## Authors

- Qinglai Tian (24832753)
- Jiangran Han
