// Still Afloat Shared Navbar
// Single-source homepage hero-nav.
// Version: v6-full-page-migration

(function () {
  function getPageType() {
    const path = window.location.pathname;
    if (path === '/' || path.endsWith('/index.html') || path === '') return 'home';
    if (path.endsWith('/news.html')) return 'news';
    if (path.endsWith('/weather.html')) return 'weather';
    if (path.endsWith('/affiliate.html')) return 'affiliate';
    if (path.endsWith('/story.html')) return 'story';
    if (path.endsWith('/forecast.html')) return 'forecast';
    return 'standard';
  }

  const pageType = getPageType();
  const home = pageType === 'home';

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
    #navbar-container{position:relative;z-index:1000;width:100%;min-height:0}
    #navbar-container .hero-nav{width:fit-content;display:inline-block;background:linear-gradient(180deg,rgba(9,72,117,.96),rgba(4,33,66,.96));backdrop-filter:blur(14px);border:1px solid rgba(123,214,255,.32);border-radius:24px;padding:10px 14px;box-shadow:0 18px 40px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.24)}
    #navbar-container .hero-nav .nav-row{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
    #navbar-container .hero-nav .secondary{margin-top:6px}
    #navbar-container .hero-nav a{display:inline-block;font-size:13px;padding:9px 14px;border-radius:14px;color:#fff;text-decoration:none;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);transition:all .2s ease;white-space:nowrap}
    #navbar-container .hero-nav a:hover{background:rgba(93,255,154,.16);border-color:rgba(93,255,154,.32);color:#5dff9a;transform:translateY(-1px)}
    #navbar-container .hero-nav .secondary a{font-size:12px;padding:8px 12px}

    body.home-page #navbar-container{position:absolute;top:22px;right:22px;width:fit-content}
    body.weather-page #navbar-container{position:absolute;top:18px;right:22px;width:fit-content}

    body.news-page #navbar-container,
    body.story-page #navbar-container,
    body.affiliate-page #navbar-container,
    body.forecast-page #navbar-container{
      display:flex;
      justify-content:flex-end;
      padding:18px 22px 8px;
    }

    @media(max-width:980px){
      body.home-page #navbar-container,
      body.weather-page #navbar-container{
        left:12px;
        right:12px;
        width:auto;
        display:flex;
        justify-content:center;
      }

      body.news-page #navbar-container,
      body.story-page #navbar-container,
      body.affiliate-page #navbar-container,
      body.forecast-page #navbar-container{
        justify-content:center;
        padding:14px 12px 18px;
      }

      #navbar-container .hero-nav{max-width:calc(100vw - 24px)}
      #navbar-container .hero-nav .nav-row{justify-content:center}
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.innerHTML = navbarStyles;
  document.head.appendChild(styleElement);

  function injectNavbar() {
    const target = document.getElementById('navbar-container');
    if (!target) return;
    document.body.classList.add(`${pageType}-page`);
    target.innerHTML = navbarHTML;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectNavbar);
  else injectNavbar();
})();