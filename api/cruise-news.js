export default async function handler(req, res) {
  const fallbackStories = [
    {
      category: 'Weather Watch',
      title: 'Cruise lines monitoring tropical developments in the Atlantic',
      link: 'https://www.weather.com/storms/hurricane'
    },
    {
      category: 'Cruise Industry',
      title: 'Royal Caribbean Blog tracks new entertainment and dining developments',
      link: 'https://www.royalcaribbeanblog.com/blog'
    },
    {
      category: 'Ports',
      title: 'Port Canaveral continues major cruise terminal expansion projects',
      link: 'https://www.portcanaveral.com/Newsroom'
    },
    {
      category: 'Travel Impact',
      title: 'Reuters reports ongoing airline and travel disruption concerns',
      link: 'https://www.reuters.com/world/us/'
    },
    {
      category: 'Cruise Industry',
      title: 'Cruise Hive continues coverage of itinerary and ship updates',
      link: 'https://www.cruisehive.com/'
    },
    {
      category: 'Cruise Industry',
      title: 'Cruise Critic tracks breaking cruise news and passenger updates',
      link: 'https://www.cruisecritic.com/news/'
    },
    {
      category: 'Travel Impact',
      title: 'Fox Weather monitors Caribbean systems affecting cruise routes',
      link: 'https://www.foxweather.com/weather-news'
    }
  ];

  res.status(200).json({
    source: 'still-afloat-api',
    stories: fallbackStories
  });
}
