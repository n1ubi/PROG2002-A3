/**
 * search.js
 * Search page: loads categories into the filter form, then queries the API
 * with the selected criteria and renders the matching events.
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * 1. Load event categories from the API into the dropdown.
 */
async function loadCategories() {
  const select = document.getElementById('category');
  try {
    const response = await fetch(API_BASE + '/categories');
    if (!response.ok) throw new Error('Server returned ' + response.status);
    const categories = await response.json();

    /* Build one <option> per category using DOM manipulation */
    categories.forEach(function (c) {
      const option = document.createElement('option');
      option.value = c.category_id;
      option.textContent = c.category_name;
      select.appendChild(option);
    });
  } catch (err) {
    document.getElementById('message').innerHTML =
      '<div class="error-box">Could not load categories: ' + escapeHtml(err.message) + '</div>';
  }
}

/**
 * 2. Run the search when the Search button is clicked.
 * Reads the filter form, validates the input, calls the API and renders results.
 */
async function searchEvents() {
  const message = document.getElementById('message');
  const results = document.getElementById('results');
  message.innerHTML = '';
  results.innerHTML = '';

  /* Read the form values */
  const date = document.getElementById('date').value.trim();
  const location = document.getElementById('location').value.trim();
  const category = document.getElementById('category').value;

  /* Validate the date format (YYYY-MM-DD) before sending it to the API */
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    message.innerHTML =
      '<div class="error-box">Please enter the date in YYYY-MM-DD format (e.g. 2026-10-18).</div>';
    return;
  }

  /* Build the query string - only include filled-in criteria */
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (location) params.append('location', location);
  if (category) params.append('category', category);

  /* Validate: at least one criterion must be selected */
  if (params.toString() === '') {
    message.innerHTML =
      '<div class="error-box">Please select at least one filter (date, location or category).</div>';
    return;
  }

  try {
    /* Call the API endpoint with the query string */
    const response = await fetch(API_BASE + '/events?' + params.toString());
    if (!response.ok) throw new Error('Server returned ' + response.status);
    const events = await response.json();

    if (events.length === 0) {
      results.innerHTML = '<p class="info-box">No events match your filters. Try different criteria.</p>';
      return;
    }

    /* Render the matching events */
    let html = '';
    events.forEach(function (e) {
      html += `
        <article class="event-card">
          <img class="event-card-img" src="${escapeHtml(e.image_url)}" alt="${escapeHtml(e.event_name)}" onerror="this.style.display='none'">
          <span class="category-tag">${escapeHtml(e.category_name)}</span>
          <h3>${escapeHtml(e.event_name)}</h3>
          <p class="meta">📅 ${e.event_date} ${e.event_time ? 'at ' + e.event_time.slice(0, 5) : ''}</p>
          <p class="meta">📍 ${escapeHtml(e.location)}, ${escapeHtml(e.district)}</p>
          <p class="meta">Status: ${e.status === 'past' ? 'Past event' : 'Upcoming'}</p>
          <p class="price">${e.ticket_price == 0 ? 'Free entry' : '$' + e.ticket_price}</p>
          <a class="btn" href="event.html?id=${e.event_id}">View Details</a>
        </article>
      `;
    });
    results.innerHTML = html;
  } catch (err) {
    message.innerHTML =
      '<div class="error-box">Search failed: ' + escapeHtml(err.message) + '. Is the API server running?</div>';
  }
}

/**
 * 3. Clear Filters: reset every form field and hide the results.
 */
function clearFilters() {
  document.getElementById('search-form').reset();
  document.getElementById('message').innerHTML = '';
  document.getElementById('results').innerHTML = '';
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

/* Wire up the buttons and load the categories on page load */
document.getElementById('search-btn').addEventListener('click', searchEvents);
document.getElementById('clear-btn').addEventListener('click', clearFilters);
loadCategories();
