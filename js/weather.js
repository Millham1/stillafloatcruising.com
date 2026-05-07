const weatherContainer = document.getElementById('weather-container');

const ports = [
  {name:'Miami', lat:25.7617, lon:-80.1918},
  {name:'Nassau', lat:25.0443, lon:-77.3504},
  {name:'Port Canaveral', lat:28.4089, lon:-80.6043},
  {name:'Tampa', lat:27.9506, lon:-82.4572}
];

async function loadWeather(){
  if(!weatherContainer) return;

  weatherContainer.innerHTML = '<p>Loading latest port weather...</p>';

  try{
    const cards = await Promise.all(ports.map(async port => {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lon}&current=temperature_2m&temperature_unit=fahrenheit`);
      const data = await res.json();

      return `
        <div class="report-box" style="margin-bottom:16px;background:rgba(255,255,255,0.88);">
          <h3>${port.name}</h3>
          <p style="font-size:24px;font-weight:700;">${Math.round(data.current.temperature_2m)}°F</p>
          <p>Current cruise port conditions</p>
        </div>
      `;
    }));

    weatherContainer.innerHTML = cards.join('');

  } catch(err){
    console.error(err);
    weatherContainer.innerHTML = '<p>Unable to load weather right now.</p>';
  }
}

loadWeather();