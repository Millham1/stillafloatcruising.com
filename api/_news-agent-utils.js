const REPO = process.env.GITHUB_REPOSITORY || 'Millham1/stillafloatcruising.com';
const BRANCH = process.env.AGENT_BRANCH || 'development';
const APPROVAL_EMAIL = process.env.APPROVAL_EMAIL || 'stillafloatcruising@gmail.com';
const SITE_URL = (process.env.SITE_URL || process.env.VERCEL_URL || '').replace(/\/$/, '');

// VERIFIED ENVIRONMENT VARIABLE NAMES
const NEWS_API_KEY = process.env.newsapi || '';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';
const WEATHER_API_KEY = process.env.weatherpage || '';
const PEXELS_API_KEY = process.env.pexels || '';

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
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

function clean(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classify(text='') {
  const value = text.toLowerCase();

  if (/storm|hurricane|airport|faa|ground stop|delay|weather|reroute|itinerary|port closure|strike/.test(value)) {
    return {
      tier: 'impact',
      category: 'Operational Impact',
      score: 92
    };
  }

  if (/royal caribbean|norwegian|ncl|carnival|msc|celebrity|ship|cruise line/.test(value)) {
    return {
      tier: 'industry',
      category: 'Cruise Industry',
      score: 78
    };
  }

  return {
    tier: 'lifestyle',
    category: 'Travel Pulse',
    score: 58
  };
}

function similarityKey(story) {
  return clean(`${story.title} ${story.summary}`)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(word => word.length > 4)
    .slice(0, 12)
    .sort()
    .join('-');
}

function deduplicate(stories = []) {
  const clusters = new Map();

  for (const story of stories) {
    const key = similarityKey(story);

    if (!clusters.has(key)) {
      clusters.set(key, {
        ...story,
        sources: [story.source],
        sourceLinks: [{ source: story.source, url: story.link }]
      });
      continue;
    }

    const existing = clusters.get(key);

    if (!existing.sources.includes(story.source)) {
      existing.sources.push(story.source);
    }

    existing.sourceLinks.push({
      source: story.source,
      url: story.link
    });
  }

  return [...clusters.values()]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 20);
}

async function fetchNewsApiStories() {
  if (!NEWS_API_KEY) return [];

  const query = encodeURIComponent('(cruise OR airline OR airport OR hurricane OR itinerary OR Caribbean)');

  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${NEWS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return (data.articles || []).map(article => {
    const meta = classify(`${article.title} ${article.description}`);

    return {
      id: slugify(article.title),
      title: clean(article.title),
      summary: clean(article.description || ''),
      source: clean(article.source?.name || 'NewsAPI'),
      link: article.url,
      image: article.urlToImage || '',
      publishedAt: article.publishedAt,
      category: meta.category,
      tier: meta.tier,
      impactScore: meta.score,
      featured: false,
      status: 'candidate'
    };
  });
}

async function fetchGNewsStories() {
  if (!GNEWS_API_KEY) return [];

  const query = encodeURIComponent('(cruise OR airline OR airport OR hurricane OR itinerary)');

  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=25&apikey=${GNEWS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return (data.articles || []).map(article => {
    const meta = classify(`${article.title} ${article.description}`);

    return {
      id: slugify(article.title),
      title: clean(article.title),
      summary: clean(article.description || ''),
      source: clean(article.source?.name || 'GNews'),
      link: article.url,
      image: article.image || '',
      publishedAt: article.publishedAt,
      category: meta.category,
      tier: meta.tier,
      impactScore: meta.score,
      featured: false,
      status: 'candidate'
    };
  });
}

async function fetchWeatherSignals() {
  const signals = [];

  for (const port of WATCH_PORTS) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lon}&daily=weather_code,wind_speed_10m_max,precipitation_probability_max&forecast_days=3`;

      const response = await fetch(url);

      if (!response.ok) continue;

      const data = await response.json();

      const maxWind = Math.max(...(data.daily?.wind_speed_10m_max || [0]));
      const maxRain = Math.max(...(data.daily?.precipitation_probability_max || [0]));

      if (maxWind > 28 || maxRain > 70) {
        signals.push({
          id: slugify(`weather-${port.name}`),
          title: `Weather watch issued for ${port.name} cruise operations`,
          summary: `${port.name} is showing elevated weather risk over the next several days that could impact cruise embarkation schedules, flight operations, or itinerary stability. Travelers should monitor updates closely as cruise lines may begin operational adjustments if conditions intensify.`,
          source: WEATHER_API_KEY ? 'Configured Weather API' : 'Open-Meteo',
          link: 'https://open-meteo.com/',
          image: '',
          publishedAt: new Date().toISOString(),
          category: 'Operational Impact',
          tier: 'impact',
          impactScore: 96,
          featured: true,
          status: 'candidate'
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return signals;
}

async function buildCandidateFeed() {
  const [newsApi, gnews, weather] = await Promise.all([
    fetchNewsApiStories(),
    fetchGNewsStories(),
    fetchWeatherSignals()
  ]);

  return deduplicate([
    ...weather,
    ...newsApi,
    ...gnews
  ]);
}

module.exports = {
  NEWS_API_KEY,
  GNEWS_API_KEY,
  WEATHER_API_KEY,
  PEXELS_API_KEY,
  APPROVAL_EMAIL,
  SITE_URL,
  buildCandidateFeed,
  deduplicate,
  slugify
};
