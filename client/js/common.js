/**
 * common.js
 * Shared page segments (Header, Nav, Footer) for every client-side page.
 * The markup for the common segments is written only here and injected into
 * the placeholder elements, so the same Header / Nav / Footer is reused across
 * all pages instead of being duplicated in each HTML file.
 */

/**
 * Render the site brand and navigation links into the common header block.
 * The link matching the current page is automatically marked as "active".
 */
function renderHeaderNav() {
  const header = document.getElementById('site-header');
  if (!header) return;

  /* Detect the current page file name from the URL */
  const page = window.location.pathname.split('/').pop() || 'index.html';

  header.innerHTML =
    '<div class="brand">GreatLove <span>Events</span></div>' +
    '<nav id="main-nav">' +
    '<ul>' +
    '<li><a href="index.html"' + (page === 'index.html' ? ' class="active"' : '') + '>Home</a></li>' +
    '<li><a href="search.html"' + (page === 'search.html' ? ' class="active"' : '') + '>Search Events</a></li>' +
    '</ul>' +
    '</nav>';
}

/**
 * Render the copyright footer into #site-footer.
 */
function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML =
    '&copy; 2026 GreatLove Organization. All rights reserved.<br /><br /><i>--Lonnie</i>';
}

/* Build the shared Header / Nav / Footer segments when the page loads */
renderHeaderNav();
renderFooter();
