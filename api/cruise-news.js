const EXCLUDED_KEYWORDS = [
  'hantavirus',
  'politics',
  'election',
  'war',
  'shooting',
  'murder',
  'covid',
  'pandemic',
  'hostage',
  'earthquake',
  'inflation',
  'stock market'
];

const QUERY_POOLS = [
  '"Royal Caribbean" OR "Norwegian Cruise" OR "Carnival Cruise"',
  '"cruise ship" OR "cruise line"',
  'Caribbean cruise OR Bahamas cruise',
  'Port Canaveral OR cruise terminal',
  'cruise entertainment OR cruise dining'
];

function containsExcludedTopics(text = '') {
  const lower = text.toLowerCase();
  return EXCLUDED_KEYWORDS.some(keyword => lower.includes(keyword));
}

function categorize(title = '') {
  const lower = title.toLowerCase();

  if (lower.includes('storm') || lower.includes('weather') || lower.includes('hurricane')) {
    return 'Weather Watch';
  }

  if (lower.includes('port') || lower.includes('terminal') || lower.includes('embarkation')) {
    return 'Ports';
  }

  return 'Cruise Industry';
}

function normalizeArticle(article) {
  return {
    category: categorize(article.title || ''),
    title: article.title || '',
    description: article.description || '',
    link: article.url || '',
    source: article.source?.name || 'GNews',
    publishedAt: article.publishedAt || null,
    image: article.image || null
  };
}

async function fetchQuery(query, apiKey) {
  const encoded = encodeURIComponent(query);
  const url = `https://gnews.io/api/v4/search?q=${encoded}&lang=en&country=us&max=10&apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data.articles) ? data.articles : [];
}

function dedupeStories(stories) {
  const seen = new Set();

  return stories.filter(story => {
    const key = `${story.title}-${story.link}`.toLowerCase();

    if (!story.title || !story.link || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function getLiveStories() {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return [];
  }

  const queryResults = await Promise.all(
    QUERY_POOLS.map(query => fetchQuery(query, apiKey))
  );

  return dedupeStories(
    queryResults
      .flat()
      .map(normalizeArticle)
      .filter(story => !containsExcludedTopics(`${story.title} ${story.description}`))
  );
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const stories = await getLiveStories();

    return res.status(200).json({
      source: 'gnews-live',
      headlines: stories.slice(0, 5),
      extended: stories.slice(5, 20),
      weather: stories
        .filter(story => story.category === 'Weather Watch')
        .slice(0, 4)
    });
  } catch (error) {
    console.error('Cruise news failure:', error);

    return res.status(200).json({
      source: 'gnews-live',
      headlines: [],
      extended: [],
      weather: []
    });
  }
}
