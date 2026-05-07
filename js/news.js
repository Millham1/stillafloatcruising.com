const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const sampleNews = [
  {
    title:'Norwegian adjusts Caribbean itineraries due to weather conditions.',
    link:'https://www.ncl.com/'
  },
  {
    title:'Royal Caribbean announces new onboard dining concepts.',
    link:'https://www.royalcaribbean.com/'
  },
  {
    title:'Port Canaveral passenger traffic continues to rise in 2026.',
    link:'https://www.portcanaveral.com/'
  },
  {
    title:'Cruise lines monitoring Atlantic tropical development closely.',
    link:'https://www.nhc.noaa.gov/'
  },
  {
    title:'Celebrity expands premium excursion offerings for Europe sailings.',
    link:'https://www.celebritycruises.com/'
  }
];

function renderHomepageNews(){
  if(!newsContainer) return;

  newsContainer.innerHTML = sampleNews.map(item => `
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.15);">
      <a href="${item.link}" target="_blank" style="font-size:18px;font-weight:700;color:#07183f;text-decoration:none;line-height:1.4;">
        ${item.title}
      </a>
    </div>
  `).join('');
}

function renderFullNews(){
  if(!fullNewsFeed) return;

  fullNewsFeed.innerHTML = sampleNews.map(item => `
    <article class="report-box" style="margin-bottom:18px;">
      <h3>${item.title}</h3>
      <p>Additional cruise coverage and analysis coming soon to Still Afloat.</p>
      <a href="${item.link}" target="_blank" style="display:inline-block;margin-top:12px;color:#0077b6;font-weight:800;">
        Read Full Story →
      </a>
    </article>
  `).join('');
}

renderHomepageNews();
renderFullNews();