export default async function handler(req, res) {
  const fallbackStories = [
    {
      category: 'Cruise Industry',
      title: 'Cruise lines monitoring tropical developments in the Atlantic',
      link: 'https://www.cruisehive.com/news/'
    },
    {
      category: 'Travel Impact',
      title: 'Airline disruptions continue affecting embarkation planning',
      link: 'https://www.reuters.com/world/'
    },
    {
      category: 'Ports',
      title: 'Port Canaveral continues major terminal expansion projects',
      link: 'https://www.portcanaveral.com/news/'
    },
    {
      category: 'Weather Watch',
      title: 'Caribbean weather systems remain under close observation',
      link: 'https://www.weather.com/storms/hurricane'
    },
    {
      category: 'Cruise Industry',
      title: 'Royal Caribbean expands onboard entertainment experiences',
      link: 'https://www.royalcaribbeanblog.com/'
    }
  ];

  res.status(200).json({
    source: 'still-afloat-api',
    stories: fallbackStories
  });
}
