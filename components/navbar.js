// Still Afloat Shared Navbar
// Homepage hero-nav cloned globally with page-aware navigation.
// Version: v4-global-homepage-nav

(function () {
  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path.endsWith('/index.html') || path === '';
  }

  const home = isHomePage();

  const links = {
    home: '/index.html',
    news: '/news.html',
    weather: '/weather.html',
    vibe: home ? '#vibe' : '/index.html#vibe',
    report: home ? '#report' : '/index.html#report',
    mark: home ? '#mark' : '/index.html#mark',
    watch: home ? '#watch' : '/index.html#watch',
    gear: '/affiliate.html',
    book: '#'
  };

  const navbarHTML = `
    <nav class="hero-nav sa-shared-hero-nav" aria-label="Still Afloat navigation">
      <div class="nav-row">
        <a href="${links.home}">Home</a>
        <a href="${links.news}">News</a>
        <a href="${links.weather}">Weather</a>
        <a href="${links.vibe}">The Vibe</a>
        <a href="${links.report}">Cruise Report</a>
      </div>
      <div class="nav-row secondary">
        <a href="${links.mark}">Meet Mark</a>
        <a href="${links.watch}">YouTube</a>
        <a href="${links.gear}">Gear</a>
        <a href="${links.book}">Book Your Cruise</a>
      </div>
    </nav>
  `;

  const navbarStyles = `
    #navbar-container {
      position: relative;
      z-index: 1000;
      width: 100%;
      min-height: 0;
    }

    #navbar-container .hero-nav {
      width: fit-content;
      display: inline-block;
      z-index: 20;
      background:
        linear-gradient(180deg, rgba(9,72,117,.96), rgba(4,33,66,.96));
      backdrop-filter: blur(14px);
      border: 1px solid rgba(123,214,255,.32);
      border-radius: 24px;
      padding: 10px 14px;
      box-shadow:
        0 18px 40px rgba(0,0,0,.38),
        inset 0 1px 0 rgba(255,255,255,.18),
        inset 0 -1px 0 rgba(0,0,0,.24);
    }

    #navbar-container .hero-nav::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 24px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(125,225,255,.38), rgba(255,255,255,.06));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    #navbar-container .hero-nav .nav-row {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      flex-wrap: wrap;
    }

    #navbar-container .hero-nav .secondary {
      margin-top: 6px;
    }

    #navbar-container .hero-nav a {
      display: inline-block;
      font-size: 13px;
      padding: 9px 14px;
      border-radius: 14px;
      color: #ffffff;
      text-decoration: none;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.08);
      transition: all .2s ease;
      text-shadow: 0 1px 4px rgba(0,0,0,.3);
      font-family: inherit;
      line-height: 1.2;
      white-space: nowrap;
    }

    #navbar-container .hero-nav a:hover {
      background: rgba(93,255,154,.16);
      border-color: rgba(93,255,154,.32);
      color: #5dff9a;
      transform: translateY(-1px);
    }

    #navbar-container .hero-nav .secondary a {
      font-size: 12px;
      padding: 8px 12px;
    }

    body:not(.home-page) #navbar-container {
      display: flex;
      justify-content: flex-end;
      padding: 22px 22px 0;
    }

    @media (max-width: 760px) {
      body:not(.home-page) #navbar-container {
        justify-content: center;
        padding: 14px 12px 0;
      }

      #navbar-container .hero-nav {
        max-width: calc(100vw - 24px);
      }

      #navbar-container .hero-nav .nav-row {
        justify-content: center;
      }
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.innerHTML = navbarStyles;
  document.head.appendChild(styleElement);

  function injectNavbar() {
    const target = document.getElementById('navbar-container');
    if (!target) return;

    if (home) {
      document.body.classList.add('home-page');
    }

    target.innerHTML = navbarHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
  } else {
    injectNavbar();
  }
})();