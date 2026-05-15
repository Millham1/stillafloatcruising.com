function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function actionUrl({ siteUrl, token, action, id }) {
  const origin = String(siteUrl || '').replace(/\/$/, '');
  const tokenPart = token ? `&token=${encodeURIComponent(token)}` : '';
  return `${origin}/api/agent-action?action=${encodeURIComponent(action)}&id=${encodeURIComponent(id)}${tokenPart}`;
}

function renderActionButtons({ siteUrl, token, story }) {
  return ['approve', 'reject', 'defer', 'pin']
    .map(action => {
      const label = action.toUpperCase();
      const href = actionUrl({ siteUrl, token, action, id: story.id });
      return `<a href="${href}" style="display:inline-block;margin:4px 8px 4px 0;padding:10px 14px;border-radius:999px;background:#073763;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;">${label}</a>`;
    })
    .join('');
}

function renderStoryCard({ story, index, siteUrl, token }) {
  const homepageBadge = story.homepageCandidate
    ? '<span style="display:inline-block;margin-left:8px;padding:3px 8px;border-radius:999px;background:#ffca4f;color:#07183f;font-size:12px;font-weight:700;">Homepage Candidate</span>'
    : '';

  const sources = Array.isArray(story.sources)
    ? story.sources.join(', ')
    : Array.isArray(story.sourceAttribution)
      ? story.sourceAttribution.join(', ')
      : '';

  return `
    <section style="border:1px solid #d9e8f2;border-radius:18px;padding:18px;margin:16px 0;background:white;">
      <h2 style="margin:0 0 8px;color:#07183f;font-size:20px;line-height:1.25;">${index + 1}. ${escapeHtml(story.title)} ${homepageBadge}</h2>
      <div style="color:#506b80;font-weight:700;margin-bottom:10px;font-size:13px;">
        ${escapeHtml(story.category || 'Travel Intelligence')} | ${escapeHtml(story.impactLevel || 'Medium')} | ${escapeHtml(sources)}
      </div>
      ${story.travelerImpact ? `<p style="margin:0 0 10px;color:#073763;font-weight:700;line-height:1.45;">Traveler impact: ${escapeHtml(story.travelerImpact)}</p>` : ''}
      <p style="line-height:1.6;color:#1f3344;margin:0 0 12px;">${escapeHtml(story.summary || '')}</p>
      ${story.reasoning ? `<p style="font-size:13px;line-height:1.45;color:#60778a;margin:0 0 12px;"><strong>Editorial reasoning:</strong> ${escapeHtml(story.reasoning)}</p>` : ''}
      ${renderActionButtons({ siteUrl, token, story })}
    </section>
  `;
}

function renderGroupedDevelopments(groupedDevelopments = []) {
  if (!groupedDevelopments.length) return '';

  return `
    <section style="border:1px solid #bcd7e8;border-radius:18px;padding:18px;margin:18px 0;background:#ffffff;">
      <h2 style="margin:0 0 10px;color:#07183f;">Grouped Developments</h2>
      <p style="margin:0 0 14px;color:#506b80;">The AI agent clustered related or duplicate stories into these larger developments.</p>
      ${groupedDevelopments.map(group => `
        <div style="border-top:1px solid #e6eef5;padding-top:12px;margin-top:12px;">
          <strong style="color:#073763;">${escapeHtml(group.title || group.topic || 'Grouped development')}</strong>
          ${group.summary ? `<p style="margin:6px 0 0;color:#1f3344;line-height:1.5;">${escapeHtml(group.summary)}</p>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderRejectedSummary(rejectedStories = []) {
  if (!rejectedStories.length) return '';

  return `
    <section style="border:1px solid #ead1d1;border-radius:18px;padding:18px;margin:18px 0;background:#fffafa;">
      <h2 style="margin:0 0 10px;color:#7a1f1f;">Rejected by Agent</h2>
      <p style="margin:0 0 12px;color:#7a1f1f;">${rejectedStories.length} stories were rejected as low-value, irrelevant, duplicate, or off-brand.</p>
    </section>
  `;
}

function renderEditorialDigest({ stories = [], homepageTop5 = [], groupedDevelopments = [], rejectedStories = [], siteUrl, token }) {
  return `
    <html>
      <body style="margin:0;background:#f3f8fb;font-family:Arial,sans-serif;color:#1f3344;">
        <div style="max-width:880px;margin:0 auto;padding:24px;">
          <header style="background:#07183f;border-radius:22px;padding:26px;color:#ffffff;margin-bottom:20px;">
            <h1 style="margin:0 0 8px;font-size:28px;">Still Afloat Editorial Intelligence Briefing</h1>
            <p style="margin:0;line-height:1.5;color:#d9edf8;">AI-curated cruise and travel intelligence for editorial approval. This digest is relevance-filtered, duplicate-aware, and homepage-aware.</p>
          </header>

          <section style="border:1px solid #d9e8f2;border-radius:18px;padding:18px;background:#ffffff;margin-bottom:18px;">
            <h2 style="margin:0 0 8px;color:#07183f;">Homepage Candidates</h2>
            <p style="margin:0;color:#506b80;line-height:1.5;">The agent selected ${homepageTop5.length} stories as strongest homepage candidates.</p>
          </section>

          ${renderGroupedDevelopments(groupedDevelopments)}

          ${stories.map((story, index) => renderStoryCard({ story, index, siteUrl, token })).join('')}

          ${renderRejectedSummary(rejectedStories)}
        </div>
      </body>
    </html>
  `;
}

module.exports = {
  renderEditorialDigest
};
