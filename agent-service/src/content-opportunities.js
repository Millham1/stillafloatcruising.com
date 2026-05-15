function buildYouTubeOpportunities({ approvedStories = [], candidateStories = [] }) {
  const stories = [...approvedStories, ...candidateStories];

  return stories
    .filter(story => {
      const text = `${story.title || ''} ${story.summary || ''} ${story.travelerImpact || ''}`.toLowerCase();
      return /(cruise|ship|itinerary|port|flight|airport|hurricane|weather|loyalty|pricing|fee|norwegian|royal caribbean|carnival)/.test(text);
    })
    .slice(0, 10)
    .map(story => ({
      storyId: story.id,
      title: `Still Afloat topic: ${story.title}`,
      angle: story.travelerImpact || story.reasoning || 'Explain what this development means for cruise and air travelers.',
      suggestedFormat: inferFormat(story),
      hook: buildHook(story),
      sourceStory: story.title
    }));
}

function inferFormat(story = {}) {
  const text = `${story.title || ''} ${story.summary || ''}`.toLowerCase();

  if (/hurricane|storm|weather|delay|closure|cancel|disruption/.test(text)) {
    return 'Short alert or quick explainer';
  }

  if (/loyalty|pricing|fee|policy|passport|visa/.test(text)) {
    return 'Explainer video';
  }

  return 'Cruise news segment';
}

function buildHook(story = {}) {
  if (story.travelerImpact) {
    return story.travelerImpact;
  }

  return `Here is why cruisers should pay attention to ${story.title}.`;
}

function buildSocialSuggestions({ approvedStories = [] }) {
  return approvedStories.slice(0, 8).map(story => ({
    storyId: story.id,
    platform: 'YouTube Community / Facebook',
    postDraft: `${story.title}\n\n${story.travelerImpact || story.summary || ''}\n\nStill Afloat is watching this for cruise and air-travel impacts.`,
    callToAction: 'Would this change how you plan your next cruise?'
  }));
}

function buildContentOpportunities({ approvedStories = [], candidateStories = [] }) {
  return {
    generatedAt: new Date().toISOString(),
    youtubeTopics: buildYouTubeOpportunities({ approvedStories, candidateStories }),
    socialSuggestions: buildSocialSuggestions({ approvedStories })
  };
}

module.exports = {
  buildContentOpportunities,
  buildYouTubeOpportunities,
  buildSocialSuggestions
};
