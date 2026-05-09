const CRUISE_KEYWORDS = [
  'cruise','cruises','cruise ship','cruise line','royal caribbean','norwegian cruise','ncl','carnival cruise','celebrity cruises','princess cruises','holland america','msc cruises','virgin voyages','port canaveral','miami cruise','nassau','caribbean','embarkation','itinerary','shore excursion','private island','coco cay','great stirrup cay'
];

function categorize(title = '') {
  const lower = title.toLowerCase();
  if (lower.includes('storm') || lower.includes('weather') || lower.includes('hurricane') || lower.includes('tropical')) return 'Weather Watch';
  if (lower.includes('port') || lower.includes('terminal') || lower.includes('embarkation') || lower.includes('nassau') || lower.includes('canaveral')) return 'Ports';
  if (lower.includes('flight') || lower.includes('airline') || lower.includes('tsa') || lower.includes('tax') || lower.includes('fee')) return 'Travel Impact';
  return 'Cruise Industry';
}

function isCruiseRelevant(story) {
  const haystack = `${story.title || ''} ${story.description || ''}`.toLowerCase();
  return CRUISE_KEYWORDS.some(keyword => haystack.includes(keyword));
}

function normalizeGNewsArticle(article) {
  return {
    category: categorize(article.title),
    title: article.title,
    description: article.description || '',
    link: article.url,
    source: article.source?.name || 'GNews',
    publishedAt: article.publishedAt || null,
    image: article.image || null
  };
}

async function getGNewsStories() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const query = encodeURIComponent('cruise OR "cruise ship" OR "cruise line" OR "Royal Caribbean" OR "Norwegian Cruise" OR Carnival OR "Port Canaveral" OR Caribbean');
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&country=us&max=20&apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`GNews request failed: ${response.status}`);

  const data = await response.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  return articles
    .map(normalizeGNewsArticle)
    .filter(story => story.title && story.link && isCruiseRelevant(story));
}

function getFallbackStories() {
  return [
    {
      category: 'Weather Watch',
      title: 'NOAA hurricane outlook and tropical monitoring for cruise routes',
      description: 'Official tropical weather monitoring for Atlantic and Caribbean cruise planning.',
      link: 'https://www.nhc.noaa.gov/',
      source: 'NOAA National Hurricane Center'
    },
    {
      category: 'Cruise Industry',
      title: 'Cruise Hive cruise news and itinerary updates',
      description: 'Cruise-specific headlines covering ships, itinerary changes, and line updates.',
      link: 'https://www.cruisehive.com/',
      source: 'Cruise Hive'
    },
    {
      category: 'Cruise Industry',
      title: 'Cruise Critic breaking cruise news',
      description: 'Cruise passenger news, ship updates, and destination coverage.',
      link: 'https://www.cruisecritic.com/news/',
      source: 'Cruise Critic'
    },
    {
      category: 'Cruise Industry',
      title: 'Royal Caribbean Blog news and fleet updates',
      description: 'Royal Caribbean specific developments, ship updates, and onboard changes.',
      link: 'https://www.royalcaribbeanblog.com/',
      source: 'Royal Caribbean Blog'
    },
    {
      category: 'Ports',
      title: 'Port Canaveral newsroom and cruise terminal updates',
      description: 'Official port updates for one of the busiest cruise embarkation ports.',
      link: 'https://www.portcanaveral.com/Newsroom',
      source: 'Port Canaveral'
    },
    {
      category: 'Travel Impact',
      title: 'TSA traveler guidance for cruise embarkation flights',
      description: 'Security and airport travel guidance useful for cruisers flying to port.',
      link: 'https://www.tsa.gov/travel',
      source: 'TSA'
    },
    {
      category: 'Weather Watch',
      title: 'Fox Weather coverage for storms and travel impacts',
      description: 'Weather developments that may affect flight routes and cruise itineraries.',
      link: 'https://www.foxweather.com/weather-news',
      source: 'Fox Weather'
    }
  ];
}

function dedupeStories(stories) {
  const seen = new Set();
  return stories.filter(story => {
    const key = story.link || story.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const apiStories = await getGNewsStories();
    const stories = dedupeStories(apiStories).slice(0, 15);

    if (stories.length) {
      return res.status(200).json({
        source: 'gnews-api',
        mode: 'live',
        stories
      });
    }
  } catch (error) {
    console.error('Cruise news API provider failed:', error);
  }

  return res.status(200).json({
    source: 'still-afloat-api',
    mode: 'fallback',
    note: 'Set GNEWS_API_KEY in Vercel environment variables to enable live article-level news.',
    stories: getFallbackStories()
  });
}
