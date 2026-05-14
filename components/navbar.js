// Still Afloat Shared Navbar
(function () {
  const navbarHTML = `
    <nav class="sa-navbar-shell">
      <div class="sa-navbar-row primary-row">
        <a href="/index.html" class="sa-nav-link">Home</a>
        <a href="/news.html" class="sa-nav-link">News</a>
        <a href="/weather.html" class="sa-nav-link">Weather</a>
        <a href="/index.html#vibe" class="sa-nav-link">The Vibe</a>
        <a href="/news.html" class="sa-nav-link">Cruise Report</a>
      </div>

      <div class="sa-navbar-row secondary-row">
        <a href="/index.html#mark" class="sa-nav-link">Meet Mark</a>
        <a href="https://youtube.com" class="sa-nav-link" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="/affiliate.html" class="sa-nav-link">Gear</a>
        <a href="/index.html#book" class="sa-nav-link">Book Your Cruise</a>
        <a href="/index.html#friday-ai" class="sa-nav-link">Friday AI</a>
      </div>
    </nav>
  `;

  function injectNavbar() {
    const target = document.getElementById('navbar-container');

    if (!target) return;

    target.innerHTML = navbarHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
  } else {
    injectNavbar();
  }
})();