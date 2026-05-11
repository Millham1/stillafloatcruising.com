const homepageContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

function badgeColor(tier='lifestyle') {
  if (tier === 'impact') return 'background:#b00020;color:#fff;';
  if (tier === 'industry') return 'background:#1f3c88;color:#bfe8ff;';
  return 'background:#0077b6;color:#5dff9a;';
}

function renderHomepage(stories = []) {
  if (!homepageContainer) return;

  if (!stories.length) {
    homepageContainer.innerHTML = '<div style="padding:16px 0;color:white;font-weight:700;">No live cruise stories are currently available.</div>';
    return;
  }

  homepageContainer.innerHTML = stories.map(story => `
    <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.14);">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
        <span style="${badgeColor(story.tier)}padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.04em;">
          ${story.category}
        </span>
        <span style="color:rgba(255,255,255,.68);font-size:12px;font-weight:700;">
          ${story.source}
        </span>
      </div>

      <a
        href="${story.link}"
        target="_blank"
        rel="noopener noreferrer"
        style="font-size:18px;font-weight:700;color:white;text-decoration:none;line-height:1.4;display:block;transition:all .18s ease;"
        onmouseover="this.style.color='#5dff9a';this.style.transform='translateX(6px)'"
        onmouseout="this.style.color='white';this.style.transform='translateX(0px)'"
      >
        ${story.title}
      </a>
    </div>
  `).join('');
}

function renderSection(title, stories, accent) {
  if (!stories.length) return '';

  return `
    <section style="margin-bottom:38px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
        <div style="width:14px;height:14px;border-radius:999px;background:${accent};box-shadow:0 0 14px ${accent};"></div>
        <h2 style="margin:0;color:white;font-size:34px;letter-spacing:.02em;">${title}</h2>
      </div>

      <div style="display:grid;gap:16px;">
        ${stories.map(story => `
          <article class="report-box" style="padding:22px;border-radius:22px;background:rgba(255,255,255,0.88);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12);box-shadow:0 16px 36px rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <span style="${badgeColor(story.tier)}padding:5px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.04em;">
                  ${story.category}
                </span>

                <span style="font-size:12px;font-weight:800;color:#38506b;text-transform:uppercase;letter-spacing:.05em;">
                  ${story.source}
                </span>
              </div>
            </div>

            <h3 style="font-size:28px;line-height:1.18;margin-bottom:12px;color:#07183f;">
              ${story.title}
            </h3>

            <p style="line-height:1.6;color:#38506b;margin-bottom:16px;font-size:16px;">
              ${story.description || ''}
            </p>

            <a
              href="${story.link}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-block;color:#0077b6;font-weight:800;text-decoration:none;font-size:17px;"
            >
              Read Full Story →
            </a>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderNewsPage(stories = []) {
  if (!fullNewsFeed) return;

  if (!stories.length) {
    fullNewsFeed.innerHTML = '<div class="report-box" style="padding:24px;border-radius:20px;background:rgba(255,255,255,0.88);"><h2>No live cruise stories available</h2></div>';
    return;
  }

  const lifestyle = stories.filter(story => story.tier === 'lifestyle');
  const impact = stories.filter(story => story.tier === 'impact');
  const industry = stories.filter(story => story.tier === 'industry');

  fullNewsFeed.innerHTML = `
    ${renderSection('🌴 Cruise Life', lifestyle, '#00b4d8')}
    ${renderSection('⚠️ Cruise Impact', impact, '#ff4d6d')}
    ${renderSection('📈 Industry Intelligence', industry, '#4361ee')}
  `;
}

async function initNews() {
  try {
    const response = await fetch('/api/cruise-news');
    const data = await response.json();

    const homepageStories = Array.isArray(data.homepage) ? data.homepage : [];
    const allStories = Array.isArray(data.stories) ? data.stories : [];

    renderHomepage(homepageStories);
    renderNewsPage(allStories);
  } catch (error) {
    console.error('News feed failed', error);
  }
}

initNews();