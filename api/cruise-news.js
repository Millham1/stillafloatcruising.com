const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.newsapi;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/' }
];

const NEWSAPI_SEARCHES = [
  { q: 'Caribbean cruise travel OR Bahamas cruise destinations', tier: 'lifestyle' },
  { q: 'Alaska cruise season OR Mediterranean cruise ports', tier: 'lifestyle' },
  { q: 'cruise port delays OR airport delays affecting cruise travelers', tier: 'impact' },
  { q: 'Caribbean hurricane cruise impacts OR itinerary changes', tier: 'impact' },
  { q: 'new cruise ships OR cruise loyalty changes', tier: 'lifestyle' }
];

const POSITIVE_TERMS = [
  'cruise','ship','port','itinerary','caribbean','bahamas','alaska','mediterranean','vacation','travel','tourism','airport','hurricane','island','resort','royal caribbean','norwegian','celebrity','carnival','msc','disney cruise'
];

const NEGATIVE_TERMS = [
  'hiv','genetic','politics','election','war','murder','lawsuit','research paper','medical study','virus','stock prediction','thc beverage','car market'
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
    category: tier === 'impact' ? 'Travel Impact' : 'Cruise Life',
    publishedAt: raw.publishedAt || null,
    image: raw.image || null,
    score: tier === 'impact' ? 200 : 300
  };
}

function isCruiseRelevant(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();

  const positive = POSITIVE_TERMS.some(term => text.includes(term));
  const negative = NEGATIVE_TERMS.some(term => text.includes(term));

  return positive && !negative;
}

function dedupeStories(stories) {
  const seenNarratives = new Set();
  const sourceCounts = {};

  return stories.filter(story => {
    const narrativeKey = story.title.toLowerCase()
      .replace(/disney|cruise|line|passengers|new|update|confirmed|timeline|banned|alcohol/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0,80);

    if (seenNarratives.has(narrativeKey)) {
      return false;
    }

    seenNarratives.add(narrativeKey);

    sourceCounts[story.source] = (sourceCounts[story.source] || 0);

    if (sourceCounts[story.source] >= 1) {
      return false;
    }

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
    url.searchParams.set('pageSize', '5');
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
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 1);

    return items.map(match => {
      const item = match[0];

      return normalizeStory({
        title: (item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '',
        description: (item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '',
        link: (item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '',
        source: source.name,
        tier: source.name.includes('Industry') ? 'impact' : 'lifestyle'
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
      .slice(0,14);

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
