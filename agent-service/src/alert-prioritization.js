function classifyUrgency(story = {}) {
  const text = `${story.title || ''} ${story.summary || ''} ${story.travelerImpact || ''}`.toLowerCase();

  if (/(hurricane warning|port closure|faa outage|ground stop|ship disabled|embarkation cancelled|major disruption)/.test(text)) {
    return 'critical';
  }

  if (/(delay|storm|reroute|travel advisory|weather impact|mechanical issue|airport disruption)/.test(text)) {
    return 'high';
  }

  if (/(pricing|loyalty|policy|new itinerary|new ship)/.test(text)) {
    return 'medium';
  }

  return 'low';
}

function buildOperationalAlerts(stories = []) {
  return stories
    .map(story => ({
      id: story.id,
      title: story.title,
      category: story.category,
      urgency: classifyUrgency(story),
      travelerImpact: story.travelerImpact,
      summary: story.summary,
      publishedAt: story.publishedAt,
      sources: story.sources || []
    }))
    .filter(alert => alert.urgency !== 'low')
    .sort((a, b) => {
      const weights = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      };

      return weights[b.urgency] - weights[a.urgency];
    });
}

module.exports = {
  buildOperationalAlerts,
  classifyUrgency
};
