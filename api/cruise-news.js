const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.newsapi;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed', tier: 'lifestyle' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml', tier: 'lifestyle' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/', tier: 'impact' }
];

const NEWSAPI_SEARCHES = [
  { q: 'cruise ship OR cruise line OR cruise port', tier: 'industry' },
  { q: 'Caribbean cruise OR Bahamas cruise OR Alaska cruise', tier: 'lifestyle' },
  { q: 'Norwegian Cruise Line OR Royal Caribbean OR Celebrity Cruises OR Carnival Cruise', tier: 'industry' },
  { q: 'cruise itinerary change OR cruise port delay OR cruise weather impact', tier: 'impact' },
  { q: 'new cruise ship OR cruise loyalty program OR cruise travel tips', tier: 'lifestyle' }
];

const POSITIVE_TERMS = [
  'cruise','ship','port','itinerary','caribbean','bahamas','alaska','mediterranean','vacation','travel','tourism','airport','hurricane','island','resort','royal caribbean','norwegian','celebrity','carnival','msc','disney cruise','ncl','cruise line','cruise ship','shore excursion','passenger'
];

const NEGATIVE_TERMS = [
  'hiv','genetic','politics','election','war','murder','research paper','medical study','virus','stock prediction','thc beverage','car market','football','basketball','celebrity gossip'
];

function normalizeText(text = '') {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return normalizeText(match?.[1] || '');
}

function normalizeStory(raw) {
  const tier = raw.tier || 'lifestyle';

  return {
    title: normalizeText(raw.title || ''),
    description: normalizeText(raw.description || ''),
    link: normalizeText(raw.link || ''),
    source: normalizeText(raw.source || 'Unknown'),
    tier,
    category: tier === 'impact' ? 'Travel Impact' : tier === 'industry' ? 'Cruise Pulse' : 'Cruise Life',
    publishedAt: raw.publishedAt || null,
    image: raw.image || null,
    score: tier === 'impact' ? 300 : tier === 'industry' ? 250 : 200
  };
}

function isCruiseRelevant(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();
  const positive = POSITIVE_TERMS.some(term => text.includes(term));
  const negative = NEGATIVE_TERMS.some(term => text.includes(term));
  return story.title && story.link && positive && !negative;
}

function storyDateValue(story) {
  const time = Date.parse(story.publishedAt || '');
  return Number.isFinite(time) ? time : 0;
}

function dedupeStories(stories) {
  const seenLinks = new Set();
  const seenNarratives = new Set();
  const sourceCounts = {};
  const maxPerSource = 8;

  return stories.filter(story => {
    const linkKey = story.link.toLowerCase().replace(/\?.*$/, '').replace(/\/$/, '');
    if (seenLinks.has(linkKey)) return false;

    const narrativeKey = story.title.toLowerCase()
      .replace(/cruise|line|ship|passengers|new|update|confirmed|timeline|breaking|latest/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 90);

    if (narrativeKey.length > 16 && seenNarratives.has(narrativeKey)) return false;

    sourceCounts[story.source] = sourceCounts[story.source] || 0;
    if (sourceCounts[story.source] >= maxPerSource) return false;

    seenLinks.add(linkKey);
    if (narrativeKey.length > 16) seenNarratives.add(narrativeKey);
    sourceCounts[story.source]++;
    return true;
  });
}

async function fetchNewsApi(search) {
  if (!NEWS_API_KEY) return [];

  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', search.q);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '10');
    url.searchParams.set('apiKey', NEWS_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = await response.json();

    return (data.articles || [])
      .map(article => normalizeStory({
        title: article.title,
        description: article.description,
        link: article.url,
        source: article.source?.name || 'NewsAPI',
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        tier: search.tier
      }))
      .filter(isCruiseRelevant);
  } catch {
    return [];
  }
}

async function fetchRssSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        'user-agent': 'StillAfloatCruising/1.0'
      }
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 12);

    return items.map(match => {
      const item = match[0];
      const guid = extractTag(item, 'guid');
      const link = extractTag(item, 'link') || guid;
      const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'dc:date') || extractTag(item, 'published');

      return normalizeStory({
        title: extractTag(item, 'title'),
        description: extractTag(item, 'description') || extractTag(item, 'content:encoded'),
        link,
        source: source.name,
        tier: source.tier,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : null
      });
    }).filter(isCruiseRelevant);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const [newsStories, rssStories] = await Promise.all([
      Promise.all(NEWSAPI_SEARCHES.map(fetchNewsApi)).then(results => results.flat()),
      Promise.all(RSS_SOURCES.map(fetchRssSource)).then(results => results.flat())
    ]);

    const stories = dedupeStories([...rssStories, ...newsStories])
      .sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
        return storyDateValue(b) - storyDateValue(a);
      })
      .slice(0, 30);

    return res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      homepage: stories.slice(0, 5),
      stories,
      count: stories.length
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      homepage: [],
      stories: [],
      count: 0
    });
  }
}
