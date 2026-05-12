const homepageContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

function badgeConfig(tier='lifestyle') {
  if (tier === 'impact') {
    return {
      label: '✈️ Travel Impact',
      style: 'background:rgba(255,77,109,.18);color:#ffd5dd;border:1px solid rgba(255,77,109,.34);'
    };
  }

  if (tier === 'industry') {
    return {
      label: '🚢 Cruise Pulse',
      style: 'background:rgba(67,97,238,.18);color:#d8e2ff;border:1px solid rgba(67,97,238,.34);'
    };
  }

  return {
    label: '🌴 Cruise Life',
    style: 'background:rgba(0,180,216,.18);color:#bff6ff;border:1px solid rgba(0,180,216,.34);'
  };
}

function renderHomepage(stories = []) {
  if (!homepageContainer) return;

  if (!stories.length) {
    homepageContainer.innerHTML = '<div style="padding:16px 0;color:white;font-weight:700;">No live cruise stories are currently available.</div>';
    return;
  }

  homepageContainer.innerHTML = stories.map(story => {
    const badge = badgeConfig(story.tier);

    return `
      <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.12);">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap;">
          <span style="${badge.style}padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.03em;backdrop-filter:blur(8px);">
            ${badge.label}
          </span>

          <span style="color:rgba(255,255,255,.62);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
            ${story.source}
          </span>
        </div>

        <a
          href="${story.link}"
          target="_blank"
          rel="noopener noreferrer"
          style="font-size:16px;font-weight:700;color:white;text-decoration:none;line-height:1.35;display:block;transition:all .18s ease;"
          onmouseover="this.style.color='#5dff9a';this.style.transform='translateX(4px)'"
          onmouseout="this.style.color='white';this.style.transform='translateX(0px)'"
        >
          ${story.title}
        </a>
      </div>
    `;
  }).join('');
}

function renderNewsPage(stories = []) {
  if (!fullNewsFeed) return;

  if (!stories.length) {
    fullNewsFeed.innerHTML = '<div class="report-box" style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.10);backdrop-filter:blur(10px);color:white;">No live cruise stories available.</div>';
    return;
  }

  fullNewsFeed.innerHTML = `
    <div style="display:grid;gap:12px;margin-top:-18px;">
      ${stories.map(story => {
        const badge = badgeConfig(story.tier);

        return `
          <article
            class="report-box"
            style="
              padding:16px 18px;
              border-radius:18px;
              background:rgba(210,230,255,0.10);
              backdrop-filter:blur(14px);
              border:1px solid rgba(255,255,255,.08);
              box-shadow:0 8px 22px rgba(0,0,0,.16);
              transition:all .2s ease;
            "
          >
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <span style="${badge.style}padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.03em;backdrop-filter:blur(8px);">
                  ${badge.label}
                </span>

                <span style="font-size:11px;font-weight:800;color:rgba(255,255,255,.62);text-transform:uppercase;letter-spacing:.05em;">
                  ${story.source}
                </span>
              </div>
            </div>

            <h3 style="font-size:20px;line-height:1.25;margin:0 0 8px;color:white;">
              ${story.title}
            </h3>

            <p style="line-height:1.45;color:rgba(255,255,255,.76);margin-bottom:10px;font-size:14px;">
              ${story.description || ''}
            </p>

            <a
              href="${story.link}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-block;color:#7de3ff;font-weight:800;text-decoration:none;font-size:14px;"
            >
              Read Full Story →
            </a>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

async function initNews() {
  try {
    const response = await fetch('/api/cruise-news');
    const data = await response.json();

    renderHomepage(Array.isArray(data.homepage) ? data.homepage : []);
    renderNewsPage(Array.isArray(data.stories) ? data.stories : []);
  } catch (error) {
    console.error('News feed failed', error);
  }
}

initNews();