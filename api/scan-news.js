const fs = require('fs');
const path = require('path');
const {
  buildCandidateFeed,
  APPROVAL_EMAIL
} = require('./_news-agent-utils');

module.exports = async function handler(req, res) {
  try {
    const stories = await buildCandidateFeed();

    const payload = {
      approvalEmail: APPROVAL_EMAIL,
      generatedAt: new Date().toISOString(),
      maxCandidates: 20,
      stories
    };

    const target = path.join(process.cwd(), 'data/news/candidate-stories.json');

    fs.writeFileSync(
      target,
      JSON.stringify(payload, null, 2)
    );

    return res.status(200).json({
      success: true,
      generatedAt: payload.generatedAt,
      storyCount: stories.length,
      topStories: stories.slice(0, 5).map(story => ({
        title: story.title,
        category: story.category,
        impactScore: story.impactScore,
        sources: story.sources
      }))
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
