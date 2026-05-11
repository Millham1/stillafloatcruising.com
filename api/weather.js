const DESTINATIONS = [
  { slug:'miami', name:'Miami', type:'embarkation', lat:25.7617, lon:-80.1918 },
  { slug:'port-canaveral', name:'Canaveral', type:'embarkation', lat:28.3922, lon:-80.6077 },
  { slug:'fort-lauderdale', name:'Ft Lauderdale', type:'embarkation', lat:26.1224, lon:-80.1373 },
  { slug:'tampa', name:'Tampa', type:'embarkation', lat:27.9506, lon:-82.4572 },
  { slug:'galveston', name:'Galveston', type:'embarkation', lat:29.3013, lon:-94.7977 },
  { slug:'nassau', name:'Nassau', type:'destination', lat:25.0443, lon:-77.3504 },
  { slug:'cozumel', name:'Cozumel', type:'destination', lat:20.4229, lon:-86.9223 },
  { slug:'st-thomas', name:'St Thomas', type:'destination', lat:18.3381, lon:-64.8941 },
  { slug:'grand-cayman', name:'Grand Cayman', type:'destination', lat:19.3133, lon:-81.2546 },
  { slug:'cococay', name:'CocoCay', type:'destination', lat:25.8170, lon:-77.9390 },
  { slug:'great-stirrup', name:'Great Stirrup', type:'destination', lat:25.8244, lon:-77.9120 },
  { slug:'san-juan', name:'San Juan', type:'destination', lat:18.4655, lon:-66.1057 },
  { slug:'aruba', name:'Aruba', type:'destination', lat:12.5211, lon:-69.9683 },
  { slug:'costa-maya', name:'Costa Maya', type:'destination', lat:18.7140, lon:-87.7090 },
  { slug:'roatan', name:'Roatán', type:'destination', lat:16.3247, lon:-86.5365 },
  { slug:'barcelona', name:'Barcelona', type:'other', lat:41.3851, lon:2.1734 },
  { slug:'athens', name:'Athens', type:'other', lat:37.9838, lon:23.7275 },
  { slug:'venice', name:'Venice', type:'other', lat:45.4408, lon:12.3155 },
  { slug:'reykjavik', name:'Reykjavik', type:'other', lat:64.1466, lon:-21.9426 },
  { slug:'sydney', name:'Sydney', type:'other', lat:-33.8688, lon:151.2093 },
  { slug:'juneau', name:'Juneau', type:'other', lat:58.3019, lon:-134.4197 },
  { slug:'ketchikan', name:'Ketchikan', type:'other', lat:55.3422, lon:-131.6461 },
  { slug:'dubrovnik', name:'Dubrovnik', type:'other', lat:42.6507, lon:18.0944 }
];

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
    ...destination,
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
      const destination = DESTINATIONS.find(item => item.slug === place);
      if(!destination) return res.status(404).json({ ok:false, error:'Destination not found' });
      const forecast = await fetchForecast(destination);
      return res.status(200).json({ ok:true, forecast });
    }

    const cards = await Promise.all(DESTINATIONS.map(fetchForecast));
    return res.status(200).json({
      ok:true,
      generatedAt:new Date().toISOString(),
      embarkation:cards.filter(card => card.type === 'embarkation'),
      destinations:cards.filter(card => card.type === 'destination'),
      others:cards.filter(card => card.type === 'other')
    });
  }catch(error){
    return res.status(500).json({ ok:false, error:error.message, embarkation:[], destinations:[], others:[] });
  }
}
