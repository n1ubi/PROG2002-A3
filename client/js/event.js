/**
 * event.js
 * Event detail page: reads the event id from the URL query string,
 * fetches the full details from the API, and renders them.
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * 1. Read the event id passed via the URL query string.
 * @returns {string|null} the event id, or null if none was provided
 */
function getEventId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * 2. Fetch and render the event details from the API.
 */
async function loadEvent() {
  const container = document.getElementById('event-detail');
  const id = getEventId();

  if (!id) {
    container.innerHTML =
      '<div class="error-box">No event selected. Go back to the <a href="index.html">home page</a> and choose an event.</div>';
    return;
  }

  try {
    /* Fetch the single event from the API */
    const response = await fetch(API_BASE + '/events/' + id);
    if (response.status === 404) {
      container.innerHTML = '<div class="error-box">Event not found. It may have been removed.</div>';
      return;
    }
    if (!response.ok) throw new Error('Server returned ' + response.status);

    const e = await response.json();

    /* Render the full details */
    const priceText = e.ticket_price == 0 ? 'Free entry' : '$' + e.ticket_price;
    /* Goal vs Progress */
    const goalText = e.goal_amount != null ? '$' + Number(e.goal_amount).toLocaleString() : 'Not announced';
    /* Fundraising progress */
    const progress = Math.min(Number(e.progress_percent) || 0, 100);
    const statusText = e.status === 'past'
      ? 'Past event'
      : (progress > 0 ? 'Fundraising in progress' : 'Upcoming');
    const progressLabel = e.status === 'past'
      ? '100% funded — completed'
      : progress + '% funded';
    /* Register button: completed events show a greyed-out disabled button;
       upcoming events link to the dedicated registration page */
    const registerBtnHtml = e.status === 'past'
      ? '<button class="btn btn-warm" disabled>Event Completed</button>'
      : '<a class="btn btn-warm" href="register.html?id=' + e.event_id + '">&#9829; Register for this event</a>';

    /* Build the list of registrations for this event (already newest-first) */
    const regs = e.registrations || [];
    let regListHtml;
    if (regs.length === 0) {
      regListHtml = '<p class="info-box">No registrations yet — be the first to sign up!</p>';
    } else {
      let rows = '';
      regs.forEach(function (r) {
        rows +=
          '<tr>' +
          '<td>' + escapeHtml(r.user_name) + '</td>' +
          '<td>' + escapeHtml(r.user_email) + '</td>' +
          '<td>' + r.tickets_purchased + '</td>' +
          '<td>' + r.registration_date + '</td>' +
          '</tr>';
      });
      regListHtml =
        '<table class="reg-table"><thead><tr>' +
        '<th>Name</th><th>Email</th><th>Tickets</th><th>Registered on</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>';
    }

    container.innerHTML = `
      <article class="detail-card">
        <img class="detail-img" src="${escapeHtml(e.image_url)}" alt="${escapeHtml(e.event_name)}" onerror="this.style.display='none'">
        <span class="category-tag">${escapeHtml(e.category_name)}</span>
        <h2>${escapeHtml(e.event_name)}</h2>
        <p class="meta">Hosted by ${escapeHtml(e.org_name)}</p>

        <div class="detail-meta">
          <p><strong>Date:</strong> ${e.event_date}</p>
          <p><strong>Time:</strong> ${e.event_time ? e.event_time.slice(0, 5) : 'To be announced'}</p>
          <p><strong>Location:</strong> ${escapeHtml(e.location)}, ${escapeHtml(e.district)}</p>
          <p><strong>Status:</strong> ${statusText}</p>
        </div>

        <p class="description">${escapeHtml(e.event_description)}</p>

        <div class="goal-progress">
          <p><strong>Fundraising Goal:</strong> ${goalText}</p>
          <div class="bar"><div class="bar-fill" style="width:${progress}%"></div></div>
          <div class="labels"><span>Goal</span><span>${progressLabel}</span></div>
        </div>

        <div class="register-box">
          <span class="price">${priceText}</span>
          ${registerBtnHtml}
        </div>

        <section class="registrations-section">
          <h3>Who has registered (${regs.length})</h3>
          ${regListHtml}
        </section>
      </article>
    `;
  } catch (err) {
    container.innerHTML =
      '<div class="error-box">Could not load the event: ' + escapeHtml(err.message) + '. Is the API server running?</div>';
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

/* Run when the page loads */
loadEvent();
