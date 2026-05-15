const registry = require('./source-registry');

function normalize(value = '') {
  return String(value).toLowerCase().trim();
}

function isRejectedSource(source = '') {
  const normalized = normalize(source);
  return registry.rejectedSourcePatterns.some(pattern => normalized.includes(pattern));
}

function enrichStory(story = {}) {
  const source = story.source || '';
  const normalized = normalize(source);

  let trustLevel = 'medium';

  if (registry.trustedCruiseSources.some(item => normalize(item) === normalized)) {
    trustLevel = 'high-cruise';
  } else if (registry.trustedOperationalSources.some(item => normalize(item) === normalized)) {
    trustLevel = 'high-operational';
  } else if (registry.trustedMainstreamSources.some(item => normalize(item) === normalized)) {
    trustLevel = 'high-mainstream';
  }

  const semanticSignals = {
    cruiseRelated: /(cruise|ship|itinerary|port|embarkation|norwegian|royal caribbean|carnival|msc)/i.test(`${story.title} ${story.summary}`),
    aviationRelated: /(faa|airport|airline|flight|aviation|ground stop|air traffic)/i.test(`${story.title} ${story.summary}`),
    weatherRelated: /(storm|hurricane|tropical|weather|wind|flood)/i.test(`${story.title} ${story.summary}`),
    operationalImpact: /(delay|closure|cancel|reroute|disruption|advisory|outage|issue)/i.test(`${story.title} ${story.summary}`)
  };

  return {
    ...story,
    trustLevel,
    semanticSignals
  };
}

function preprocessStories(stories = []) {
  return stories
    .filter(story => !isRejectedSource(story.source || ''))
    .map(enrichStory);
}

module.exports = {
  preprocessStories
};