/**
 * server.js
 * PROG2002 A2 Part 2 - RESTful API for the charity events website.
 * Node.js + Express, retrieves data from MySQL via the event_db.js connection pool.
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
 * Full details of one event, shown on the event detail page.
 * @param {object} req - Express request object; params: {id} event id
 * @param {object} res - Express response object; returns one event object or 404
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
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
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
