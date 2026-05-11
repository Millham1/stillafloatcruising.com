const RSS_SOURCES = [
  { name: 'Cruise Hive', url: 'https://www.cruisehive.com/feed', authority: 45 },
  { name: 'Royal Caribbean Blog', url: 'https://www.royalcaribbeanblog.com/rss.xml', authority: 55 },
  { name: 'Cruise Industry News', url: 'https://cruiseindustrynews.com/cruise-news/feed/', authority: 70 },
  { name: 'Seatrade Cruise', url: 'https://www.seatrade-cruise.com/rss.xml', authority: 70 }
];

const INTENT_SEARCHES = [
  { q: 'cruise vacation tips OR cruise travel tips OR cruise passenger experience', intent: 'lifestyle' },
  { q: 'cruise ship food entertainment cabins private island', intent: 'lifestyle' },
  { q: 'cruise ports Caribbean Alaska Mediterranean travel', intent: 'lifestyle' },
  { q: 'CNN cruise travel OR cruise ship passengers', intent: 'lifestyle' },
  { q: 'Fox News cruise ship OR cruise travel', intent: 'lifestyle' },
  { q: 'CBS News cruise travel OR cruise ship', intent: 'lifestyle' },
  { q: 'USA Today cruise travel vacation', intent: 'lifestyle' },

  { q: 'cruise itinerary change weather disruption hurricane cruise', intent: 'impact' },
  { q: 'cruise ship delayed port closure passengers stranded', intent: 'impact' },
  { q: 'airport delays cruise passengers travel disruption', intent: 'impact' },
  { q: 'Weather Channel cruise hurricane Caribbean', intent: 'impact' },
  { q: 'AP cruise ship passengers weather itinerary', intent: 'impact' },
  { q: 'Reuters cruise ship disruption port weather', intent: 'impact' },

  { q: 'cruise line earnings fleet order ship construction', intent: 'industry' },
  { q: 'cruise industry deployment port development executive', intent: 'industry' },
  { q: 'Reuters cruise industry Royal Caribbean Carnival Norwegian', intent: 'industry' }
];

const BLOCKED_TERMS = ['politics','election','war','shooting','murder','hostage','stock market','court case','lawsuit unrelated'];

const AUTHORITY_BONUS = [
  { match: 'reuters', bonus: 35 },
  { match: 'associated press', bonus: 34 },
  { match: 'ap news', bonus: 34 },
  { match: 'cnn', bonus: 30 },
  { match: 'cbs', bonus: 28 },
  { match: 'nbc', bonus: 28 },
  { match: 'fox', bonus: 25 },
  { match: 'usa today', bonus: 24 },
  { match: 'weather channel', bonus: 30 },
  { match: 'noaa', bonus: 35 },
  { match: 'cruise critic', bonus: 24 },
  { match: 'royal caribbean blog', bonus: 18 },
  { match: 'cruise industry news', bonus: 16 },
  { match: 'seatrade', bonus: 16 },
  { match: 'cruise hive', bonus: 5 }
];

const TIER_BASE = { lifestyle: 300, impact: 200, industry: 100 };
const MAX_PER_SOURCE_HOMEPAGE = 1;
const MAX_PER_SOURCE_FULL = 3;

