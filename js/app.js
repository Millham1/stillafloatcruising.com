async function loadNews() {
  const container = document.getElementById('news-container');
  container.innerHTML = `
    <div class="col-span-full bg-white p-8 rounded-3xl shadow text-center">
      <h3 class="text-2xl font-semibold mb-4">News coming soon!</h3>
      <p class="text-gray-600">We'll pull the latest cruise updates soon.</p>
    </div>`;
}

const API_KEY = 'YOUR_OPENWEATHER_API_KEY';
const ports = [
  {name: "Miami, FL", id: "4164138"},
  {name: "Nassau, Bahamas", id: "3571824"},
  {name: "San Juan, PR", id: "4568127"},
  {name: "Hamilton, Bermuda", id: "3573197"}
];

async function loadWeather() {
  const container = document.getElementById('weather-container');
  container.innerHTML = '<p class="col-span-full text-center">Loading weather...</p>';
  
  for (let port of ports) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${port.id}&appid=${API_KEY}&units=imperial`);
      const data = await res.json();
      const html = `
        <div class="bg-white/10 backdrop-blur rounded-3xl p-6 text-center">
          <h3 class="font-semibold text-xl">${port.name}</h3>
          <div class="text-6xl my-4">${Math.round(data.main.temp)}°F</div>
          <p>${data.weather[0].description}</p>
        </div>`;
      container.innerHTML += html;
    } catch(e) { console.error(e); }
  }
}

window.onload = () => {
  loadNews();
  loadWeather();
};