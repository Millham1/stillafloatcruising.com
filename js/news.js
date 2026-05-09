const newsContainer = document.getElementById('news-container');
const fullNewsFeed = document.getElementById('full-news-feed');

const sampleNews = [
  {
    title:'Norwegian cruise itineraries impacted by Atlantic weather patterns',
    link:'https://www.cruisehive.com/'
  },
  {
    title:'Royal Caribbean reveals enhancements to onboard dining experiences',
    link:'https://www.royalcaribbeanblog.com/'
  },
  {
    title:'Port Canaveral sees record-setting cruise passenger growth',
    link:'https://www.travelpulse.com/cruise'
  },
  {
    title:'Cruise lines monitoring Caribbean tropical development closely',
    link:'https://www.nhc.noaa.gov/'
  },
  {
    title:'Celebrity Cruises expands premium European shore excursions',
    link:'https://www.cruisecritic.com/news/'
  },
  {
    title:'New cruise taxes and port fees being discussed in key destinations',
    link:'https://www.seatrade-cruise.com/'
  },
  {
    title:'Major cruise lines continue private island expansion projects',
    link:'https://www.cruiselawnews.com/'
  }
];

function renderHomepageNews(){
  if(!newsContainer) return;

  newsContainer.innerHTML = sampleNews.slice(0,5).map(item => `
    <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.15);transition:all .2s ease;">
      <a href="${item.link}" target="_blank"
      style="font-size:18px;font-weight:700;color:#07183f;text-decoration:none;line-height:1.4;display:block;transition:all .2s ease;"
      onmouseover="this.style.color='#0077b6';this.style.transform='translateX(6px)'"
      onmouseout="this.style.color='#07183f';this.style.transform='translateX(0px)'">
        ${item.title}
      </a>
    </div>
  `).join('');
}

function renderFullNews(){
  if(!fullNewsFeed) return;

  fullNewsFeed.innerHTML = sampleNews.map(item => `
    <article class="report-box" style="margin-bottom:20px;">
      <h3>${item.title}</h3>
      <p>Additional reporting and cruise analysis curated for travelers following industry developments.</p>
      <a href="${item.link}" target="_blank" style="display:inline-block;margin-top:14px;color:#0077b6;font-weight:800;font-size:18px;text-decoration:none;">
        Read Full Story →
      </a>
    </article>
  `).join('');
}

renderHomepageNews();
renderFullNews();