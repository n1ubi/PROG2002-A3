/**
 * event_db.js
 * MySQL database connection for the charity events website.
 * Uses a connection pool, which is better than a single connection for web apps.
 */
const mysql = require('mysql2');

/**
 * Create a connection pool to the charityevents_db database.
 * @returns {object} mysql2 promise-based pool, ready for async/await queries
 */
const pool = mysql.createPool({
  host: 'localhost',          /* MySQL runs on this machine */
  port: 3306,                 /* default MySQL port */
  user: 'root',
  password: 'ac060320!',
  database: 'charityevents_db',
  waitForConnections: true,
  connectionLimit: 10,        /* max simultaneous connections */
  queueLimit: 0,              /* unlimited queued requests */
  dateStrings: true            /* return DATE/TIME as strings (e.g. '2026-11-14') instead of JS Date objects, avoiding timezone shifts */
});

/* Export the promise-based pool so API files can use async/await queries */
module.exports = pool.promise();
