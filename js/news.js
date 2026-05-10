const homepageContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

function renderHomepage(stories = []) {
  if (!homepageContainer) return;

  if (!stories.length) {
    homepageContainer.innerHTML = `
      <div style="padding:16px 0;color:#26415e;font-weight:700;">
        No live cruise stories are currently available.
      </div>
    `;
    return;
  }

  homepageContainer.innerHTML = stories.map(story => `
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.14);">
      <a
        href="${story.link}"
        target="_blank"
        rel="noopener noreferrer"
        style="font-size:18px;font-weight:700;color:#07183f;text-decoration:none;line-height:1.4;display:block;transition:all .18s ease;"
        onmouseover="this.style.color='#00c46a';this.style.transform='translateX(6px)'"
        onmouseout="this.style.color='#07183f';this.style.transform='translateX(0px)'"
      >
        ${story.title}
      </a>
    </div>
  `).join('');
}

function renderNewsPage(stories = []) {
  if (!fullNewsFeed) return;

  if (!stories.length) {
    fullNewsFeed.innerHTML = `
      <div class="report-box" style="padding:24px;border-radius:20px;background:rgba(255,255,255,0.88);">
        <h2 style="margin-bottom:10px;">No live cruise stories available</h2>
        <p style="color:#38506b;line-height:1.5;">
          The live cruise feed did not return any valid articles right now.
        </p>
      </div>
    `;
    return;
  }

  const featured = stories[0];
  const remaining = stories.slice(1);

  fullNewsFeed.innerHTML = `
    <article class="report-box" style="margin-bottom:26px;padding:24px;border-radius:22px;background:rgba(255,255,255,0.9);box-shadow:0 14px 28px rgba(0,0,0,0.12);">
      <div style="display:inline-block;background:#0077b6;color:#5dff9a;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:800;margin-bottom:12px;">
        FEATURED • ${featured.category}
      </div>

      <h2 style="font-size:34px;line-height:1.14;margin-bottom:12px;">
        ${featured.title}
      </h2>

      <p style="line-height:1.55;color:#38506b;margin-bottom:16px;">
        ${featured.description || ''}
      </p>

      <a
        href="${featured.link}"
        target="_blank"
        rel="noopener noreferrer"
        style="display:inline-block;color:#0077b6;font-weight:800;text-decoration:none;font-size:18px;"
      >
        Read Full Story →
      </a>
    </article>

    <div style="display:grid;gap:14px;">
      ${remaining.map(story => `
        <article class="report-box" style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.84);backdrop-filter:blur(8px);">
          <div style="display:inline-block;background:rgba(0,119,182,0.12);color:#0077b6;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;margin-bottom:8px;">
            ${story.category}
          </div>

          <h3 style="font-size:22px;line-height:1.25;margin-bottom:10px;">
            ${story.title}
          </h3>

          <p style="line-height:1.5;color:#38506b;margin-bottom:12px;">
            ${story.description || ''}
          </p>

          <a
            href="${story.link}"
            target="_blank"
            rel="noopener noreferrer"
            style="color:#0077b6;font-weight:800;text-decoration:none;"
          >
            Read Full Story →
          </a>
        </article>
      `).join('')}
    </div>
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