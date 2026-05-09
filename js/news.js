const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const fallbackStories = [
  {
    title:'Cruise lines monitoring tropical developments in the Atlantic',
    link:'https://www.weather.com/storms/hurricane'
  },
  {
    title:'Royal Caribbean expands entertainment offerings across fleet',
    link:'https://www.royalcaribbeanblog.com/'
  },
  {
    title:'Port Canaveral continues major cruise terminal growth',
    link:'https://www.portcanaveral.com/'
  },
  {
    title:'Airline delays continue affecting embarkation travel planning',
    link:'https://www.cnn.com/travel'
  },
  {
    title:'Celebrity Cruises updates premium European excursion lineup',
    link:'https://www.cruisecritic.com/news/'
  }
];

function categorize(title){
  const lower = title.toLowerCase();
  if(lower.includes('storm') || lower.includes('weather') || lower.includes('hurricane') || lower.includes('tropical')) return 'Weather Watch';
  if(lower.includes('port')) return 'Ports';
  if(lower.includes('airline') || lower.includes('travel')) return 'Travel Impact';
  return 'Cruise Industry';
}

async function getCruiseNews(){
  try {
    const rssUrl = 'https://rss.nytimes.com/services/xml/rss/nyt/Travel.xml';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    const response = await fetch(proxyUrl);
    const data = await response.json();

    if(!data.contents) return fallbackStories;

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0,12);

    if(!items.length) return fallbackStories;

    return items.map(item => ({
      title: item.querySelector('title')?.textContent || 'Travel update',
      link: item.querySelector('link')?.textContent || '#'
    }));

  } catch(error){
    console.error('News fallback activated', error);
    return fallbackStories;
  }
}

function renderHomepageNews(stories){
  if(!newsContainer) return;

  newsContainer.innerHTML = stories.slice(0,5).map(story => `
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.14);">
      <a href="${story.link}" target="_blank" rel="noopener noreferrer"
      style="font-size:18px;font-weight:700;color:#07183f;text-decoration:none;line-height:1.4;display:block;transition:all .18s ease;"
      onmouseover="this.style.color='#0077b6';this.style.transform='translateX(6px)'"
      onmouseout="this.style.color='#07183f';this.style.transform='translateX(0px)'">
        ${story.title}
      </a>
    </div>
  `).join('');
}

function renderFullNews(stories){
  if(!fullNewsFeed) return;

  const featured = stories[0];
  const remaining = stories.slice(1);

  fullNewsFeed.innerHTML = `
    <article class="report-box" style="margin-bottom:22px;padding:24px;border-radius:22px;background:rgba(255,255,255,0.88);box-shadow:0 16px 32px rgba(0,0,0,0.10);">
      <div style="display:inline-block;background:#0077b6;color:#5dff9a;padding:6px 14px;border-radius:999px;font-size:14px;font-weight:800;margin-bottom:12px;">
        FEATURED • ${categorize(featured.title)}
      </div>
      <h2 style="font-size:34px;margin-bottom:10px;line-height:1.15;">${featured.title}</h2>
      <a href="${featured.link}" target="_blank" rel="noopener noreferrer" style="display:inline-block;color:#0077b6;font-weight:800;font-size:18px;text-decoration:none;">
        Read Full Story →
      </a>
    </article>

    <div style="display:grid;gap:12px;">
      ${remaining.map(story => `
        <article class="report-box" style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.82);backdrop-filter:blur(8px);">
          <div style="display:inline-block;background:rgba(0,119,182,0.12);color:#0077b6;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:800;margin-bottom:8px;">
            ${categorize(story.title)}
          </div>
          <h3 style="margin-bottom:8px;line-height:1.25;font-size:24px;">${story.title}</h3>
          <a href="${story.link}" target="_blank" rel="noopener noreferrer" style="color:#0077b6;font-weight:800;text-decoration:none;">
            Read Full Story →
          </a>
        </article>
      `).join('')}
    </div>
  `;
}

async function initNews(){
  const stories = await getCruiseNews();
  renderHomepageNews(stories);
  renderFullNews(stories);
}

initNews();