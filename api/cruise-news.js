const CRUISE_KEYWORDS = [
  'cruise','cruises','cruise ship','cruise line','royal caribbean','norwegian cruise','ncl','carnival cruise','celebrity cruises','princess cruises','holland america','msc cruises','virgin voyages','port canaveral','miami cruise','nassau','caribbean','embarkation','itinerary','shore excursion','private island','coco cay','great stirrup cay','bahamas','alaska cruise','mediterranean cruise','onboard','casino at sea'
];

const EXCLUDED_KEYWORDS = [
  'hantavirus','politics','election','war','shooting','murder','covid','pandemic','hostage','earthquake','inflation','stock market'
];

const QUERY_POOLS = [
  '("Royal Caribbean" OR "Norwegian Cruise" OR "Carnival Cruise" OR "Celebrity Cruises")',
  '("cruise ship" OR itinerary OR embarkation OR Caribbean cruise)',
  '(Bahamas OR CocoCay OR Nassau OR "private island" OR excursion)',
  '(Port Canaveral OR Miami cruise port OR cruise terminal)',
  '(cruise dining OR cruise entertainment OR onboard experience OR casino at sea)'
];

function categorize(title = '') {
  const lower = title.toLowerCase();
  if (lower.includes('storm') || lower.includes('weather') || lower.includes('hurricane') || lower.includes('tropical')) return 'Weather Watch';
  if (lower.includes('port') || lower.includes('terminal') || lower.includes('embarkation')) return 'Ports';
  if (lower.includes('flight') || lower.includes('airline') || lower.includes('tsa')) return 'Travel Impact';
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

  if (haystack.includes('royal caribbean')) score += 5;
  if (haystack.includes('norwegian')) score += 5;
  if (haystack.includes('carnival')) score += 5;
  if (haystack.includes('ship')) score += 3;
  if (haystack.includes('itinerary')) score += 3;
  if (haystack.includes('private island')) score += 4;
  if (haystack.includes('entertainment')) score += 2;
  if (haystack.includes('dining')) score += 2;

  return score;
}

