const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.newsapi;

const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed', tier: 'lifestyle', lane: 'aggregator' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml', tier: 'lifestyle', lane: 'aggregator' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/', tier: 'industry', lane: 'industry' }
];

const NEWSAPI_SEARCHES = [
  {
    q: 'Norwegian Cruise Line OR Royal Caribbean Group OR Royal Caribbean International OR Celebrity Cruises OR Carnival Cruise Line OR Disney Cruise Line OR MSC Cruises',
    tier: 'direct',
    lane: 'direct'
  },
  {
    q: '(cruise OR cruises OR "cruise ship" OR "cruise port") AND (hurricane OR storm OR weather OR delay OR stranded OR cancelled OR airport OR flight)',
    domains: 'cnn.com,foxnews.com,cbsnews.com,weather.com,abcnews.go.com,nbcnews.com,usatoday.com,apnews.com',
    tier: 'impact',
    lane: 'mainstream'
  },
  {
    q: '(cruise OR cruises OR "cruise ship" OR "cruise line") AND (Caribbean OR Bahamas OR Alaska OR Mediterranean OR travel)',
    domains: 'cnn.com,foxnews.com,cbsnews.com,usatoday.com,travelandleisure.com,forbes.com,apnews.com',
    tier: 'lifestyle',
    lane: 'mainstream'
  },
  {
    q: 'cruise itinerary change OR cruise port delay OR cruise weather impact OR cruise passengers',
    tier: 'impact',
    lane: 'impact'
  },
  {
    q: 'new cruise ship OR cruise loyalty program OR cruise travel tips OR cruise deal',
    tier: 'lifestyle',
    lane: 'cruise'
  }
];

const DIRECT_CRUISE_LINE_TERMS = [
  'norwegian cruise line','ncl','royal caribbean international','royal caribbean group','celebrity cruises','carnival cruise line','disney cruise line','msc cruises','princess cruises','holland america line','virgin voyages','azamara','oceania cruises','regent seven seas'
];

const AGGREGATOR_SOURCES = [
  'cruise hive','cruise industry news','royal caribbean blog','cruise fever','cruise critic'
];

const POSITIVE_TERMS = [
  'cruise','cruises','ship','port','itinerary','caribbean','bahamas','alaska','mediterranean','vacation','travel','tourism','airport','flight','hurricane','storm','weather','delay','cancelled','stranded','island','resort','royal caribbean','norwegian','celebrity','carnival','msc','disney cruise','ncl','cruise line','cruise ship','shore excursion','passenger'
];

const NEGATIVE_TERMS = [
  'hiv','genetic','politics','election','war','murder','research paper','medical study','virus','stock prediction','thc beverage','car market','football','basketball','celebrity gossip'
];

