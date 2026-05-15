const REPO = process.env.GITHUB_REPOSITORY || 'Millham1/stillafloatcruising.com';
const BRANCH = process.env.AGENT_BRANCH || 'development';
const APPROVAL_EMAIL = process.env.APPROVAL_EMAIL || 'stillafloatcruising@gmail.com';
const SITE_URL = (process.env.SITE_URL || process.env.VERCEL_URL || '').replace(/\/$/, '');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const AGENT_APPROVAL_TOKEN = process.env.AGENT_APPROVAL_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const NEWS_API_KEY = process.env.newsapi || '';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';
const WEATHER_API_KEY = process.env.weatherpage || '';
const PEXELS_API_KEY = process.env.pexels || '';

const DATA_PATHS = {
  candidates: 'data/news/candidate-stories.json',
  approved: 'data/news/approved-stories.json',
  archive: 'data/news/archive-stories.json'
};

const WATCH_PORTS = [
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Port Canaveral', lat: 28.4089, lon: -80.6043 },
  { name: 'Fort Lauderdale', lat: 26.1224, lon: -80.1373 },
  { name: 'Galveston', lat: 29.3013, lon: -94.7977 },
  { name: 'Tampa', lat: 27.9506, lon: -82.4572 },
  { name: 'New Orleans', lat: 29.9511, lon: -90.0715 },
  { name: 'San Juan', lat: 18.4655, lon: -66.1057 },
  { name: 'Nassau', lat: 25.0443, lon: -77.3504 },
  { name: 'Cozumel', lat: 20.4229, lon: -86.9223 },
  { name: 'Bermuda', lat: 32.3078, lon: -64.7505 }
];

function slugify(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
}

function clean(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value = '') {
  return clean(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function siteOrigin() {
  if (!SITE_URL) return '';
  return SITE_URL.startsWith('http') ? SITE_URL : `https://${SITE_URL}`;
}

function actionUrl(action, id) {
  const origin = siteOrigin();
  const token = AGENT_APPROVAL_TOKEN ? `&token=${encodeURIComponent(AGENT_APPROVAL_TOKEN)}` : '';
  return `${origin}/api/agent-action?action=${encodeURIComponent(action)}&id=${encodeURIComponent(id)}${token}`;
}

function classify(text='') {
  const value = text.toLowerCase();
  if (/storm|hurricane|airport|faa|ground stop|delay|weather|reroute|itinerary|port closure|strike/.test(value)) return { tier: 'impact', category: 'Operational Impact', score: 92 };
  if (/royal caribbean|norwegian|ncl|carnival|msc|celebrity|ship|cruise line/.test(value)) return { tier: 'industry', category: 'Cruise Industry', score: 78 };
  return { tier: 'lifestyle', category: 'Travel Pulse', score: 58 };
}

function similarityKey(story) {
  return clean(`${story.title} ${story.summary}`).toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(word => word.length > 4).slice(0, 12).sort().join('-');
}

function deduplicate(stories = []) {
  const clusters = new Map();
  for (const story of stories) {
    const key = similarityKey(story) || story.id;
    if (!clusters.has(key)) {
      clusters.set(key, { ...story, clusterId: key, sources: [story.source].filter(Boolean), sourceLinks: story.link ? [{ source: story.source, url: story.link }] : [] });
      continue;
    }
    const existing = clusters.get(key);
    if (story.source && !existing.sources.includes(story.source)) existing.sources.push(story.source);
    if (story.link && !existing.sourceLinks.some(item => item.url === story.link)) existing.sourceLinks.push({ source: story.source, url: story.link });
    existing.impactScore = Math.max(existing.impactScore || 0, story.impactScore || 0);
    if ((story.summary || '').length > (existing.summary || '').length) existing.summary = story.summary;
  }
  return [...clusters.values()].sort((a, b) => b.impactScore - a.impactScore).slice(0, 20);
}

async function fetchNewsApiStories() {
  if (!NEWS_API_KEY) return [];
  const query = encodeURIComponent('(cruise OR airline OR airport OR hurricane OR itinerary OR Caribbean)');
  const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${NEWS_API_KEY}`);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.articles || []).map(article => {
    const meta = classify(`${article.title} ${article.description}`);
    return { id: slugify(article.title), title: clean(article.title), summary: clean(article.description || ''), source: clean(article.source?.name || 'NewsAPI'), link: article.url, image: article.urlToImage || '', publishedAt: article.publishedAt, category: meta.category, tier: meta.tier, impactScore: meta.score, featured: false, status: 'candidate' };
  }).filter(story => story.title && story.link);
}

async function fetchGNewsStories() {
  if (!GNEWS_API_KEY) return [];
  const query = encodeURIComponent('(cruise OR airline OR airport OR hurricane OR itinerary)');
  const response = await fetch(`https://gnews.io/api/v4/search?q=${query}&lang=en&max=25&apikey=${GNEWS_API_KEY}`);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.articles || []).map(article => {
    const meta = classify(`${article.title} ${article.description}`);
    return { id: slugify(article.title), title: clean(article.title), summary: clean(article.description || ''), source: clean(article.source?.name || 'GNews'), link: article.url, image: article.image || '', publishedAt: article.publishedAt, category: meta.category, tier: meta.tier, impactScore: meta.score, featured: false, status: 'candidate' };
  }).filter(story => story.title && story.link);
}

