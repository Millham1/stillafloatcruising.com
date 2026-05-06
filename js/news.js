const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const sampleNews = [
  'Norwegian adjusts Caribbean itineraries due to weather conditions.',
  'Royal Caribbean announces new onboard dining concepts.',
  'Port Canaveral passenger traffic continues to rise in 2026.',
  'Cruise lines monitoring Atlantic tropical development closely.',
  'Celebrity expands premium excursion offerings for Europe sailings.'
];

function renderNews(target){
  if(!target) return;
  target.innerHTML = sampleNews.map(item => `
    <div class="report-box" style="margin-bottom:16px;">
      <h3>${item}</h3>
      <p>More cruise coverage coming soon on Still Afloat.</p>
    </div>
  `).join('');
}

renderNews(newsContainer);
renderNews(fullNewsFeed);