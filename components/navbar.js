// Still Afloat Shared Navbar
(function () {
  const navbarHTML = `
    <nav class="sa-navbar-shell">
      <div class="sa-navbar-row primary-row">
        <a href="/index.html" class="sa-nav-link">The Vibe</a>
        <a href="/news.html" class="sa-nav-link">Cruise Report</a>
        <a href="#mark" class="sa-nav-link">Meet Mark</a>
        <a href="#watch" class="sa-nav-link">YouTube</a>
      </div>

      <div class="sa-navbar-row secondary-row">
        <a href="/affiliate.html" class="sa-nav-link">Gear</a>
        <a href="#" class="sa-nav-link">Book Your Cruise</a>
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