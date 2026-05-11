const DESTINATIONS = [
  { slug:'miami', name:'Miami, Florida', type:'embarkation', featured:true, lat:25.7617, lon:-80.1918, query:'Miami cruise port beach' },
  { slug:'port-canaveral', name:'Port Canaveral, Florida', type:'embarkation', featured:true, lat:28.3922, lon:-80.6077, query:'Port Canaveral cruise ship' },
  { slug:'fort-lauderdale', name:'Fort Lauderdale, Florida', type:'embarkation', featured:true, lat:26.1224, lon:-80.1373, query:'Fort Lauderdale cruise port' },
  { slug:'tampa', name:'Tampa, Florida', type:'embarkation', featured:true, lat:27.9506, lon:-82.4572, query:'Tampa waterfront cruise' },
  { slug:'galveston', name:'Galveston, Texas', type:'embarkation', featured:true, lat:29.3013, lon:-94.7977, query:'Galveston cruise terminal' },
  { slug:'seattle', name:'Seattle, Washington', type:'embarkation', lat:47.6062, lon:-122.3321, query:'Seattle cruise port' },
  { slug:'vancouver', name:'Vancouver, Canada', type:'embarkation', lat:49.2827, lon:-123.1207, query:'Vancouver cruise port' },
  { slug:'new-york', name:'New York City, New York', type:'embarkation', lat:40.7128, lon:-74.0060, query:'New York cruise terminal' },
  { slug:'boston', name:'Boston, Massachusetts', type:'embarkation', lat:42.3601, lon:-71.0589, query:'Boston cruise port' },
  { slug:'new-orleans', name:'New Orleans, Louisiana', type:'embarkation', lat:29.9511, lon:-90.0715, query:'New Orleans cruise port' },
  { slug:'los-angeles', name:'Los Angeles, California', type:'embarkation', lat:33.7405, lon:-118.2775, query:'Los Angeles cruise port' },
  { slug:'san-diego', name:'San Diego, California', type:'embarkation', lat:32.7157, lon:-117.1611, query:'San Diego cruise port' },
  { slug:'san-francisco', name:'San Francisco, California', type:'embarkation', lat:37.7749, lon:-122.4194, query:'San Francisco cruise port' },
  { slug:'honolulu', name:'Honolulu, Hawaii', type:'embarkation', lat:21.3069, lon:-157.8583, query:'Honolulu cruise port' },
  { slug:'san-juan-embarkation', name:'San Juan, Puerto Rico', type:'embarkation', lat:18.4655, lon:-66.1057, query:'San Juan Puerto Rico cruise port' },
  { slug:'barcelona', name:'Barcelona, Spain', type:'embarkation', lat:41.3851, lon:2.1734, query:'Barcelona cruise port' },
  { slug:'rome-civitavecchia', name:'Rome / Civitavecchia, Italy', type:'embarkation', lat:42.0924, lon:11.7954, query:'Civitavecchia cruise port' },
  { slug:'athens-piraeus', name:'Athens / Piraeus, Greece', type:'embarkation', lat:37.9420, lon:23.6469, query:'Piraeus cruise port Athens' },
  { slug:'venice', name:'Venice, Italy', type:'embarkation', lat:45.4408, lon:12.3155, query:'Venice Italy cruise' },
  { slug:'southampton', name:'Southampton, England', type:'embarkation', lat:50.9097, lon:-1.4044, query:'Southampton cruise port' },
  { slug:'london-dover', name:'Dover, England', type:'embarkation', lat:51.1279, lon:1.3134, query:'Dover England cruise port' },
  { slug:'amsterdam', name:'Amsterdam, Netherlands', type:'embarkation', lat:52.3676, lon:4.9041, query:'Amsterdam cruise port' },
  { slug:'copenhagen', name:'Copenhagen, Denmark', type:'embarkation', lat:55.6761, lon:12.5683, query:'Copenhagen cruise port' },
  { slug:'stockholm', name:'Stockholm, Sweden', type:'embarkation', lat:59.3293, lon:18.0686, query:'Stockholm cruise port' },
  { slug:'hamburg', name:'Hamburg, Germany', type:'embarkation', lat:53.5511, lon:9.9937, query:'Hamburg cruise port' },
  { slug:'singapore', name:'Singapore', type:'embarkation', lat:1.3521, lon:103.8198, query:'Singapore cruise terminal' },
  { slug:'tokyo-yokohama', name:'Tokyo / Yokohama, Japan', type:'embarkation', lat:35.4437, lon:139.6380, query:'Yokohama cruise port' },
  { slug:'hong-kong', name:'Hong Kong', type:'embarkation', lat:22.3193, lon:114.1694, query:'Hong Kong cruise terminal' },
  { slug:'sydney', name:'Sydney, Australia', type:'embarkation', lat:-33.8688, lon:151.2093, query:'Sydney Australia cruise harbor' },
  { slug:'brisbane', name:'Brisbane, Australia', type:'embarkation', lat:-27.4705, lon:153.0260, query:'Brisbane cruise port' },
  { slug:'auckland', name:'Auckland, New Zealand', type:'embarkation', lat:-36.8509, lon:174.7645, query:'Auckland cruise port' },
  { slug:'dubai', name:'Dubai, United Arab Emirates', type:'embarkation', lat:25.2048, lon:55.2708, query:'Dubai cruise port' },
  { slug:'cape-town', name:'Cape Town, South Africa', type:'embarkation', lat:-33.9249, lon:18.4241, query:'Cape Town cruise port' },

  { slug:'nassau', name:'Nassau, Bahamas', type:'destination', featured:true, lat:25.0443, lon:-77.3504, query:'Nassau Bahamas cruise beach' },
  { slug:'cozumel', name:'Cozumel, Mexico', type:'destination', featured:true, lat:20.4229, lon:-86.9223, query:'Cozumel beach Mexico' },
  { slug:'st-thomas', name:'St. Thomas, USVI', type:'destination', featured:true, lat:18.3381, lon:-64.8941, query:'St Thomas Caribbean beach' },
  { slug:'grand-cayman', name:'Grand Cayman', type:'destination', featured:true, lat:19.3133, lon:-81.2546, query:'Grand Cayman tropical beach' },
  { slug:'cococay', name:'CocoCay, Bahamas', type:'destination', featured:true, lat:25.8170, lon:-77.9390, query:'Perfect Day CocoCay Bahamas' },
  { slug:'great-stirrup', name:'Great Stirrup Cay, Bahamas', type:'destination', featured:true, lat:25.8244, lon:-77.9120, query:'Great Stirrup Cay Bahamas' },
  { slug:'san-juan', name:'San Juan, Puerto Rico', type:'destination', featured:true, lat:18.4655, lon:-66.1057, query:'San Juan Puerto Rico cruise' },
  { slug:'aruba', name:'Aruba', type:'destination', featured:true, lat:12.5211, lon:-69.9683, query:'Aruba tropical beach' },
  { slug:'costa-maya', name:'Costa Maya, Mexico', type:'destination', featured:true, lat:18.7140, lon:-87.7090, query:'Costa Maya Mexico beach' },
  { slug:'roatan', name:'Roatán, Honduras', type:'destination', featured:true, lat:16.3247, lon:-86.5365, query:'Roatan Honduras tropical island' },
  { slug:'puerto-plata', name:'Puerto Plata, Dominican Republic', type:'destination', lat:19.7808, lon:-70.6871, query:'Puerto Plata Dominican Republic cruise' },
  { slug:'amber-cove', name:'Amber Cove, Dominican Republic', type:'destination', lat:19.8397, lon:-70.7742, query:'Amber Cove Dominican Republic' },
  { slug:'st-maarten', name:'St. Maarten', type:'destination', lat:18.0425, lon:-63.0548, query:'St Maarten cruise beach' },
  { slug:'st-kitts', name:'St. Kitts', type:'destination', lat:17.3026, lon:-62.7177, query:'St Kitts Caribbean beach' },
  { slug:'barbados', name:'Barbados', type:'destination', lat:13.1939, lon:-59.5432, query:'Barbados cruise beach' },
  { slug:'st-lucia', name:'St. Lucia', type:'destination', lat:13.9094, lon:-60.9789, query:'St Lucia Caribbean' },
  { slug:'antigua', name:'Antigua', type:'destination', lat:17.0608, lon:-61.7964, query:'Antigua Caribbean beach' },
  { slug:'curacao', name:'Curaçao', type:'destination', lat:12.1696, lon:-68.9900, query:'Curacao cruise port' },
  { slug:'bonaire', name:'Bonaire', type:'destination', lat:12.1784, lon:-68.2385, query:'Bonaire Caribbean' },
  { slug:'belize-city', name:'Belize City, Belize', type:'destination', lat:17.5046, lon:-88.1962, query:'Belize cruise port' },
  { slug:'key-west', name:'Key West, Florida', type:'destination', lat:24.5551, lon:-81.7800, query:'Key West cruise port' },
  { slug:'bermuda', name:'Bermuda', type:'destination', lat:32.3078, lon:-64.7505, query:'Bermuda cruise port' },
  { slug:'perfect-day-lelepa', name:'Vanuatu / Lelepa', type:'destination', lat:-17.6100, lon:168.2100, query:'Vanuatu tropical island' },
  { slug:'juneau', name:'Juneau, Alaska', type:'destination', lat:58.3019, lon:-134.4197, query:'Juneau Alaska cruise' },
  { slug:'ketchikan', name:'Ketchikan, Alaska', type:'destination', lat:55.3422, lon:-131.6461, query:'Ketchikan Alaska cruise' },
  { slug:'skagway', name:'Skagway, Alaska', type:'destination', lat:59.4583, lon:-135.3139, query:'Skagway Alaska cruise' },
  { slug:'sitka', name:'Sitka, Alaska', type:'destination', lat:57.0531, lon:-135.3300, query:'Sitka Alaska cruise' },
  { slug:'icy-strait-point', name:'Icy Strait Point, Alaska', type:'destination', lat:58.1294, lon:-135.4616, query:'Icy Strait Point Alaska cruise' },
  { slug:'victoria-bc', name:'Victoria, Canada', type:'destination', lat:48.4284, lon:-123.3656, query:'Victoria BC cruise port' },
  { slug:'dubrovnik', name:'Dubrovnik, Croatia', type:'destination', lat:42.6507, lon:18.0944, query:'Dubrovnik Croatia cruise' },
  { slug:'santorini', name:'Santorini, Greece', type:'destination', lat:36.3932, lon:25.4615, query:'Santorini Greece cruise' },
  { slug:'mykonos', name:'Mykonos, Greece', type:'destination', lat:37.4467, lon:25.3289, query:'Mykonos Greece cruise' },
  { slug:'naples', name:'Naples, Italy', type:'destination', lat:40.8518, lon:14.2681, query:'Naples Italy cruise port' },
  { slug:'palma', name:'Palma de Mallorca, Spain', type:'destination', lat:39.5696, lon:2.6502, query:'Palma Mallorca cruise port' },
  { slug:'marseille', name:'Marseille, France', type:'destination', lat:43.2965, lon:5.3698, query:'Marseille cruise port' },
  { slug:'lisbon', name:'Lisbon, Portugal', type:'destination', lat:38.7223, lon:-9.1393, query:'Lisbon cruise port' },
  { slug:'reykjavik', name:'Reykjavik, Iceland', type:'destination', lat:64.1466, lon:-21.9426, query:'Reykjavik Iceland cruise' },
  { slug:'bergen', name:'Bergen, Norway', type:'destination', lat:60.3913, lon:5.3221, query:'Bergen Norway cruise' },
  { slug:'phuket', name:'Phuket, Thailand', type:'destination', lat:7.8804, lon:98.3923, query:'Phuket Thailand beach' },
  { slug:'bali', name:'Bali, Indonesia', type:'destination', lat:-8.3405, lon:115.0920, query:'Bali tropical beach' },
  { slug:'fiji', name:'Fiji', type:'destination', lat:-17.7134, lon:178.0650, query:'Fiji tropical island' },
  { slug:'bora-bora', name:'Bora Bora, French Polynesia', type:'destination', lat:-16.5004, lon:-151.7415, query:'Bora Bora lagoon' },
  { slug:'noumea', name:'Noumea, New Caledonia', type:'destination', lat:-22.2758, lon:166.4580, query:'Noumea New Caledonia cruise' },
  { slug:'hobart', name:'Hobart, Tasmania', type:'destination', lat:-42.8821, lon:147.3272, query:'Hobart Tasmania cruise' },
  { slug:'wellington', name:'Wellington, New Zealand', type:'destination', lat:-41.2865, lon:174.7762, query:'Wellington New Zealand cruise' }
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

function publicLocation(item){
  return {
    slug:item.slug,
    name:item.name,
    type:item.type
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

    const featured = DESTINATIONS.filter(item => item.featured);
    const cards = await Promise.all(featured.map(fetchForecast));
    return res.status(200).json({
      ok:true,
      generatedAt:new Date().toISOString(),
      embarkation:cards.filter(card => card.type === 'embarkation'),
      destinations:cards.filter(card => card.type === 'destination'),
      allEmbarkationPorts:DESTINATIONS.filter(item => item.type === 'embarkation').map(publicLocation),
      allDestinations:DESTINATIONS.filter(item => item.type === 'destination').map(publicLocation)
    });
  }catch(error){
    return res.status(500).json({ ok:false, error:error.message, embarkation:[], destinations:[], allEmbarkationPorts:[], allDestinations:[] });
  }
}
