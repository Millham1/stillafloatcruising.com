const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const rssFeeds = [
  'https://www.cruisehive.com/feed',
  'https://www.cruisecritic.com/articles.xml',
  'https://www.royalcaribbeanblog.com/rss.xml',
  'https://www.seatrade-cruise.com/rss.xml'
];

const fallbackStories = [
  {
    title:'Cruise lines monitoring tropical developments in the Atlantic',
    link:'https://www.cruisehive.com/news/'
  },
  {
    title:'Royal Caribbean expands entertainment offerings across fleet',
    link:'https://www.royalcaribbeanblog.com/'
  },
  {
    title:'Port Canaveral continues major cruise terminal growth',
    link:'https://www.portcanaveral.com/news'
  },
  {
    title:'Cruise itineraries impacted by weather systems in the Caribbean',
    link:'https://www.cruisecritic.com/news/'
  },
  {
    title:'Cruise industry watching new Caribbean tourism fee proposals',
    link:'https://www.seatrade-cruise.com/'
  }
];

function categorize(title){
  const lower = title.toLowerCase();
  if(lower.includes('storm') || lower.includes('weather') || lower.includes('hurricane') || lower.includes('tropical')) return 'Weather Watch';
  if(lower.includes('port') || lower.includes('terminal')) return 'Ports';
  if(lower.includes('tax') || lower.includes('fee') || lower.includes('airline')) return 'Travel Impact';
  return 'Cruise Industry';
}

async function fetchFeed(feedUrl){
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(proxy);
    const data = await response.json();

    if(!data.contents) return [];

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0,5);

    return items.map(item => ({
      title: item.querySelector('title')?.textContent || 'Cruise update',
      link: item.querySelector('link')?.textContent || '#'
    }));

  } catch(error){
    console.error('Feed error', feedUrl, error);
    return [];
  }
}

async function getCruiseNews(){
  try {
    const allFeeds = await Promise.all(rssFeeds.map(fetchFeed));

    const merged = allFeeds.flat()
      .filter(story => story.title && story.link)
      .filter((story, index, self) =>
        index === self.findIndex(s => s.title === story.title)
      );

    if(!merged.length) return fallbackStories;

    return merged.slice(0,15);

  } catch(error){
    console.error('Cruise aggregation failed', error);
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
    <article class="report-box" style="margin-bottom:20px;padding:22px;border-radius:20px;background:rgba(255,255,255,0.88);box-shadow:0 14px 28px rgba(0,0,0,0.10);">
      <div style="display:inline-block;background:#0077b6;color:#5dff9a;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:800;margin-bottom:10px;">
        FEATURED • ${categorize(featured.title)}
      </div>
      <h2 style="font-size:32px;margin-bottom:10px;line-height:1.12;">${featured.title}</h2>
      <a href="${featured.link}" target="_blank" rel="noopener noreferrer" style="display:inline-block;color:#0077b6;font-weight:800;font-size:18px;text-decoration:none;">
        Read Full Story →
      </a>
    </article>

    <div style="display:grid;gap:10px;">
      ${remaining.map(story => `
        <article class="report-box" style="padding:16px 18px;border-radius:16px;background:rgba(255,255,255,0.82);backdrop-filter:blur(8px);">
          <div style="display:inline-block;background:rgba(0,119,182,0.12);color:#0077b6;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;margin-bottom:7px;">
            ${categorize(story.title)}
          </div>
          <h3 style="margin-bottom:6px;line-height:1.22;font-size:22px;">${story.title}</h3>
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