function normalizeText(text = '') {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeIsoDate(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function extractTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return normalizeText(match?.[1] || '');
}

function storyAgeHours(story) {
  const time = Date.parse(story.publishedAt || '');
  if (!Number.isFinite(time)) return 9999;
  return Math.floor((Date.now() - time) / (1000 * 60 * 60));
}

function freshnessScore(story) {
  const hours = storyAgeHours(story);

  if (hours <= 24) return 1200;
  if (hours <= 72) return 850;
  if (hours <= 168) return 450;
  if (hours <= 336) return 100;

  return -1000;
}

function isFreshEnough(story) {
  return storyAgeHours(story) <= 336;
}

function inferLane(raw, lane) {
  const text = `${raw.title || ''} ${raw.description || ''} ${raw.source || ''} ${raw.link || ''}`.toLowerCase();

  if (DIRECT_CRUISE_LINE_TERMS.some(term => text.includes(term))) {
    return 'direct';
  }

  if (AGGREGATOR_SOURCES.some(source => String(raw.source || '').toLowerCase().includes(source))) {
    return 'aggregator';
  }

  return lane || 'cruise';
}

function normalizeStory(raw) {
  const lane = inferLane(raw, raw.lane);
  const tier = lane === 'direct' ? 'direct' : (raw.tier || 'lifestyle');

  const story = {
    title: normalizeText(raw.title || ''),
    description: normalizeText(raw.description || ''),
    link: normalizeText(raw.link || ''),
    source: normalizeText(raw.source || 'Unknown'),
    tier,
    lane,
    category: lane === 'direct' ? 'Direct from Cruise Lines' : tier === 'impact' ? 'Travel Impact' : tier === 'industry' ? 'Cruise Pulse' : 'Cruise Life',
    publishedAt: safeIsoDate(raw.publishedAt),
    image: raw.image || null,
    score: lane === 'direct' ? 420 : tier === 'impact' ? 320 : tier === 'industry' ? 230 : 210
  };

  story.freshness = freshnessScore(story);
  return story;
}

function isCruiseRelevant(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();
  const positive = POSITIVE_TERMS.some(term => text.includes(term));
  const negative = NEGATIVE_TERMS.some(term => text.includes(term));

  return story.title && story.link && positive && !negative && isFreshEnough(story);
}

function storyDateValue(story) {
  const time = Date.parse(story.publishedAt || '');
  return Number.isFinite(time) ? time : 0;
}

function dedupeStories(stories) {
  const seenLinks = new Set();
  const seenNarratives = new Set();
  const sourceCounts = {};
  const maxPerSource = 5;

  return stories.filter(story => {
    const linkKey = story.link.toLowerCase().replace(/\?.*$/, '').replace(/\/$/, '');
    if (seenLinks.has(linkKey)) return false;

    const narrativeKey = story.title.toLowerCase()
      .replace(/cruise|cruises|line|ship|passengers|new|update|confirmed|timeline|breaking|latest/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 90);

    if (narrativeKey.length > 16 && seenNarratives.has(narrativeKey)) return false;

    sourceCounts[story.source] = sourceCounts[story.source] || 0;
    if (sourceCounts[story.source] >= maxPerSource) return false;

    seenLinks.add(linkKey);
    if (narrativeKey.length > 16) seenNarratives.add(narrativeKey);
    sourceCounts[story.source]++;
    return true;
  });
}

function sortStories(stories) {
  return [...stories].sort((a, b) => {
    const laneWeight = {
      direct: 180,
      mainstream: 60,
      impact: 45,
      industry: 20,
      cruise: 10,
      aggregator: -60
    };

    const scoreA = a.score + a.freshness + (laneWeight[a.lane] || 0);
    const scoreB = b.score + b.freshness + (laneWeight[b.lane] || 0);

    const scoreDiff = scoreB - scoreA;
    if (scoreDiff !== 0) return scoreDiff;

    return storyDateValue(b) - storyDateValue(a);
  });
}

function pickDiverseHomepage(stories) {
  const homepageEligible = sortStories(stories)
    .filter(story => storyAgeHours(story) <= 168);

  const picks = [];

  const addFirst = predicate => {
    const item = homepageEligible.find(story => predicate(story) && !picks.includes(story));
    if (item) picks.push(item);
  };

  addFirst(story => story.lane === 'direct');
  addFirst(story => story.lane === 'mainstream' && story.tier === 'impact');
  addFirst(story => story.lane === 'mainstream');
  addFirst(story => story.tier === 'impact');
  addFirst(story => story.tier === 'industry');

  for (const story of homepageEligible) {
    if (picks.length >= 5) break;
    if (!picks.includes(story)) picks.push(story);
  }

  return picks.slice(0, 5);
}

async function fetchNewsApi(search) {
  if (!NEWS_API_KEY) return [];

  try {
    const url = new URL('https://newsapi.org/v2/everything');

    url.searchParams.set('q', search.q);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '10');
    url.searchParams.set('from', new Date(Date.now() - (1000 * 60 * 60 * 24 * 7)).toISOString());

    if (search.domains) {
      url.searchParams.set('domains', search.domains);
    }

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
        tier: search.tier,
        lane: search.lane
      }))
      .filter(isCruiseRelevant);
  } catch {
    return [];
  }
}

async function fetchRssSource(source) {
  try {
    const response = await fetch(source.url, {
      headers: { 'user-agent': 'StillAfloatCruising/1.0' }
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 10);

    return items.map(match => {
      const item = match[0];
      const guid = extractTag(item, 'guid');
      const link = extractTag(item, 'link') || guid;
      const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'dc:date') || extractTag(item, 'published');

      return normalizeStory({
        title: extractTag(item, 'title'),
        description: extractTag(item, 'description') || extractTag(item, 'content:encoded'),
        link,
        source: source.name,
        tier: source.tier,
        lane: source.lane,
        publishedAt: pubDate
      });
    }).filter(isCruiseRelevant);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try {
    const [newsStories, rssStories] = await Promise.all([
      Promise.all(NEWSAPI_SEARCHES.map(fetchNewsApi)).then(results => results.flat()),
      Promise.all(RSS_SOURCES.map(fetchRssSource)).then(results => results.flat())
    ]);

    const deduped = dedupeStories([...newsStories, ...rssStories]);
    const stories = sortStories(deduped).slice(0, 30);
    const homepage = pickDiverseHomepage(deduped);

    return res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      homepage,
      stories,
      count: stories.length
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      homepage: [],
      stories: [],
      count: 0
    });
  }
}
