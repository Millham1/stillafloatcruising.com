const NEWS_API_KEY = process.env.NEWS_API_KEY;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed', authority: 45 },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml', authority: 55 },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/', authority: 70 },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml', authority: 70 }
];

const NEWSAPI_SEARCHES = [
  { q: 'cruise vacation OR cruise travel OR cruise passengers', tier: 'lifestyle' },
  { q: 'Caribbean cruise OR Alaska cruise OR Mediterranean cruise', tier: 'lifestyle' },
  { q: 'cruise ship food OR cruise entertainment OR private island', tier: 'lifestyle' },
  { q: 'cruise weather OR hurricane cruise OR itinerary change', tier: 'impact' },
  { q: 'port closure cruise OR delayed cruise ship', tier: 'impact' },
  { q: 'airport delays cruise passengers OR travel disruption cruise', tier: 'impact' },
  { q: 'cruise industry earnings OR ship order OR fleet expansion', tier: 'industry' }
];

const TRUSTED_MAINSTREAM = [
  'cnn',
  'reuters',
  'associated press',
  'ap news',
  'cbs',
  'nbc',
  'fox',
  'usa today',
  'weather channel',
  'travelandleisure',
  'bloomberg'
];

const TIER_PRIORITY = {
  lifestyle: 300,
  impact: 200,
  industry: 100
};

function normalizeText(text='') {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();
}

function normalizeUrl(url='') {
  return url.trim().replace(/\/$/, '');
}

function hostname(url='') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function authorityScore(source='', url='') {
  const text = `${source} ${hostname(url)}`.toLowerCase();

  if (text.includes('reuters')) return 95;
  if (text.includes('associated press') || text.includes('apnews')) return 92;
  if (text.includes('cnn')) return 88;
  if (text.includes('cbs')) return 84;
  if (text.includes('nbc')) return 84;
  if (text.includes('fox')) return 80;
  if (text.includes('usa today')) return 78;
  if (text.includes('weather')) return 82;
  if (text.includes('travelandleisure')) return 80;
  if (text.includes('bloomberg')) return 85;
  if (text.includes('royal caribbean blog')) return 72;
  if (text.includes('cruise industry')) return 70;
  if (text.includes('seatrade')) return 68;
  if (text.includes('cruisehive')) return 55;

  return 50;
}

function categoryFor(tier='lifestyle') {
  if (tier === 'impact') return 'Cruise Impact';
  if (tier === 'industry') return 'Industry Intelligence';
  return 'Cruise Life';
}

function scoreStory(story) {
  const authority = authorityScore(story.source, story.link);
  const published = new Date(story.publishedAt || 0).getTime();
  const freshness = published
    ? Math.max(0, 24 - Math.floor((Date.now() - published) / 3600000))
    : 0;

  return (TIER_PRIORITY[story.tier] || 0) + authority + freshness;
}

function normalizeStory(raw) {
  const story = {
    title: normalizeText(raw.title || ''),
    description: normalizeText(raw.description || ''),
    link: normalizeUrl(raw.link || ''),
    source: raw.source || hostname(raw.link) || 'News source',
    publishedAt: raw.publishedAt || null,
    image: raw.image || null,
    tier: raw.tier || 'lifestyle'
  };

  story.category = categoryFor(story.tier);
  story.score = scoreStory(story);

  return story;
}

function dedupe(stories) {
  const seen = new Map();

  stories.forEach(story => {
    const key = story.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 120);

    const current = seen.get(key);

    if (!current || story.score > current.score) {
      seen.set(key, story);
    }
  });

  return [...seen.values()];
}

function limitPerSource(stories, max = 2) {
  const counts = {};

  return stories.filter(story => {
    counts[story.source] = (counts[story.source] || 0);

    if (counts[story.source] >= max) {
      return false;
    }

    counts[story.source]++;
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
    url.searchParams.set('pageSize', '15');
    url.searchParams.set('apiKey', NEWS_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.articles || [])
      .map(article => normalizeStory({
        title: article.title,
        description: article.description,
        link: article.url,
        source: article.source?.name || hostname(article.url),
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        tier: search.tier
      }))
      .filter(story => {
        const text = `${story.source} ${story.title}`.toLowerCase();
        return TRUSTED_MAINSTREAM.some(source => text.includes(source)) || text.includes('cruise');
      });

  } catch {
    return [];
  }
}

async function fetchRssSource(source) {
  try {
    const response = await fetch(source.url);

    if (!response.ok) return [];

    const xml = await response.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 6);

    return items.map(match => {
      const item = match[0];

      const title = (item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
      const description = (item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '';
      const link = (item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';
      const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';

      return normalizeStory({
        title,
        description,
        link,
        source: source.name,
        publishedAt: pubDate,
        tier: source.name.includes('Industry') || source.name.includes('Seatrade')
          ? 'industry'
          : 'lifestyle'
      });
    });
  } catch {
    return [];
  }
}

async function getStories() {
  const mainstreamResults = await Promise.all(
    NEWSAPI_SEARCHES.map(fetchNewsApi)
  );

  const rssResults = await Promise.all(
    RSS_SOURCES.map(fetchRssSource)
  );

  const combined = [
    ...mainstreamResults.flat(),
    ...rssResults.flat()
  ];

  return limitPerSource(
    dedupe(combined)
      .sort((a, b) => b.score - a.score),
    2
  );
}

function homepageStories(stories) {
  return limitPerSource(stories, 1).slice(0, 5);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    const stories = await getStories();

    return res.status(200).json({
      ok: true,
      source: 'newsapi-editorial-engine',
      storyCount: stories.length,
      generatedAt: new Date().toISOString(),
      homepage: homepageStories(stories),
      stories
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      homepage: [],
      stories: []
    });
  }
}
