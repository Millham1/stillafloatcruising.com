import { CRUISE_LOCATIONS } from '../data/cruiseLocations.js';

const LOCATIONS = CRUISE_LOCATIONS;

function emoji(code){
  if([0].includes(code)) return '☀️';
  if([1,2].includes(code)) return '🌤️';
  if([3].includes(code)) return '☁️';
  if([45,48].includes(code)) return '🌫️';
  if([51,53,55,61,63,65,80,81,82].includes(code)) return '🌧️';
  if([95,96,99].includes(code)) return '⛈️';
  if([71,73,75,77,85,86].includes(code)) return '❄️';
  return '🌤️';
}

function publicLocation(item){
  return {
    slug:item.slug,
    name:item.name,
    type:item.type,
    lat:item.lat,
    lon:item.lon,
    query:item.query || item.name
  };
}

function featuredByType(type, limit = 10){
  const typed = LOCATIONS.filter(item => item.type === type);
  const featured = typed.filter(item => item.featured);
  const combined = [...featured, ...typed.filter(item => !item.featured)];
  const seen = new Set();
  return combined.filter(item => {
    if(seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  }).slice(0, limit);
}

async function fetchForecast(destination){
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', destination.lat);
  url.searchParams.set('longitude', destination.lon);
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '10');

  const response = await fetch(url.toString());
  if(!response.ok) throw new Error(`Weather provider failed for ${destination.slug}`);
  const data = await response.json();

  return {
    ...publicLocation(destination),
    temp: Math.round(data.current.temperature_2m),
    emoji: emoji(data.current.weather_code),
    forecastUrl: `forecast.html?place=${destination.slug}`,
    forecast: data.daily.time.map((day, index) => ({
      day,
      emoji: emoji(data.daily.weather_code[index]),
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index])
    }))
  };
}

export default async function handler(req, res){
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  try{
    const place = req.query.place;

    if(place){
      const destination = LOCATIONS.find(item => item.slug === place);
      if(!destination){
        return res.status(404).json({ ok:false, error:'Destination not found' });
      }

      const forecast = await fetchForecast(destination);
      return res.status(200).json({ ok:true, forecast });
    }

    const embarkationFeatured = featuredByType('embarkation', 10);
    const destinationFeatured = featuredByType('destination', 10);
    const cards = await Promise.all([...embarkationFeatured, ...destinationFeatured].map(fetchForecast));

    return res.status(200).json({
      ok:true,
      generatedAt:new Date().toISOString(),
      embarkation:cards.filter(card => card.type === 'embarkation'),
      destinations:cards.filter(card => card.type === 'destination'),
      allEmbarkationPorts:LOCATIONS.filter(item => item.type === 'embarkation').map(publicLocation).sort((a,b)=>a.name.localeCompare(b.name)),
      allDestinations:LOCATIONS.filter(item => item.type === 'destination').map(publicLocation).sort((a,b)=>a.name.localeCompare(b.name))
    });
  }catch(error){
    return res.status(500).json({
      ok:false,
      error:error.message,
      embarkation:[],
      destinations:[],
      allEmbarkationPorts:LOCATIONS.filter(item => item.type === 'embarkation').map(publicLocation).sort((a,b)=>a.name.localeCompare(b.name)),
      allDestinations:LOCATIONS.filter(item => item.type === 'destination').map(publicLocation).sort((a,b)=>a.name.localeCompare(b.name))
    });
  }
}
