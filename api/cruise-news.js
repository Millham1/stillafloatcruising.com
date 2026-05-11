const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.newsapi;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/' },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml' }
];

const NEWSAPI_SEARCHES = [
  { q: 'cruise travel', tier: 'lifestyle' },
  { q: 'cruise vacation', tier: 'lifestyle' },
  { q: 'cruise passengers', tier: 'impact' },
  { q: 'cruise weather', tier: 'impact' },
  { q: 'cruise industry', tier: 'industry' }
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
    score: 100
  };
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
    url.searchParams.set('pageSize', '10');
    url.searchParams.set('apiKey', NEWS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    return {
      stories: (data.articles || []).map(article => normalizeStory({
        title: article.title,
        description: article.description,
        link: article.url,
        source: article.source?.name || 'NewsAPI',
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        tier: search.tier
      })),
      debug: {
        query: search.q,
        status: response.status,
        totalResults: data.totalResults || 0,
        returned: (data.articles || []).length,
        sampleSources: [...new Set((data.articles || []).map(a => a.source?.name).filter(Boolean))].slice(0,10)
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
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 4);

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
        tier: source.name.includes('Industry') || source.name.includes('Seatrade')
          ? 'industry'
          : 'lifestyle'
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

    const stories = [...newsStories, ...rssStories].slice(0, 20);

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
