function stableId(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

function normalizeStory(story = {}, fallback = {}) {
  const title = story.title || fallback.title || 'Untitled travel intelligence item';

  return {
    id: story.id || fallback.id || stableId(title),
    title,
    category: story.category || fallback.category || 'Travel Intelligence',
    impactLevel: story.impactLevel || story.impact || fallback.impactLevel || 'Medium',
    impactScore: Number(story.impactScore || fallback.impactScore || 70),
    travelerImpact: story.travelerImpact || story.whyItMatters || '',
    summary: story.summary || fallback.summary || '',
    reasoning: story.reasoning || '',
    homepageCandidate: Boolean(story.homepageCandidate || story.featured || false),
    featured: Boolean(story.homepageCandidate || story.featured || false),
    sourceAttribution: story.sourceAttribution || story.sources || fallback.sources || [],
    sources: story.sources || story.sourceAttribution || fallback.sources || [],
    sourceLinks: story.sourceLinks || fallback.sourceLinks || [],
    link: story.link || fallback.link || '',
    image: story.image || fallback.image || '',
    publishedAt: story.publishedAt || fallback.publishedAt || new Date().toISOString(),
    status: 'candidate',
    agentCurated: true
  };
}

function normalizeAgentOutput(agentOutput = {}, rawStories = []) {
  const rawById = new Map(rawStories.map(story => [story.id, story]));
  const digest = Array.isArray(agentOutput.top20Digest) ? agentOutput.top20Digest : [];
  const homepage = Array.isArray(agentOutput.homepageTop5) ? agentOutput.homepageTop5 : [];
  const homepageIds = new Set(homepage.map(story => story.id || stableId(story.title || '')));

  const stories = digest.map(story => {
    const fallback = rawById.get(story.id) || rawStories.find(raw => raw.title === story.title) || {};
    const normalized = normalizeStory(story, fallback);
    normalized.homepageCandidate = homepageIds.has(normalized.id) || normalized.homepageCandidate;
    normalized.featured = normalized.homepageCandidate;
    return normalized;
  });

  return {
    generatedAt: new Date().toISOString(),
    agentVersion: 'ai-editorial-agent-v1',
    editorialMode: 'semantic-ai-agent',
    stories: stories.slice(0, 20),
    homepageTop5: homepage.map(story => normalizeStory(story, rawById.get(story.id) || {})).slice(0, 5),
    rejectedStories: Array.isArray(agentOutput.rejectedStories) ? agentOutput.rejectedStories : [],
    groupedDevelopments: Array.isArray(agentOutput.groupedDevelopments) ? agentOutput.groupedDevelopments : [],
    rawAgentOutput: agentOutput
  };
}

module.exports = {
  normalizeAgentOutput,
  normalizeStory,
  stableId
};
