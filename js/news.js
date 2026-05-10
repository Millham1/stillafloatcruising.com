const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

function renderHomepageNews(stories) {
  if (!newsContainer) return;

  if (!stories.length) {
    newsContainer.innerHTML = `
      <div style="padding:14px 0;color:#26415e;font-weight:600;">
        Live cruise stories are loading. Check back shortly.
      </div>
    `;
    return;
  }

  newsContainer.innerHTML = stories.map(story => `
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

function renderFullNews(headlines, extendedStories, weatherStories) {
  if (!fullNewsFeed) return;

  const featured = headlines[0];

  if (!featured) {
    fullNewsFeed.innerHTML = `
      <div class="report-box" style="padding:24px;border-radius:20px;background:rgba(255,255,255,0.88);">
        <h2 style="margin-bottom:12px;">Cruise stories are loading</h2>
        <p style="color:#38506b;line-height:1.5;">
          The live cruise news feed is active but no valid stories are currently available.
        </p>
      </div>
    `;
    return;
  }

  fullNewsFeed.innerHTML = `
    <article class="report-box" style="margin-bottom:24px;padding:24px;border-radius:22px;background:rgba(255,255,255,0.88);box-shadow:0 14px 28px rgba(0,0,0,0.12);">
      <div style="display:inline-block;background:#0077b6;color:#5dff9a;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:800;margin-bottom:10px;">
        FEATURED • ${featured.category}
      </div>

      <h2 style="font-size:34px;margin-bottom:10px;line-height:1.12;">${featured.title}</h2>

      <p style="margin-bottom:14px;color:#26415e;line-height:1.5;">
        ${featured.description || 'Latest cruise developments affecting ships, itineraries, ports, and Caribbean travel.'}
      </p>

      <a href="${featured.link}" target="_blank" rel="noopener noreferrer"
      style="display:inline-block;color:#0077b6;font-weight:800;font-size:18px;text-decoration:none;">
        Read Full Story →
      </a>
    </article>

    <section style="margin-bottom:28px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <h3 style="color:white;font-size:28px;">More Cruise Headlines</h3>
        <span style="color:rgba(255,255,255,0.72);font-size:14px;">Expanded coverage</span>
      </div>

      <div style="display:grid;gap:12px;">
        ${extendedStories.length ? extendedStories.map(story => `
          <article class="report-box" style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.82);backdrop-filter:blur(8px);">
            <div style="display:inline-block;background:rgba(0,119,182,0.12);color:#0077b6;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;margin-bottom:7px;">
              ${story.category}
            </div>

            <h3 style="margin-bottom:8px;line-height:1.22;font-size:22px;">${story.title}</h3>

            <p style="margin-bottom:10px;color:#38506b;line-height:1.45;">
              ${story.description || ''}
            </p>

            <a href="${story.link}" target="_blank" rel="noopener noreferrer"
            style="color:#0077b6;font-weight:800;text-decoration:none;">
              Read Full Story →
            </a>
          </article>
        `).join('') : `
          <div class="report-box" style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.82);">
            Additional cruise stories will appear as more live articles become available.
          </div>
        `}
      </div>
    </section>

    ${weatherStories.length ? `
      <section>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h3 style="color:white;font-size:28px;">Weather & Travel Watch</h3>
        </div>

        <div style="display:grid;gap:10px;">
          ${weatherStories.map(story => `
            <article class="report-box" style="padding:16px 18px;border-radius:16px;background:rgba(7,24,63,0.55);border:1px solid rgba(93,255,154,0.18);">
              <div style="display:inline-block;background:rgba(93,255,154,0.12);color:#5dff9a;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;margin-bottom:8px;">
                ${story.category}
              </div>

              <h3 style="margin-bottom:8px;line-height:1.22;font-size:20px;color:white;">${story.title}</h3>

              <a href="${story.link}" target="_blank" rel="noopener noreferrer"
              style="color:#5dff9a;font-weight:800;text-decoration:none;">
                View Update →
              </a>
            </article>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;
}

async function initNews() {
  try {
    const response = await fetch('/api/cruise-news');
    const data = await response.json();

    renderHomepageNews(data.headlines || []);

    renderFullNews(
      data.headlines || [],
      data.extended || [],
      data.weather || []
    );

  } catch (error) {
    console.error('Cruise news API failed', error);
  }
}

initNews();