async function fetchWeatherSignals() {
  const signals = [];
  for (const port of WATCH_PORTS) {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lon}&daily=weather_code,wind_speed_10m_max,precipitation_probability_max&forecast_days=3`);
      if (!response.ok) continue;
      const data = await response.json();
      const maxWind = Math.max(...(data.daily?.wind_speed_10m_max || [0]));
      const maxRain = Math.max(...(data.daily?.precipitation_probability_max || [0]));
      if (maxWind > 28 || maxRain > 70) {
        signals.push({ id: slugify(`weather-${port.name}`), title: `Weather watch issued for ${port.name} cruise operations`, summary: `${port.name} is showing elevated weather risk over the next several days that could impact cruise embarkation schedules, flight operations, or itinerary stability. Travelers should monitor updates closely as cruise lines may begin operational adjustments if conditions intensify.`, source: WEATHER_API_KEY ? 'Configured Weather API' : 'Open-Meteo', link: 'https://open-meteo.com/', image: '', publishedAt: new Date().toISOString(), category: 'Operational Impact', tier: 'impact', impactScore: 96, featured: true, status: 'candidate' });
      }
    } catch (error) { console.error(error); }
  }
  return signals;
}

async function synthesizeSummaries(stories = []) {
  if (!OPENAI_API_KEY || !stories.length) return stories;
  try {
    const payload = stories.map(story => ({ id: story.id, title: story.title, category: story.category, sources: story.sources, sourceLinks: story.sourceLinks, rawSummary: story.summary }));
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.25,
        messages: [
          { role: 'system', content: 'You write Still Afloat cruise intelligence summaries. Return JSON only. Each summary must be 1 or 2 paragraphs, not bullets, not a copied lead, and must explain why the story matters to cruisers or air travelers.' },
          { role: 'user', content: JSON.stringify(payload) }
        ]
      })
    });
    if (!response.ok) return stories;
    const content = (await response.json()).choices?.[0]?.message?.content || '[]';
    const parsed = JSON.parse(content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
    const summaries = new Map(parsed.map(item => [item.id, item.summary]));
    return stories.map(story => ({ ...story, summary: clean(summaries.get(story.id) || story.summary), aiSummary: Boolean(summaries.get(story.id)) }));
  } catch (error) {
    console.error('AI summary synthesis failed', error);
    return stories;
  }
}

async function buildCandidateFeed() {
  const [newsApi, gnews, weather] = await Promise.all([fetchNewsApiStories(), fetchGNewsStories(), fetchWeatherSignals()]);
  const deduped = deduplicate([...weather, ...newsApi, ...gnews]);
  return synthesizeSummaries(deduped);
}

async function fetchRepoJson(filePath) {
  if (!GITHUB_TOKEN) throw new Error('Missing GITHUB_TOKEN or GH_TOKEN environment variable');
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${encodeURIComponent(BRANCH)}`, { headers: { authorization: `Bearer ${GITHUB_TOKEN}`, accept: 'application/vnd.github+json' } });
  if (!response.ok) throw new Error(`GitHub read failed for ${filePath}: ${response.status}`);
  const payload = await response.json();
  return { sha: payload.sha, json: JSON.parse(Buffer.from(payload.content, 'base64').toString('utf8')) };
}

