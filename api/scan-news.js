const {
  buildCandidateFeed,
  APPROVAL_EMAIL,
  DATA_PATHS,
  writeRepoJson,
  sendDigestEmail
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

    await writeRepoJson(
      DATA_PATHS.candidates,
      payload,
      'Update AI news candidate digest'
    );

    const emailResult = await sendDigestEmail(stories);

    return res.status(200).json({
      success: true,
      generatedAt: payload.generatedAt,
      storyCount: stories.length,
      email: emailResult,
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
