const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.newsapi;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/' },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml' }
];

const NEWSAPI_SEARCHES = [
  { q: 'Caribbean cruise travel OR Bahamas cruise destinations', tier: 'lifestyle' },
  { q: 'Alaska cruise season OR Mediterranean cruise ports', tier: 'lifestyle' },
  { q: 'cruise port delays OR airport delays affecting cruise travelers', tier: 'impact' },
  { q: 'Caribbean hurricane cruise impacts OR itinerary changes', tier: 'impact' },
  { q: 'new cruise ships OR cruise industry expansion', tier: 'industry' }
];

const POSITIVE_TERMS = [
  'cruise','ship','port','itinerary','caribbean','bahamas','alaska','mediterranean','vacation','travel','tourism','airport','hurricane','island','resort','royal caribbean','norwegian','celebrity','carnival','msc'
];

const NEGATIVE_TERMS = [
  'hiv','genetic','politics','election','war','murder','lawsuit','research paper','medical study','virus','stock prediction'
];

function normalizeText(text='') {
  return text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
}

function normalizeStory(raw) {
  const tier = raw.tier || 'lifestyle';

  return {
    title: normalizeText(raw.title || ''),
    description: normalizeText(raw.description || ''),
    link: raw.link || '',
    source: raw.source || 'Unknown',
    tier,
    category: tier === 'impact'
      ? 'Cruise Impact'
      : tier === 'industry'
        ? 'Industry Intelligence'
        : 'Cruise Life',
    publishedAt: raw.publishedAt || null,
    image: raw.image || null,
    score: tier === 'lifestyle' ? 300 : tier === 'impact' ? 200 : 100
  };
}

function isCruiseRelevant(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();

  const positive = POSITIVE_TERMS.some(term => text.includes(term));
  const negative = NEGATIVE_TERMS.some(term => text.includes(term));

  return positive && !negative;
}

function dedupeStories(stories) {
  const seen = new Set();

  return stories.filter(story => {
    const key = story.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0,100);
    if (seen.has(key)) return false;
    seen.add(key);
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
    url.searchParams.set('pageSize', '6');
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
    const response = await fetch(source.url);
    if (!response.ok) return [];

    const xml = await response.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 2);

    return items.map(match => {
      const item = match[0];

      return normalizeStory({
        title: (item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '',
        description: (item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '',
        link: (item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '',
        source: source.name,
        tier: source.name.includes('Industry') || source.name.includes('Seatrade') ? 'industry' : 'lifestyle'
      });
    });

  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  try {
    const newsStories = (await Promise.all(NEWSAPI_SEARCHES.map(fetchNewsApi))).flat();
    const rssStories = (await Promise.all(RSS_SOURCES.map(fetchRssSource))).flat();

    const stories = dedupeStories([...newsStories, ...rssStories])
      .sort((a,b) => b.score - a.score)
      .slice(0,20);

    return res.status(200).json({
      ok: true,
      homepage: stories.slice(0,5),
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
