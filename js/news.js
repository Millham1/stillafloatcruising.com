const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

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
        FEATURED • ${featured.category}
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
            ${story.category}
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
  try {
    const response = await fetch('/api/cruise-news');
    const data = await response.json();

    if(!data.stories || !data.stories.length){
      throw new Error('No stories returned');
    }

    renderHomepageNews(data.stories);
    renderFullNews(data.stories);

  } catch(error){
    console.error('Cruise news API failed', error);
  }
}

initNews();