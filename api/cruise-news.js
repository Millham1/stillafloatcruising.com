const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.newsapi;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/' },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml' }
];

const NEWSAPI_SEARCHES = [
  { q: 'Caribbean tourism OR Bahamas tourism', tier: 'lifestyle' },
  { q: 'Alaska tourism OR Mediterranean tourism', tier: 'lifestyle' },
  { q: 'private island travel OR beach vacations', tier: 'lifestyle' },
  { q: 'Miami airport delays OR FAA delays', tier: 'impact' },
  { q: 'hurricane Caribbean OR tropical weather travel', tier: 'impact' },
  { q: 'Barcelona overtourism OR European tourism restrictions', tier: 'impact' },
  { q: 'travel industry demand OR tourism trends', tier: 'industry' }
];

const CRUISE_RELEVANCE = [
  'caribbean','bahamas','alaska','mediterranean','tourism','travel','airport','faa','port','terminal','hurricane','tropical','vacation','island','beach','miami','barcelona','ship','cruise','passenger'
];

function normalizeText(text='') {
  return text.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
}

function normalizeStory(raw) {
  return {
    title: normalizeText(raw.title || ''),
    description: normalizeText(raw.description || ''),
    link: raw.link || '',
    source: raw.source || 'Unknown',
    tier: raw.tier || 'lifestyle',
    category: raw.tier === 'impact'
      ? 'Cruise Impact'
      : raw.tier === 'industry'
        ? 'Industry Intelligence'
        : 'Cruise Life',
    publishedAt: raw.publishedAt || null,
    image: raw.image || null,
    score: raw.tier === 'lifestyle' ? 300 : raw.tier === 'impact' ? 200 : 100
  };
}

function isCruiseRelevant(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();
  return CRUISE_RELEVANCE.some(term => text.includes(term));
}

async function fetchNewsApi(search) {
  if (!NEWS_API_KEY) {
    return {
      stories: [],
      debug: {
        query: search.q,
        status: 'missing-api-key'
      }
    };
  }

  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', search.q);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '12');
    url.searchParams.set('apiKey', NEWS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    const stories = (data.articles || [])
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

    return {
      stories,
      debug: {
        query: search.q,
        status: response.status,
        totalResults: data.totalResults || 0,
        returned: stories.length,
        sampleSources: [...new Set(stories.map(s => s.source))].slice(0,10)
      }
    };

  } catch (error) {
    return {
      stories: [],
      debug: {
        query: search.q,
        status: 'fetch-failed',
        error: error.message
      }
    };
  }
}

async function fetchRssSource(source) {
  try {
    const response = await fetch(source.url);
    if (!response.ok) return [];

    const xml = await response.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 3);

    return items.map(match => {
      const item = match[0];

      const title = (item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
      const description = (item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '';
      const link = (item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';

      return normalizeStory({
        title,
        description,
        link,
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
    const newsApiResults = await Promise.all(NEWSAPI_SEARCHES.map(fetchNewsApi));
    const rssResults = await Promise.all(RSS_SOURCES.map(fetchRssSource));

    const newsStories = newsApiResults.flatMap(r => r.stories);
    const rssStories = rssResults.flat();

    const stories = [...newsStories, ...rssStories]
      .sort((a,b) => b.score - a.score)
      .slice(0, 25);

    return res.status(200).json({
      ok: true,
      homepage: stories.slice(0,5),
      stories,
      diagnostics: {
        newsApiEnabled: !!NEWS_API_KEY,
        newsApiStoryCount: newsStories.length,
        rssStoryCount: rssStories.length,
        newsApiDebug: newsApiResults.map(r => r.debug)
      }
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