async function writeRepoJson(filePath, json, message) {
  const current = await fetchRepoJson(filePath);
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
    body: JSON.stringify({ message, branch: BRANCH, sha: current.sha, content: Buffer.from(JSON.stringify(json, null, 2) + '\n').toString('base64') })
  });
  if (!response.ok) throw new Error(`GitHub write failed for ${filePath}: ${response.status}`);
  return response.json();
}

function authorize(req) {
  if (!AGENT_APPROVAL_TOKEN) return true;
  return (req.query?.token || req.headers['x-agent-token']) === AGENT_APPROVAL_TOKEN;
}

function archiveOldApproved(approved, archive) {
  const max = approved.maxPublishedStories || 20;
  const sorted = [...(approved.stories || [])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.impactScore || 0) - (a.impactScore || 0) || new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });
  const active = sorted.slice(0, max);
  const expired = sorted.slice(max).map(story => ({ ...story, status: 'archived', expiredAt: new Date().toISOString() }));
  return { approved: { ...approved, stories: active }, archive: { ...archive, stories: [...(archive.stories || []), ...expired] } };
}

function buildDigestHtml(stories) {
  const rows = stories.map((story, index) => {
    const buttons = ['approve', 'reject', 'defer', 'pin'].map(action => `<a href="${actionUrl(action, story.id)}" style="display:inline-block;margin:4px 6px 4px 0;padding:10px 14px;border-radius:999px;background:#073763;color:white;text-decoration:none;font-weight:700;">${action.toUpperCase()}</a>`).join('');
    return `<section style="border:1px solid #d9e8f2;border-radius:18px;padding:18px;margin:16px 0;background:white;"><h2 style="margin:0 0 8px;color:#07183f;">${index + 1}. ${escapeHtml(story.title)}</h2><p style="color:#506b80;font-weight:700;">${escapeHtml(story.category)} | Impact ${story.impactScore}/100 | ${escapeHtml((story.sources || []).join(', '))}</p><p style="line-height:1.6;color:#1f3344;">${escapeHtml(story.summary)}</p>${buttons}</section>`;
  }).join('');
  return `<html><body style="font-family:Arial,sans-serif;background:#f3f8fb;padding:24px;"><h1 style="color:#07183f;">Still Afloat Intelligence Briefing</h1><p>Review these ${stories.length} deduplicated candidate stories.</p>${rows}</body></html>`;
}

async function sendDigestEmail(stories) {
  if (!RESEND_API_KEY) return { sent: false, reason: 'RESEND_API_KEY not configured', previewHtml: buildDigestHtml(stories) };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.AGENT_EMAIL_FROM || 'Still Afloat Intelligence <onboarding@resend.dev>', to: APPROVAL_EMAIL, subject: `Still Afloat Intelligence Briefing — ${new Date().toLocaleDateString('en-US')}`, html: buildDigestHtml(stories) })
  });
  if (!response.ok) return { sent: false, reason: await response.text() };
  return { sent: true, result: await response.json() };
}

module.exports = { DATA_PATHS, NEWS_API_KEY, GNEWS_API_KEY, WEATHER_API_KEY, PEXELS_API_KEY, APPROVAL_EMAIL, SITE_URL, buildCandidateFeed, deduplicate, slugify, fetchRepoJson, writeRepoJson, authorize, archiveOldApproved, sendDigestEmail, synthesizeSummaries };
