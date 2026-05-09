const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const NEWS_FEED_URL = 'https://news.google.com/rss/search?q=cruise%20OR%20cruise%20ship%20OR%20cruise%20line%20travel%20when:14d&hl=en-US&gl=US&ceid=US:en';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function decodeHtml(text){
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/html').documentElement.textContent || text;
}

function categorize(title){
  const lower = title.toLowerCase();
  if(lower.includes('weather') || lower.includes('storm') || lower.includes('hurricane') || lower.includes('tropical')) return 'Weather Watch';
  if(lower.includes('port') || lower.includes('canaveral') || lower.includes('miami') || lower.includes('nassau')) return 'Ports';
  if(lower.includes('airline') || lower.includes('flight') || lower.includes('travel')) return 'Travel Impact';
  return 'Cruise Industry';
}

async function getCruiseNews(){
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(NEWS_FEED_URL)}`);
  if(!response.ok) throw new Error('News feed unavailable');

  const xmlText = await response.text();
  const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
  const items = Array.from(xml.querySelectorAll('item'));

  return items.slice(0,18).map(item => {
    const title = decodeHtml(item.querySelector('title')?.textContent || 'Cruise news update');
    const link = item.querySelector('link')?.textContent || '#';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    return {
      title,
      link,
      pubDate,
      category: categorize(title)
    };
  });
}

function renderHomepageNews(stories){
  if(!newsContainer) return;

  newsContainer.innerHTML = stories.slice(0,5).map(item => `
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.14);">
      <a href="${item.link}" target="_blank" rel="noopener noreferrer"
      style="font-size:18px;font-weight:700;color:#07183f;text-decoration:none;line-height:1.4;display:block;transition:all .18s ease;"
      onmouseover="this.style.color='#0077b6';this.style.transform='translateX(6px)'"
      onmouseout="this.style.color='#07183f';this.style.transform='translateX(0px)'">
        ${item.title}
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
        FEATURED • ${featured.category}
      </div>
      <h2 style="font-size:34px;margin-bottom:10px;line-height:1.15;">${featured.title}</h2>
      <p style="margin-bottom:14px;">A current cruise-related story worth watching for planning, port, weather, or industry impact.</p>
      <a href="${featured.link}" target="_blank" rel="noopener noreferrer" style="display:inline-block;color:#0077b6;font-weight:800;font-size:18px;text-decoration:none;">
        Read Full Story →
      </a>
    </article>

    <div style="display:grid;gap:12px;">
      ${remaining.map(item => `
        <article class="report-box"
        style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.82);backdrop-filter:blur(8px);transition:all .2s ease;">
          <div style="display:inline-block;background:rgba(0,119,182,0.12);color:#0077b6;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:800;margin-bottom:8px;">
            ${item.category}
          </div>
          <h3 style="margin-bottom:8px;line-height:1.25;font-size:24px;">${item.title}</h3>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color:#0077b6;font-weight:800;text-decoration:none;">
            Read Full Story →
          </a>
        </article>
      `).join('')}
    </div>
  `;
}

async function initNews(){
  try{
    const stories = await getCruiseNews();
    if(!stories.length) throw new Error('No stories returned');
    renderHomepageNews(stories);
    renderFullNews(stories);
  } catch(error){
    console.error(error);
    const message = '<p>Unable to load cruise news right now. Please check back shortly.</p>';
    if(newsContainer) newsContainer.innerHTML = message;
    if(fullNewsFeed) fullNewsFeed.innerHTML = message;
  }
}

initNews();