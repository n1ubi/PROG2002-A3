/**
 * index.js
 * Home page: fetches events from the API and renders them into three groups
 * (ongoing, upcoming, completed).
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * Load events from the API and render the cards into the three sections.
 */
async function loadEvents() {
  const container = document.getElementById('event-list');

  try {
    /* 1. Send the GET request to the API */
    const response = await fetch(API_BASE + '/events');

    /* 2. Check the response status */
    if (!response.ok) {
      throw new Error('Server returned ' + response.status);
    }

    /* 3. Parse the JSON from the response body */
    const events = await response.json();

    /*
     * 4. Split the events into ongoing, upcoming and past groups.
     * An event with progress_percent > 0 is treated as "ongoing" (fundraising in
     * progress); completed events show a full progress bar.
     */
    const ongoing = events.filter(function (e) {
      return e.status !== 'past' && e.progress_percent > 0;
    });
    const upcoming = events.filter(function (e) {
      return e.status !== 'past' && !(e.progress_percent > 0);
    });
    const past = events.filter(function (e) {
      return e.status === 'past';
    });

    /* 5. Render all three lists into the DOM */
    renderEvents(ongoing, 'event-list-ongoing', 'No fundraising campaigns in progress right now.');
    renderEvents(upcoming, 'event-list', 'No upcoming events right now. Check back soon!');
    renderEvents(past, 'event-list-past', 'No completed events to show yet.', true);
  } catch (err) {
    /* 6. Show an error message to the user */
    container.innerHTML =
      '<div class="error-box">Sorry, we could not load the events. ' +
      'Please make sure the API server is running. (' + err.message + ')</div>';
  }
}

/**
 * Build one card per event and inject them into the target container.
 * @param {Array} events - list of event objects from the API
 * @param {string} containerId - id of the DOM element to render the cards into
 * @param {string} emptyText - message shown when the events list is empty
 * @param {boolean} showProgress - whether to display the fundraising progress bar
 */
function renderEvents(events, containerId, emptyText, showProgress) {
  const container = document.getElementById(containerId);

  if (events.length === 0) {
    container.innerHTML = '<p class="info-box">' + emptyText + '</p>';
    return;
  }

  let html = '';
  events.forEach(function (e) {
    const progress = Number(e.progress_percent) || 0;
    const progressHtml = showProgress || progress > 0 ? `
      <div class="card-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.min(progress, 100)}%"></div>
        </div>
        <span class="progress-label">${progress >= 100 ? '100% funded — completed' : progress + '% funded'}</span>
      </div>
    ` : '';
    html += `
      <article class="event-card">
        <img class="event-card-img" src="${escapeHtml(e.image_url)}" alt="${escapeHtml(e.event_name)}" onerror="this.style.display='none'">
        <span class="category-tag">${escapeHtml(e.category_name)}</span>
        <h3>${escapeHtml(e.event_name)}</h3>
        <p class="meta">📅 ${e.event_date} ${e.event_time ? 'at ' + e.event_time.slice(0, 5) : ''}</p>
        <p class="meta">📍 ${escapeHtml(e.location)}, ${escapeHtml(e.district)}</p>
        <p class="meta">Hosted by ${escapeHtml(e.org_name)}</p>
        <p class="price">${e.ticket_price == 0 ? 'Free entry' : '$' + e.ticket_price}</p>
        ${progressHtml}
        <a class="btn" href="event.html?id=${e.event_id}">View Details</a>
      </article>
    `;
  });

  container.innerHTML = html;
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

/* Run when the page loads */
loadEvents();
