/**
 * server.js
 * PROG2002 A3 - RESTful API for the charity events website.
 * Node.js + Express, retrieves data from MySQL via the event_db.js connection pool.
 * Implements the full CRUD cycle: list/read events, create/update/delete events,
 * list the registrations attached to a single event, and accept new registrations.
 */

const express = require('express');
const cors = require('cors');
const db = require('../db/event_db.js');

const app = express();
const PORT = 3000;

/*
 * Middleware: allow the client-side website to call this API
 */
app.use(cors());
app.use(express.json());

/**
 * Base SELECT with joins so every response includes the category and
 * organisation names, plus a computed 'status' field based on the current date.
 */
const BASE_SELECT = `
  SELECT
    e.event_id,
    e.event_name,
    e.event_description,
    e.event_date,
    e.event_time,
    e.location,
    e.district,
    e.goal_amount,
    e.progress_percent,
    e.ticket_price,
    e.image_url,
    e.category_id,
    e.org_id,
    c.category_name,
    o.org_name,
    IF(e.event_date < CURDATE(), 'past', 'upcoming') AS status
  FROM events e
  JOIN categories c ON e.category_id = c.category_id
  JOIN organisations o ON e.org_id = o.org_id
`;

/**
 * GET /api/events
 * List events for the home page, with optional search filters (date, location,
 * category) used by the search page. Uses parameterised queries to prevent
 * SQL injection.
 * @param {object} req - Express request object; query: {date, location, category}
 * @param {object} res - Express response object; returns JSON array of events
 */
app.get('/api/events', async (req, res) => {
  try {
    const { date, location, category } = req.query;

    let sql = BASE_SELECT + ' WHERE 1=1';
    const params = [];

    if (date) {
      sql += ' AND e.event_date = ?';
      params.push(date);
    }
    if (location) {
      /* match against either the venue name or the district */
      sql += ' AND (e.location LIKE ? OR e.district LIKE ?)';
      params.push('%' + location + '%', '%' + location + '%');
    }
    if (category) {
      sql += ' AND e.category_id = ?';
      params.push(parseInt(category, 10));
    }

    sql += ' ORDER BY e.event_date ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * GET /api/events/:id
 * Full details of one event together with all its registrations (newest
 * registration first), shown on the event detail page.
 * @param {object} req - Express request object; params: {id} event id
 * @param {object} res - Express response object; returns the event object plus
 *                       a 'registrations' array, or 404 if not found
 */
app.get('/api/events/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event id' });
    }

    const [rows] = await db.query(BASE_SELECT + ' WHERE e.event_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    /* Also load the registrations for this event, newest first */
    const [regs] = await db.query(
      'SELECT registration_id, user_name, user_email, user_phone, ' +
      'tickets_purchased, registration_date ' +
      'FROM registrations WHERE event_id = ? ORDER BY registration_date DESC',
      [id]
    );

    const event = rows[0];
    event.registrations = regs;
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * POST /api/events
 * Insert a new charity event (used by the admin-side website).
 * @param {object} req - Express request object; body: event fields
 *                       (event_name, event_date required)
 * @param {object} res - Express response object; returns the new event id
 */
app.post('/api/events', async (req, res) => {
  try {
    const {
      event_name, event_description, event_date, event_time,
      location, district, goal_amount, progress_percent,
      ticket_price, image_url, category_id, org_id
    } = req.body;

    /* Required fields validation */
    if (!event_name || !event_date) {
      return res.status(400).json({ error: 'event_name and event_date are required' });
    }

    const [result] = await db.query(
      'INSERT INTO events ' +
      '(event_name, event_description, event_date, event_time, location, district, ' +
      ' goal_amount, progress_percent, ticket_price, image_url, category_id, org_id) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        event_name, event_description || null, event_date, event_time || null,
        location || null, district || null,
        goal_amount || 0, progress_percent || 0,
        ticket_price || 0, image_url || null,
        category_id || null, org_id || null
      ]
    );

    res.status(201).json({ message: 'Event created', event_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 * Update the details of an existing charity event (used by the admin-side site).
 * @param {object} req - Express request object; params: {id} event id,
 *                       body: event fields to update
 * @param {object} res - Express response object; returns a success message
 */
app.put('/api/events/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event id' });
    }

    const {
      event_name, event_description, event_date, event_time,
      location, district, goal_amount, progress_percent,
      ticket_price, image_url, category_id, org_id
    } = req.body;

    const [result] = await db.query(
      'UPDATE events SET event_name = ?, event_description = ?, event_date = ?, event_time = ?, ' +
      'location = ?, district = ?, goal_amount = ?, progress_percent = ?, ' +
      'ticket_price = ?, image_url = ?, category_id = ?, org_id = ? ' +
      'WHERE event_id = ?',
      [
        event_name, event_description || null, event_date, event_time || null,
        location || null, district || null,
        goal_amount || 0, progress_percent || 0,
        ticket_price || 0, image_url || null,
        category_id || null, org_id || null, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 * Remove an existing charity event. The event can only be deleted when it has
 * no registrations yet; otherwise a 409 error is returned to protect data
 * integrity.
 * @param {object} req - Express request object; params: {id} event id
 * @param {object} res - Express response object; returns a success or error message
 */
app.delete('/api/events/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event id' });
    }

    /* Check whether any registrations exist for this event */
    const [rows] = await db.query(
      'SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ?',
      [id]
    );
    if (rows[0].cnt > 0) {
      return res.status(409).json({
        error: 'Cannot delete: this event already has ' + rows[0].cnt +
               ' registration(s). Delete those first.'
      });
    }

    const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

/**
 * POST /api/registrations
 * Insert a new registration for an event (used by the client-side registration page).
 * Rejects duplicate registrations for the same event + email.
 * @param {object} req - Express request object; body: {event_id, user_name,
 *                       user_email, user_phone, tickets_purchased}
 * @param {object} res - Express response object; returns the new registration id
 */
app.post('/api/registrations', async (req, res) => {
  try {
    const { event_id, user_name, user_email, user_phone, tickets_purchased } = req.body;

    if (!event_id || !user_name || !user_email) {
      return res.status(400).json({ error: 'event_id, user_name and user_email are required' });
    }

    const [result] = await db.query(
      'INSERT INTO registrations (event_id, user_name, user_email, user_phone, tickets_purchased) ' +
      'VALUES (?, ?, ?, ?, ?)',
      [event_id, user_name, user_email, user_phone || null, tickets_purchased || 1]
    );

    res.status(201).json({ message: 'Registration confirmed', registration_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already registered for this event.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

/**
 * GET /api/categories
 * Event categories, used to populate the search form dropdown.
 * @param {object} req - Express request object (no parameters)
 * @param {object} res - Express response object; returns JSON array of categories
 */
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT category_id, category_name FROM categories ORDER BY category_name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * Start the API server and listen on the configured port.
 */
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
