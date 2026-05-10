const CRUISE_KEYWORDS = [
  'cruise','cruises','cruise ship','cruise line','royal caribbean','norwegian cruise','ncl','carnival cruise','celebrity cruises','princess cruises','holland america','msc cruises','virgin voyages','port canaveral','miami cruise','nassau','caribbean','embarkation','itinerary','shore excursion','private island','coco cay','great stirrup cay','bahamas','alaska cruise','mediterranean cruise','onboard','casino at sea'
];

const EXCLUDED_KEYWORDS = [
  'hantavirus','politics','election','war','shooting','murder','covid','pandemic','hostage','earthquake','inflation','stock market'
];

function categorize(title = '') {
  const lower = title.toLowerCase();

  if (lower.includes('storm') || lower.includes('weather') || lower.includes('hurricane') || lower.includes('tropical')) {
    return 'Weather Watch';
  }

  if (lower.includes('port') || lower.includes('terminal') || lower.includes('embarkation') || lower.includes('nassau') || lower.includes('canaveral')) {
    return 'Ports';
  }

  if (lower.includes('flight') || lower.includes('airline') || lower.includes('tsa') || lower.includes('tax') || lower.includes('fee')) {
    return 'Travel Impact';
  }

  return 'Cruise Industry';
}

function containsExcludedTopics(text = '') {
  const lower = text.toLowerCase();
  return EXCLUDED_KEYWORDS.some(keyword => lower.includes(keyword));
}

function cruiseRelevanceScore(story) {
  const haystack = `${story.title || ''} ${story.description || ''}`.toLowerCase();

  let score = 0;

  CRUISE_KEYWORDS.forEach(keyword => {
    if (haystack.includes(keyword)) score += 2;
  });

  if (haystack.includes('royal caribbean')) score += 4;
  if (haystack.includes('norwegian')) score += 4;
  if (haystack.includes('carnival')) score += 4;
  if (haystack.includes('celebrity')) score += 3;
  if (haystack.includes('ship')) score += 2;
  if (haystack.includes('itinerary')) score += 3;
  if (haystack.includes('bahamas')) score += 2;
  if (haystack.includes('private island')) score += 3;

  return score;
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

  const query = encodeURIComponent('("cruise ship" OR "cruise line" OR cruise OR Caribbean OR Bahamas OR Royal Caribbean OR Norwegian Cruise OR Carnival Cruise OR Celebrity Cruises)');

  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&country=us&max=30&apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`GNews request failed: ${response.status}`);

  const data = await response.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  return articles
    .map(normalizeGNewsArticle)
    .filter(story => story.title && story.link)
    .filter(story => !containsExcludedTopics(`${story.title} ${story.description}`))
    .map(story => ({
      ...story,
      relevance: cruiseRelevanceScore(story)
    }))
    .filter(story => story.relevance >= 4)
    .sort((a, b) => b.relevance - a.relevance);
}

function getFallbackStories() {
  return [
    {
      category: 'Cruise Industry',
      title: 'Cruise Hive tracks new ships, itinerary changes, and onboard updates',
      description: 'Cruise-specific headlines covering ships, ports, dining, and itinerary developments.',
      link: 'https://www.cruisehive.com/',
      source: 'Cruise Hive'
    },
    {
      category: 'Cruise Industry',
      title: 'Royal Caribbean Blog follows entertainment, dining, and fleet developments',
      description: 'Coverage of Royal Caribbean ships, onboard experiences, and Caribbean itineraries.',
      link: 'https://www.royalcaribbeanblog.com/',
      source: 'Royal Caribbean Blog'
    },
    {
      category: 'Cruise Industry',
      title: 'Cruise Critic reports on ships, destinations, and cruise travel trends',
      description: 'Passenger-focused cruise news and destination coverage.',
      link: 'https://www.cruisecritic.com/news/',
      source: 'Cruise Critic'
    },
    {
      category: 'Ports',
      title: 'Port Canaveral continues expansion of cruise operations and terminals',
      description: 'Official updates from one of the world’s busiest cruise ports.',
      link: 'https://www.portcanaveral.com/Newsroom',
      source: 'Port Canaveral'
    },
    {
      category: 'Weather Watch',
      title: 'NOAA tropical monitoring remains critical for Caribbean itineraries',
      description: 'Official Atlantic and Caribbean weather monitoring for cruise planning.',
      link: 'https://www.nhc.noaa.gov/',
      source: 'NOAA'
    },
    {
      category: 'Travel Impact',
      title: 'TSA guidance helps cruisers plan smoother embarkation travel days',
      description: 'Airport and travel security guidance relevant to cruise passengers.',
      link: 'https://www.tsa.gov/travel',
      source: 'TSA'
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
    stories: getFallbackStories()
  });
}
