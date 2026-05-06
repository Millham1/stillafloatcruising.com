const weatherContainer = document.getElementById('weather-container');

const ports = [
  {name:'Miami', temp:'84°', condition:'Partly Cloudy'},
  {name:'Nassau', temp:'82°', condition:'Sunny'},
  {name:'Port Canaveral', temp:'81°', condition:'Breezy'},
  {name:'Tampa', temp:'86°', condition:'Scattered Storms'}
];

if(weatherContainer){
  weatherContainer.innerHTML = ports.map(port => `
    <div class="report-box" style="margin-bottom:16px;">
      <h3>${port.name}</h3>
      <p>${port.temp} • ${port.condition}</p>
    </div>
  `).join('');
}
