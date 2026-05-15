function buildFeedbackSignals({ approvedStories = [], rejectedStories = [] }) {
  const approvedCategories = {};
  const rejectedCategories = {};

  for (const story of approvedStories) {
    const key = story.category || 'Unknown';
    approvedCategories[key] = (approvedCategories[key] || 0) + 1;
  }

  for (const story of rejectedStories) {
    const key = story.category || 'Unknown';
    rejectedCategories[key] = (rejectedCategories[key] || 0) + 1;
  }

  return {
    preferredCategories: Object.entries(approvedCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name),

    avoidedCategories: Object.entries(rejectedCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name)
  };
}

function buildLearningPrompt(signals = {}) {
  return {
    preferredCategories: signals.preferredCategories || [],
    avoidedCategories: signals.avoidedCategories || [],
    instructions: [
      'Prefer editorial categories historically approved by the editor.',
      'Reduce stories matching frequently rejected categories.',
      'Learn Still Afloat editorial priorities over time.',
      'Favor operational travel intelligence over filler content.'
    ]
  };
}

module.exports = {
  buildFeedbackSignals,
  buildLearningPrompt
};
