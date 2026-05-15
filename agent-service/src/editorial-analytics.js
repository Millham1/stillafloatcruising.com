function countBy(items = [], selector) {
  const counts = {};

  for (const item of items) {
    const key = selector(item) || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

function topEntries(map = {}, limit = 10) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function buildEditorialAnalytics({ approvedStories = [], rejectedStories = [], groupedDevelopments = [] }) {
  const categoryCounts = countBy(approvedStories, story => story.category);
  const sourceCounts = countBy(approvedStories, story => (story.sources || [])[0] || story.source || 'Unknown');
  const impactCounts = countBy(approvedStories, story => story.impactLevel || 'Unknown');

  return {
    generatedAt: new Date().toISOString(),

    totals: {
      approvedStories: approvedStories.length,
      rejectedStories: rejectedStories.length,
      groupedDevelopments: groupedDevelopments.length
    },

    topCategories: topEntries(categoryCounts),
    topSources: topEntries(sourceCounts),
    impactDistribution: topEntries(impactCounts),

    operationalSummary: {
      weatherRelated: approvedStories.filter(story => /weather|storm|hurricane/i.test(`${story.title} ${story.summary}`)).length,
      cruiseOperational: approvedStories.filter(story => /port|itinerary|ship|embarkation/i.test(`${story.title} ${story.summary}`)).length,
      airlineOperational: approvedStories.filter(story => /airport|flight|faa|airline/i.test(`${story.title} ${story.summary}`)).length
    }
  };
}

module.exports = {
  buildEditorialAnalytics
};
