/**
 * register.js
 * Event registration page: reads the event id from the URL, shows the event
 * summary, validates the user input and submits the registration to the API.
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * Read the event id passed via the URL query string.
 * @returns {string|null} the event id, or null if none was provided
 */
function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

let currentEvent = null;

/**
 * Load and display the selected event summary at the top of the page.
 */
async function loadEventSummary() {
  const summaryBox = document.getElementById('event-summary');
  const id = getEventId();

  if (!id) {
    summaryBox.innerHTML = '<div class="error-box">No event selected. <a href="index.html">Back to home</a></div>';
    return;
  }

  try {
    const response = await fetch(API_BASE + '/events/' + id);
    if (response.status === 404) {
      summaryBox.innerHTML = '<div class="error-box">Event not found.</div>';
      return;
    }
    if (!response.ok) throw new Error('Server returned ' + response.status);

    currentEvent = await response.json();

    summaryBox.innerHTML =
      '<div class="detail-card">' +
      '<span class="category-tag">' + escapeHtml(currentEvent.category_name) + '</span>' +
      '<h3>' + escapeHtml(currentEvent.event_name) + '</h3>' +
      '<p class="meta">📅 ' + currentEvent.event_date +
      (currentEvent.event_time ? ' at ' + currentEvent.event_time.slice(0, 5) : '') + '</p>' +
      '<p class="meta">📍 ' + escapeHtml(currentEvent.location) + ', ' + escapeHtml(currentEvent.district) + '</p>' +
      '<p class="price">Ticket: $' + currentEvent.ticket_price + '</p>' +
      '</div>';

    /* Cancel link goes back to this event's detail page */
    document.getElementById('cancel-btn').href = 'event.html?id=' + id;
  } catch (err) {
    summaryBox.innerHTML =
      '<div class="error-box">Could not load event: ' + escapeHtml(err.message) + '</div>';
  }
}

/**
 * Validate the form input and submit the registration to the API.
 */
async function submitRegistration() {
  const messageBox = document.getElementById('message');
  messageBox.innerHTML = '';

  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const phone = document.getElementById('user-phone').value.trim();
  const tickets = parseInt(document.getElementById('tickets').value, 10);

  /* Client-side validation */
  if (!name) {
    messageBox.innerHTML = '<div class="error-box">Please enter your full name.</div>';
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    messageBox.innerHTML = '<div class="error-box">Please enter a valid email address.</div>';
    return;
  }
  if (!tickets || tickets < 1) {
    messageBox.innerHTML = '<div class="error-box">Please choose at least 1 ticket.</div>';
    return;
  }

  try {
    const response = await fetch(API_BASE + '/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: parseInt(getEventId(), 10),
        user_name: name,
        user_email: email,
        user_phone: phone,
        tickets_purchased: tickets
      })
    });

    const result = await response.json();

    if (!response.ok) {
      messageBox.innerHTML = '<div class="error-box">' + escapeHtml(result.error) + '</div>';
      return;
    }

    /* Success: confirm and jump back to the event detail page */
    alert('Thank you, ' + name + '! Your registration is confirmed (' + tickets + ' ticket(s)).');
    window.location.href = 'event.html?id=' + getEventId();
  } catch (err) {
    messageBox.innerHTML =
      '<div class="error-box">Submission failed: ' + escapeHtml(err.message) + '. Is the API running?</div>';
  }
}

/**
 * Escape HTML special characters to prevent XSS when inserting API data.
 * @param {string} text - raw text from the API response
 * @returns {string} HTML-safe text
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Load the event summary and wire up the submit button on page load */
loadEventSummary();
document.getElementById('submit-btn').addEventListener('click', submitRegistration);
