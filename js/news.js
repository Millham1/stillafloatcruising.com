const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const sampleNews = [
  {
    category:'Travel Impact',
    title:'Airline disruptions continue impacting cruise embarkation cities',
    link:'https://www.cnn.com/travel'
  },
  {
    category:'Weather Watch',
    title:'Atlantic tropical activity being closely monitored by cruise lines',
    link:'https://www.weather.com/'
  },
  {
    category:'Cruise Industry',
    title:'Royal Caribbean reveals enhancements to onboard dining experiences',
    link:'https://www.royalcaribbeanblog.com/'
  },
  {
    category:'Ports',
    title:'Port Canaveral sees record-setting cruise passenger growth',
    link:'https://www.travelpulse.com/cruise'
  },
  {
    category:'Cruise Industry',
    title:'Celebrity Cruises expands premium European shore excursions',
    link:'https://www.cruisecritic.com/news/'
  },
  {
    category:'Travel Impact',
    title:'New tourism taxes discussed across several Caribbean destinations',
    link:'https://www.reuters.com/world/'
  },
  {
    category:'Cruise Industry',
    title:'Major cruise lines continue private island expansion projects',
    link:'https://www.seatrade-cruise.com/'
  },
  {
    category:'Weather Watch',
    title:'Heavy weather systems causing itinerary adjustments in the Caribbean',
    link:'https://www.foxweather.com/'
  }
];

function renderHomepageNews(){
  if(!newsContainer) return;

  newsContainer.innerHTML = sampleNews.slice(0,5).map(item => `
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.14);">
      <a href="${item.link}" target="_blank"
      style="font-size:18px;font-weight:700;color:#07183f;text-decoration:none;line-height:1.4;display:block;transition:all .18s ease;"
      onmouseover="this.style.color='#0077b6';this.style.transform='translateX(6px)'"
      onmouseout="this.style.color='#07183f';this.style.transform='translateX(0px)'">
        ${item.title}
      </a>
    </div>
  `).join('');
}

function renderFullNews(){
  if(!fullNewsFeed) return;

  const featured = sampleNews[0];
  const remaining = sampleNews.slice(1);

  fullNewsFeed.innerHTML = `
    <article class="report-box" style="margin-bottom:24px;padding:28px;border-radius:24px;background:rgba(255,255,255,0.88);box-shadow:0 16px 32px rgba(0,0,0,0.10);">
      <div style="display:inline-block;background:#0077b6;color:#5dff9a;padding:6px 14px;border-radius:999px;font-size:14px;font-weight:800;margin-bottom:14px;">
        FEATURED • ${featured.category}
      </div>
      <h2 style="font-size:38px;margin-bottom:12px;line-height:1.15;">${featured.title}</h2>
      <p style="margin-bottom:18px;">Major developments affecting cruise travelers, embarkation planning, and vacation logistics.</p>
      <a href="${featured.link}" target="_blank" style="display:inline-block;color:#0077b6;font-weight:800;font-size:18px;text-decoration:none;">
        Read Full Story →
      </a>
    </article>

    <div style="display:grid;gap:16px;">
      ${remaining.map(item => `
        <article class="report-box"
        style="padding:22px;border-radius:22px;background:rgba(255,255,255,0.82);backdrop-filter:blur(8px);transition:all .2s ease;">
          <div style="display:inline-block;background:rgba(0,119,182,0.12);color:#0077b6;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:800;margin-bottom:10px;">
            ${item.category}
          </div>
          <h3 style="margin-bottom:10px;line-height:1.25;">${item.title}</h3>
          <a href="${item.link}" target="_blank" style="color:#0077b6;font-weight:800;text-decoration:none;">
            Read Full Story →
          </a>
        </article>
      `).join('')}
    </div>
  `;
}

renderHomepageNews();
renderFullNews();