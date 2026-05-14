// Still Afloat Unified Navbar
// Version: v2.0

(function () {
  const navbarHTML = `
    <div class="sa-navbar-shell">
      <nav class="sa-navbar-panel">
        <a href="/index.html" class="sa-nav-pill">The Vibe</a>
        <a href="/news.html" class="sa-nav-pill">Cruise Report</a>
        <a href="/about.html" class="sa-nav-pill">Meet Mark</a>
        <a href="https://youtube.com" target="_blank" class="sa-nav-pill">YouTube</a>
        <a href="/affiliate.html" class="sa-nav-pill">Gear</a>
        <a href="#" class="sa-nav-pill sa-nav-pill-primary">Book Your Cruise</a>
      </nav>
    </div>
  `;

  const navbarStyles = `
    .sa-navbar-shell {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 20px 10px;
      position: relative;
      z-index: 1000;
    }

    .sa-navbar-panel {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 12px;

      max-width: 760px;
      width: fit-content;

      padding: 16px;

      border-radius: 30px;

      background:
        linear-gradient(
          180deg,
          rgba(17, 49, 86, 0.95),
          rgba(10, 31, 58, 0.94)
        );

      border: 1px solid rgba(155, 220, 255, 0.22);

      backdrop-filter: blur(18px);

      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.10),
        inset 0 -1px 0 rgba(255,255,255,0.04),
        0 20px 50px rgba(0,0,0,0.34);
    }

    .sa-nav-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      min-width: 138px;
      min-height: 54px;

      padding: 14px 20px;

      border-radius: 18px;

      text-decoration: none;

      color: rgba(255,255,255,0.96);

      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 700;

      background:
        linear-gradient(
          180deg,
          rgba(54, 82, 126, 0.96),
          rgba(33, 57, 96, 0.96)
        );

      border: 1px solid rgba(180, 225, 255, 0.12);

      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.10),
        0 10px 24px rgba(0,0,0,0.24);

      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        border-color 0.18s ease,
        background 0.18s ease;
    }

    .sa-nav-pill:hover {
      transform: translateY(-2px);

      border-color: rgba(165, 226, 255, 0.34);

      background:
        linear-gradient(
          180deg,
          rgba(68, 101, 151, 0.98),
          rgba(41, 68, 112, 0.98)
        );

      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.14),
        0 14px 28px rgba(0,0,0,0.30);
    }

    .sa-nav-pill.active {
      border-color: rgba(112, 219, 255, 0.55);

      background:
        linear-gradient(
          180deg,
          rgba(35, 102, 168, 0.98),
          rgba(17, 62, 112, 0.98)
        );
    }

    .sa-nav-pill-primary {
      min-width: 210px;
    }

    @media (max-width: 920px) {
      .sa-navbar-panel {
        max-width: 94%;
        gap: 10px;
        padding: 14px;
      }

      .sa-nav-pill {
        min-width: 150px;
        font-size: 15px;
      }
    }

    @media (max-width: 640px) {
      .sa-nav-pill,
      .sa-nav-pill-primary {
        width: 100%;
      }
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.innerHTML = navbarStyles;
  document.head.appendChild(styleElement);

  function injectNavbar() {
    const target = document.getElementById('navbar-container');

    if (!target) {
      console.warn('Navbar target not found');
      return;
    }

    target.innerHTML = navbarHTML;

    const currentPage = window.location.pathname;

    const mappings = [
      ['/index.html', 'The Vibe'],
      ['/news.html', 'Cruise Report'],
      ['/about.html', 'Meet Mark'],
      ['/affiliate.html', 'Gear']
    ];

    const pills = target.querySelectorAll('.sa-nav-pill');

    pills.forEach(pill => {
      mappings.forEach(mapping => {
        if (
          currentPage.includes(mapping[0]) &&
          pill.textContent.includes(mapping[1])
        ) {
          pill.classList.add('active');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
  } else {
    injectNavbar();
  }
})();