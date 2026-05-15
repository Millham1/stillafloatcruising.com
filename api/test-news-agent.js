const {
  NEWS_API_KEY,
  GNEWS_API_KEY,
  WEATHER_API_KEY,
  PEXELS_API_KEY,
  buildCandidateFeed
} = require('./_news-agent-utils');

module.exports = async function handler(req, res) {
  try {
    const stories = await buildCandidateFeed();

    return res.status(200).json({
      success: true,
      environment: {
        newsapi: Boolean(NEWS_API_KEY),
        gnews: Boolean(GNEWS_API_KEY),
        weather: Boolean(WEATHER_API_KEY),
        pexels: Boolean(PEXELS_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        resend: Boolean(process.env.RESEND_API_KEY),
        github: Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN)
      },
      generatedStories: stories.length,
      sampleStories: stories.slice(0, 5).map(story => ({
        title: story.title,
        category: story.category,
        impactScore: story.impactScore,
        aiSummary: Boolean(story.aiSummary),
        sources: story.sources
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