function normalizeArticle(article) {
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

async function fetchQueryPool(query, apiKey) {
  const encoded = encodeURIComponent(query);
  const url = `https://gnews.io/api/v4/search?q=${encoded}&lang=en&country=us&max=10&apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];

  return articles.map(normalizeArticle);
}

async function getStories() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const queryResults = await Promise.all(
    QUERY_POOLS.map(query => fetchQueryPool(query, apiKey))
  );

  const articles = queryResults.flat();

  return articles
    .filter(story => story.title && story.link)
    .filter(story => !containsExcludedTopics(`${story.title} ${story.description}`))
    .map(story => ({
      ...story,
      relevance: cruiseRelevanceScore(story)
    }))
    .filter(story => story.relevance >= 4)
    .sort((a, b) => b.relevance - a.relevance);
}

function curatedDepthStories() {
  return [
    {
      category: 'Cruise Industry',
      title: 'Cruise Hive tracks new ships, itineraries, and onboard experiences',
      description: 'Cruise-focused reporting on ships, dining, entertainment, and destinations.',
      link: 'https://www.cruisehive.com/',
      source: 'Cruise Hive',
      relevance: 10
    },
    {
      category: 'Cruise Industry',
      title: 'Royal Caribbean Blog follows fleet and private island developments',
      description: 'Coverage of ships, CocoCay, dining, entertainment, and itineraries.',
      link: 'https://www.royalcaribbeanblog.com/',
      source: 'Royal Caribbean Blog',
      relevance: 10
    },
    {
      category: 'Cruise Industry',
      title: 'Cruise Critic reports on ships, destinations, and cruise travel trends',
      description: 'Passenger-focused cruise news and destination coverage.',
      link: 'https://www.cruisecritic.com/news/',
      source: 'Cruise Critic',
      relevance: 9
    },
    {
      category: 'Cruise Industry',
      title: 'Seatrade Cruise covers cruise business, ship orders, and destination trends',
      description: 'Industry coverage for cruise lines, ports, and destinations.',
      link: 'https://www.seatrade-cruise.com/',
      source: 'Seatrade Cruise',
      relevance: 9
    },
    {
      category: 'Ports',
      title: 'Port Canaveral expands cruise operations and terminal infrastructure',
      description: 'Official updates from one of the busiest cruise ports in the world.',
      link: 'https://www.portcanaveral.com/Newsroom',
      source: 'Port Canaveral',
      relevance: 9
    },
    {
      category: 'Ports',
      title: 'Miami cruise port operations and passenger updates',
      description: 'Official port information for Miami cruise embarkation planning.',
      link: 'https://www.portmiami.biz/newsroom',
      source: 'PortMiami',
      relevance: 8
    },
    {
      category: 'Weather Watch',
      title: 'NOAA monitors tropical systems affecting Caribbean itineraries',
      description: 'Atlantic hurricane and tropical weather outlook for cruisers.',
      link: 'https://www.nhc.noaa.gov/',
      source: 'NOAA',
      relevance: 9
    },
    {
      category: 'Weather Watch',
      title: 'Fox Weather tracks storms and travel impacts for cruise regions',
      description: 'Weather developments affecting flights, ports, and cruise itineraries.',
      link: 'https://www.foxweather.com/weather-news',
      source: 'Fox Weather',
      relevance: 8
    },
    {
      category: 'Travel Impact',
      title: 'TSA updates help cruisers prepare for embarkation travel days',
      description: 'Airport and travel security guidance relevant to cruise passengers.',
      link: 'https://www.tsa.gov/travel',
      source: 'TSA',
      relevance: 8
    },
    {
      category: 'Cruise Industry',
      title: 'Princess Cruises news and destination updates',
      description: 'Line-specific cruise news, ships, destinations, and onboard experiences.',
      link: 'https://www.princess.com/en-us/news',
      source: 'Princess Cruises',
      relevance: 8
    },
    {
      category: 'Cruise Industry',
      title: 'Norwegian Cruise Line press releases and fleet updates',
      description: 'Official NCL news about ships, destinations, and onboard programs.',
      link: 'https://www.ncl.com/newsroom',
      source: 'Norwegian Cruise Line',
      relevance: 8
    },
    {
      category: 'Cruise Industry',
      title: 'Carnival Cruise Line newsroom and ship updates',
      description: 'Official Carnival news on ships, destinations, and onboard experiences.',
      link: 'https://www.carnival-news.com/',
      source: 'Carnival Cruise Line',
      relevance: 8
    }
  ];
}

function dedupeStories(stories) {
  const seen = new Set();

  return stories.filter(story => {
    const titleKey = (story.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
    const linkKey = (story.link || '').toLowerCase().replace(/\/$/, '');
    const key = linkKey || titleKey;

    if (!key || seen.has(key) || seen.has(titleKey)) return false;

    seen.add(key);
    seen.add(titleKey);
    return true;
  });
}

function buildBuckets(stories) {
  const enriched = dedupeStories([...stories, ...curatedDepthStories()]);
  const headlines = enriched.slice(0, 5);
  const headlineLinks = new Set(headlines.map(story => story.link));
  const headlineTitles = new Set(headlines.map(story => story.title));

  const extended = enriched
    .filter(story => !headlineLinks.has(story.link) && !headlineTitles.has(story.title))
    .slice(0, 18);

  const weather = enriched
    .filter(story => story.category === 'Weather Watch')
    .filter(story => !headlineLinks.has(story.link) && !headlineTitles.has(story.title))
    .slice(0, 4);

  return {
    featured: headlines.slice(0, 2),
    headlines,
    extended,
    weather
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const liveStories = await getStories();
    const buckets = buildBuckets(liveStories);

    return res.status(200).json({
      source: liveStories.length ? 'gnews-api-plus-curated' : 'still-afloat-curated',
      mode: liveStories.length ? 'live-plus-curated' : 'curated',
      ...buckets
    });
  } catch (error) {
    console.error('Cruise news API provider failed:', error);
    const buckets = buildBuckets([]);

    return res.status(200).json({
      source: 'still-afloat-curated',
      mode: 'curated',
      ...buckets
    });
  }
}
