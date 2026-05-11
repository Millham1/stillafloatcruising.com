const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed', weight: 1 },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml', weight: 3 },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/', weight: 3 },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml', weight: 3 }
];

const MAX_PER_SOURCE = 2;

const GNEWS_SEARCHES = [
  'Cruise Critic cruise news',
  'Royal Caribbean Blog cruise',
  'Norwegian Cruise Line newsroom',
  'Carnival Cruise Line newsroom',
  'Celebrity Cruises news',
  'cruise ship itinerary change',
  'Port Canaveral cruise terminal',
  'Bahamas cruise private island'
];

const BLOCKED_TERMS = ['hantavirus','politics','election','war','shooting','murder','hostage','stock market'];
const CRUISE_TERMS = ['cruise','cruises','cruise ship','cruise line','royal caribbean','norwegian cruise','ncl','carnival cruise','celebrity cruises','princess cruises','msc cruises','port canaveral','nassau','bahamas','caribbean','cococay','great stirrup cay','itinerary','embarkation','ship','onboard'];

function stripCdata(value=''){return value.replace(/^<!\[CDATA\[/,'').replace(/\]\]>$/,'').trim();}
function decodeEntities(value=''){return stripCdata(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]*>/g,'').trim();}
function tagValue(itemXml,tagName){const match=itemXml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`,'i'));return match?decodeEntities(match[1]):'';}

function categoryFor(text=''){
  const value=text.toLowerCase();
  if(value.includes('hurricane')||value.includes('storm')||value.includes('weather')||value.includes('tropical')) return 'Weather Watch';
  if(value.includes('port')||value.includes('terminal')||value.includes('embarkation')||value.includes('canaveral')||value.includes('nassau')) return 'Ports';
  if(value.includes('flight')||value.includes('airline')||value.includes('tsa')||value.includes('airport')) return 'Travel Impact';
  return 'Cruise Industry';
}

function isBlocked(story){const text=`${story.title||''} ${story.description||''}`.toLowerCase();return BLOCKED_TERMS.some(term=>text.includes(term));}
function isCruiseRelevant(story){const text=`${story.title||''} ${story.description||''} ${story.source||''}`.toLowerCase();return CRUISE_TERMS.some(term=>text.includes(term));}
function normalizeUrl(url=''){return url.trim().replace(/\/$/,'');}

function normalizeStory(story){
  const title=decodeEntities(story.title||'');
  const description=decodeEntities(story.description||'');
  const link=normalizeUrl(story.link||'');
  return {
    category:story.category||categoryFor(`${title} ${description}`),
    title,
    description,
    link,
    source:story.source||'News source',
    sourceWeight:story.sourceWeight||1,
    publishedAt:story.publishedAt||null,
    image:story.image||null
  };
}

function dedupeStories(stories){
  const seenLinks=new Set();
  const seenTitles=new Set();
  return stories.filter(story=>{
    const normalized=normalizeStory(story);
    const linkKey=normalized.link.toLowerCase();
    const titleKey=normalized.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,90);
    if(!normalized.title||!normalized.link) return false;
    if(seenLinks.has(linkKey)||seenTitles.has(titleKey)) return false;
    seenLinks.add(linkKey);
    seenTitles.add(titleKey);
    return true;
  }).map(normalizeStory);
}

function applyEditorialHierarchy(stories){
  const sourceCounts={};
  const sorted=[...stories].sort((a,b)=>{
    const aDate=new Date(a.publishedAt||0).getTime();
    const bDate=new Date(b.publishedAt||0).getTime();
    return (b.sourceWeight-a.sourceWeight) || (bDate-aDate);
  });

  return sorted.filter(story=>{
    const source=story.source||'Unknown';
    sourceCounts[source]=(sourceCounts[source]||0);
    if(sourceCounts[source]>=MAX_PER_SOURCE) return false;
    sourceCounts[source]++;
    return true;
  });
}

async function fetchRssSource(source){
  try{
    const response=await fetch(source.url,{headers:{'user-agent':'StillAfloatCruising/1.0'}});
    if(!response.ok) return [];
    const xml=await response.text();
    const items=[...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0,8);

    return items.map(match=>{
      const itemXml=match[0];
      return normalizeStory({
        title:tagValue(itemXml,'title'),
        link:tagValue(itemXml,'link')||tagValue(itemXml,'guid'),
        description:tagValue(itemXml,'description'),
        publishedAt:tagValue(itemXml,'pubDate')||null,
        source:source.name,
        sourceWeight:source.weight
      });
    });
  }catch(error){return [];}
}

async function fetchGNewsSearch(query,apiKey){
  if(!apiKey) return [];
  try{
    const url=new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q',query);
    url.searchParams.set('lang','en');
    url.searchParams.set('country','us');
    url.searchParams.set('max','10');
    url.searchParams.set('apikey',apiKey);

    const response=await fetch(url.toString());
    if(!response.ok) return [];

    const data=await response.json();
    return (Array.isArray(data.articles)?data.articles:[]).map(article=>normalizeStory({
      title:article.title,
      description:article.description,
      link:article.url,
      source:article.source?.name||'GNews',
      sourceWeight:2,
      publishedAt:article.publishedAt||null,
      image:article.image||null
    }));
  }catch(error){return [];}
}

async function getStories(){
  const apiKey=process.env.GNEWS_API_KEY;
  const rssResults=await Promise.all(RSS_SOURCES.map(fetchRssSource));
  const gnewsResults=await Promise.all(GNEWS_SEARCHES.map(search=>fetchGNewsSearch(search,apiKey)));

  const combined=[...rssResults.flat(),...gnewsResults.flat()];

  const cleaned=dedupeStories(
    combined
      .filter(story=>story.title&&story.link)
      .filter(story=>!isBlocked(story))
      .filter(story=>isCruiseRelevant(story))
  );

  return applyEditorialHierarchy(cleaned);
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=1800');

  try{
    const stories=await getStories();
    return res.status(200).json({
      ok:true,
      source:'rss-plus-gnews-live',
      storyCount:stories.length,
      generatedAt:new Date().toISOString(),
      stories,
      homepage:stories.slice(0,5)
    });
  }catch(error){
    return res.status(500).json({
      ok:false,
      source:'rss-plus-gnews-live',
      storyCount:0,
      generatedAt:new Date().toISOString(),
      stories:[],
      homepage:[],
      error:error.message
    });
  }
}
