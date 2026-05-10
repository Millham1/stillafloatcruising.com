const SEARCHES = [
  'cruise',
  'cruise ship',
  'Royal Caribbean cruise',
  'Norwegian Cruise Line',
  'Carnival Cruise Line'
];

const REQUIRED_TERMS = [
  'cruise',
  'cruises',
  'cruise ship',
  'cruise line',
  'royal caribbean',
  'norwegian cruise',
  'carnival cruise',
  'celebrity cruises',
  'princess cruises',
  'msc cruises',
  'port canaveral',
  'nassau',
  'bahamas cruise',
  'caribbean cruise'
];

const BLOCKED_TERMS = [
  'hantavirus',
  'politics',
  'election',
  'war',
  'shooting',
  'murder',
  'hostage',
  'stock market'
];

function categoryFor(text = '') {
  const value = text.toLowerCase();

  if (value.includes('hurricane') || value.includes('storm') || value.includes('weather') || value.includes('tropical')) {
    return 'Weather Watch';
  }

  if (value.includes('port') || value.includes('terminal') || value.includes('embarkation') || value.includes('canaveral') || value.includes('nassau')) {
    return 'Ports';
  }

  if (value.includes('flight') || value.includes('airline') || value.includes('tsa') || value.includes('airport')) {
    return 'Travel Impact';
  }

  return 'Cruise Industry';
}

function isBlocked(article) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  return BLOCKED_TERMS.some(term => text.includes(term));
}

function isCruiseRelevant(article) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  return REQUIRED_TERMS.some(term => text.includes(term));
}

function normalizeArticle(article) {
  const title = (article.title || '').trim();
  const description = (article.description || '').trim();
  const link = (article.url || '').trim();

  return {
    category: categoryFor(`${title} ${description}`),
    title,
    description,
    link,
    source: article.source?.name || 'News source',
    publishedAt: article.publishedAt || null,
    image: article.image || null
  };
}

function dedupeArticles(articles) {
  const seenLinks = new Set();
  const seenTitles = new Set();

  return articles.filter(article => {
    const linkKey = article.link.toLowerCase().replace(/\/$/, '');
    const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 90);

    if (!article.title || !article.link) return false;
    if (seenLinks.has(linkKey) || seenTitles.has(titleKey)) return false;

    seenLinks.add(linkKey);
    seenTitles.add(titleKey);
    return true;
  });
}

async function fetchGNewsSearch(query, apiKey) {
  const url = new URL('https://gnews.io/api/v4/search');
  url.searchParams.set('q', query);
  url.searchParams.set('lang', 'en');
  url.searchParams.set('country', 'us');
  url.searchParams.set('max', '10');
  url.searchParams.set('apikey', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GNews failed for "${query}" with ${response.status}: ${body}`);
  }

  const data = await response.json();
  return Array.isArray(data.articles) ? data.articles : [];
}

async function getStories() {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return { stories: [], errors: ['Missing GNEWS_API_KEY'] };
  }

  const results = [];
  const errors = [];

  for (const search of SEARCHES) {
    try {
      const articles = await fetchGNewsSearch(search, apiKey);
      results.push(...articles);
    } catch (error) {
      errors.push(error.message);
    }
  }

  const stories = dedupeArticles(
    results
      .map(normalizeArticle)
      .filter(article => article.title && article.link)
      .filter(article => !isBlocked(article))
      .filter(article => isCruiseRelevant(article))
  );

  return { stories, errors };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const { stories, errors } = await getStories();

    return res.status(200).json({
      ok: true,
      source: 'gnews-live',
      storyCount: stories.length,
      generatedAt: new Date().toISOString(),
      stories,
      homepage: stories.slice(0, 5),
      diagnostics: req.query?.debug === '1' ? { errors } : undefined
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      source: 'gnews-live',
      storyCount: 0,
      generatedAt: new Date().toISOString(),
      stories: [],
      homepage: [],
      error: error.message
    });
  }
}
