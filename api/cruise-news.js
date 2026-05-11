const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed', weight: 3, tier: 'lifestyle' },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml', weight: 3, tier: 'lifestyle' },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/', weight: 1, tier: 'industry' },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml', weight: 1, tier: 'industry' }
];

const MAX_PER_SOURCE = 2;

const GNEWS_SEARCHES = [
  'cruise vacation tips',
  'cruise private island',
  'cruise food entertainment',
  'cruise itinerary change',
  'cruise weather disruption',
  'Port Canaveral cruise terminal',
  'CNN cruise travel',
  'Fox News cruise ship',
  'CBS cruise travel',
  'Reuters cruise industry'
];

const BLOCKED_TERMS = ['politics','election','war','shooting','murder','hostage','stock market'];

function normalizeUrl(url=''){return url.trim().replace(/\/$/,'');}
function stripCdata(value=''){return value.replace(/^<!\[CDATA\[/,'').replace(/\]\]>$/,'').trim();}
function decodeEntities(value=''){return stripCdata(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]*>/g,'').trim();}
function tagValue(itemXml,tagName){const match=itemXml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`,'i'));return match?decodeEntities(match[1]):'';}

function classifyStory(text=''){
  const value=text.toLowerCase();

  if(value.includes('storm')||value.includes('hurricane')||value.includes('delay')||value.includes('cancel')||value.includes('itinerary')||value.includes('weather')||value.includes('closure')||value.includes('warning')){
    return { tier:'impact', category:'Cruise Impact', score:2 };
  }

  if(value.includes('earnings')||value.includes('fleet')||value.includes('ceo')||value.includes('ship order')||value.includes('construction')||value.includes('deployment')||value.includes('industry')){
    return { tier:'industry', category:'Industry Intelligence', score:1 };
  }

  return { tier:'lifestyle', category:'Cruise Life', score:3 };
}

function normalizeStory(story){
  const title=decodeEntities(story.title||'');
  const description=decodeEntities(story.description||'');
  const link=normalizeUrl(story.link||'');
  const classification=classifyStory(`${title} ${description}`);

  return {
    title,
    description,
    link,
    source:story.source||'News source',
    category:classification.category,
    tier:classification.tier,
    score:(story.sourceWeight||1)+classification.score,
    publishedAt:story.publishedAt||null,
    image:story.image||null
  };
}

function isBlocked(story){
  const text=`${story.title||''} ${story.description||''}`.toLowerCase();
  return BLOCKED_TERMS.some(term=>text.includes(term));
}

function dedupeStories(stories){
  const seenLinks=new Set();
  const seenTitles=new Set();

  return stories.filter(story=>{
    const linkKey=story.link.toLowerCase();
    const titleKey=story.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,90);

    if(!story.title||!story.link) return false;
    if(seenLinks.has(linkKey)||seenTitles.has(titleKey)) return false;

    seenLinks.add(linkKey);
    seenTitles.add(titleKey);
    return true;
  });
}

function applyEditorialHierarchy(stories){
  const sourceCounts={};
  const tierOrder={ lifestyle:3, impact:2, industry:1 };

  return [...stories]
    .sort((a,b)=>{
      const tierDiff=(tierOrder[b.tier]||0)-(tierOrder[a.tier]||0);
      if(tierDiff!==0) return tierDiff;

      const scoreDiff=(b.score||0)-(a.score||0);
      if(scoreDiff!==0) return scoreDiff;

      return new Date(b.publishedAt||0)-new Date(a.publishedAt||0);
    })
    .filter(story=>{
      sourceCounts[story.source]=(sourceCounts[story.source]||0);
      if(sourceCounts[story.source]>=MAX_PER_SOURCE) return false;
      sourceCounts[story.source]++;
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
        source:source.name,
        sourceWeight:source.weight,
        publishedAt:tagValue(itemXml,'pubDate')||null
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

  return applyEditorialHierarchy(
    dedupeStories(
      [...rssResults.flat(),...gnewsResults.flat()]
        .filter(story=>story.title&&story.link)
        .filter(story=>!isBlocked(story))
    )
  );
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=1800');

  try{
    const stories=await getStories();

    return res.status(200).json({
      ok:true,
      source:'editorial-cruise-feed',
      storyCount:stories.length,
      generatedAt:new Date().toISOString(),
      stories,
      homepage:stories.slice(0,5)
    });
  }catch(error){
    return res.status(500).json({
      ok:false,
      stories:[],
      homepage:[],
      error:error.message
    });
  }
}