function stripCdata(value=''){return value.replace(/^<!\[CDATA\[/,'').replace(/\]\]>$/,'').trim();}
function decodeEntities(value=''){return stripCdata(value).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]*>/g,'').trim();}
function tagValue(itemXml,tagName){const match=itemXml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`,'i'));return match?decodeEntities(match[1]):'';}
function normalizeUrl(url=''){return url.trim().replace(/\/$/,'');}
function hostFromUrl(url=''){try{return new URL(url).hostname.replace(/^www\./,'');}catch{return '';}}

function authorityFor(source='', link=''){
  const text=`${source} ${hostFromUrl(link)}`.toLowerCase();
  const found=AUTHORITY_BONUS.find(item=>text.includes(item.match));
  return found ? found.bonus : 10;
}

function classifyIntent(text='', fallback='lifestyle'){
  const value=text.toLowerCase();

  const impactTerms=['hurricane','storm','weather','delay','delayed','cancel','canceled','cancelled','itinerary change','port closure','closed port','stranded','diverted','medical evacuation','outbreak','warning','advisory','rough seas'];
  const industryTerms=['earnings','stock','fleet','order','shipyard','newbuild','executive','ceo','quarterly','deployment','capacity','revenue','investor','construction','terminal expansion'];
  const lifestyleTerms=['tips','food','dining','restaurant','cabin','stateroom','balcony','private island','cococay','great stirrup','shore excursion','packing','things to do','passenger experience','vacation','travel','beach','port guide','entertainment','casino','drink package'];

  if(impactTerms.some(term=>value.includes(term))) return { tier:'impact', category:'Cruise Impact', intentScore:70 };
  if(industryTerms.some(term=>value.includes(term))) return { tier:'industry', category:'Industry Intelligence', intentScore:45 };
  if(lifestyleTerms.some(term=>value.includes(term))) return { tier:'lifestyle', category:'Cruise Life', intentScore:80 };

  if(fallback==='impact') return { tier:'impact', category:'Cruise Impact', intentScore:45 };
  if(fallback==='industry') return { tier:'industry', category:'Industry Intelligence', intentScore:35 };
  return { tier:'lifestyle', category:'Cruise Life', intentScore:50 };
}

function isBlocked(story){
  const text=`${story.title||''} ${story.description||''}`.toLowerCase();
  return BLOCKED_TERMS.some(term=>text.includes(term));
}

function isCruiserUseful(story){
  const text=`${story.title||''} ${story.description||''} ${story.source||''}`.toLowerCase();
  const usefulTerms=['cruise','ship','passenger','port','caribbean','bahamas','alaska','mediterranean','vacation','travel','carnival','royal caribbean','norwegian','ncl','celebrity','princess','msc','virgin voyages','disney cruise','cococay','great stirrup','private island','shore excursion','embarkation','itinerary'];
  return usefulTerms.some(term=>text.includes(term));
}

function normalizeStory(raw){
  const title=decodeEntities(raw.title||'');
  const description=decodeEntities(raw.description||'');
  const link=normalizeUrl(raw.link||'');
  const source=raw.source||hostFromUrl(link)||'News source';
  const classification=classifyIntent(`${title} ${description}`, raw.intent);
  const authority=raw.authority ?? authorityFor(source, link);
  const publishedTime=new Date(raw.publishedAt||0).getTime()||0;
  const freshness=publishedTime ? Math.max(0, 30 - Math.floor((Date.now()-publishedTime)/86400000)) : 0;

  return {
    title,
    description,
    link,
    source,
    category:classification.category,
    tier:classification.tier,
    score:(TIER_BASE[classification.tier]||0)+classification.intentScore+authority+freshness,
    publishedAt:raw.publishedAt||null,
    image:raw.image||null
  };
}

function topicKey(story){
  return story.title.toLowerCase()
    .replace(/royal caribbean|norwegian|carnival|celebrity|cruise|cruises|ship|passengers|travel|vacation/g,'')
    .replace(/[^a-z0-9 ]/g,'')
    .split(/\s+/)
    .filter(word=>word.length>4)
    .slice(0,7)
    .join('-');
}

function dedupeAndPreferAuthority(stories){
  const byLink=new Map();
  const byTitle=new Map();
  const byTopic=new Map();

  stories.forEach(story=>{
    if(!story.title||!story.link) return;
    if(isBlocked(story)||!isCruiserUseful(story)) return;

    const linkKey=story.link.toLowerCase();
    const titleKey=story.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,100);
    const tKey=topicKey(story);

    const current=byLink.get(linkKey);
    if(!current||story.score>current.score) byLink.set(linkKey,story);

    const currentTitle=byTitle.get(titleKey);
    if(!currentTitle||story.score>currentTitle.score) byTitle.set(titleKey,story);

    if(tKey.length>8){
      const currentTopic=byTopic.get(tKey);
      if(!currentTopic||story.score>currentTopic.score) byTopic.set(tKey,story);
    }
  });

  const merged=[...byLink.values(),...byTitle.values(),...byTopic.values()];
  const finalMap=new Map();
  merged.forEach(story=>{
    const key=story.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,100);
    const existing=finalMap.get(key);
    if(!existing||story.score>existing.score) finalMap.set(key,story);
  });

  return [...finalMap.values()];
}

function balanceSources(stories, maxPerSource){
  const counts={};
  return stories.filter(story=>{
    counts[story.source]=(counts[story.source]||0);
    if(counts[story.source]>=maxPerSource) return false;
    counts[story.source]++;
    return true;
  });
}

function rankStories(stories){
  return [...stories].sort((a,b)=>b.score-a.score || new Date(b.publishedAt||0)-new Date(a.publishedAt||0));
}

function selectHomepage(stories){
  const ranked=rankStories(stories);
  const balanced=balanceSources(ranked, MAX_PER_SOURCE_HOMEPAGE);
  return balanced.slice(0,5);
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
        authority:source.authority,
        publishedAt:tagValue(itemXml,'pubDate')||null
      });
    });
  }catch(error){return [];}
}

async function fetchGNewsSearch(search, apiKey){
  if(!apiKey) return [];
  try{
    const url=new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q',search.q);
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
      source:article.source?.name||hostFromUrl(article.url)||'GNews',
      intent:search.intent,
      publishedAt:article.publishedAt||null,
      image:article.image||null
    }));
  }catch(error){return [];}
}

async function getStories(){
  const apiKey=process.env.GNEWS_API_KEY;
  const rssResults=await Promise.all(RSS_SOURCES.map(fetchRssSource));
  const gnewsResults=await Promise.all(INTENT_SEARCHES.map(search=>fetchGNewsSearch(search,apiKey)));
  const cleaned=dedupeAndPreferAuthority([...rssResults.flat(),...gnewsResults.flat()]);
  return balanceSources(rankStories(cleaned), MAX_PER_SOURCE_FULL);
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=600, stale-while-revalidate=1200');
  try{
    const stories=await getStories();
    return res.status(200).json({
      ok:true,
      source:'still-afloat-editorial-intelligence',
      storyCount:stories.length,
      generatedAt:new Date().toISOString(),
      stories,
      homepage:selectHomepage(stories)
    });
  }catch(error){
    return res.status(500).json({ok:false,stories:[],homepage:[],error:error.message});
  }
}
