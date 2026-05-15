function buildEditorialMemory({ approvedStories = [], rejectedStories = [] }) {
  return {
    approvedPatterns: approvedStories.slice(0, 50).map(story => ({
      title: story.title,
      category: story.category,
      reasoning: story.reasoning,
      travelerImpact: story.travelerImpact
    })),

    rejectedPatterns: rejectedStories.slice(0, 50).map(story => ({
      title: story.title,
      rejectionReason: story.rejectionReason || 'Low editorial value'
    }))
  };
}

function buildReinforcementPrompt(memory = {}) {
  return {
    approvedPatterns: memory.approvedPatterns || [],
    rejectedPatterns: memory.rejectedPatterns || [],
    instructions: [
      'Favor stories similar to previously approved editorial selections.',
      'Avoid stories similar to previously rejected stories.',
      'Learn the Still Afloat editorial style over time.',
      'Prioritize meaningful traveler impact over generic news volume.'
    ]
  };
}

module.exports = {
  buildEditorialMemory,
  buildReinforcementPrompt
};