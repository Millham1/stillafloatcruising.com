const {
  buildCandidateFeed,
  APPROVAL_EMAIL,
  DATA_PATHS,
  writeRepoJson,
  sendDigestEmail
} = require('./_news-agent-utils');

const { runEditorialAgent } = require('../agent-service/src/run-agent');
const { normalizeAgentOutput } = require('../agent-service/src/normalize-agent-output');

module.exports = async function handler(req, res) {
  try {
    const rawStories = await buildCandidateFeed();

    const agentOutput = await runEditorialAgent({
      stories: rawStories,
      openai: process.env.OPENAI_API_KEY
    });

    const curated = normalizeAgentOutput(agentOutput, rawStories);

    const payload = {
      approvalEmail: APPROVAL_EMAIL,
      generatedAt: curated.generatedAt,
      editorialMode: curated.editorialMode,
      agentVersion: curated.agentVersion,
      groupedDevelopments: curated.groupedDevelopments,
      rejectedStories: curated.rejectedStories,
      homepageTop5: curated.homepageTop5,
      stories: curated.stories
    };

    await writeRepoJson(
      DATA_PATHS.candidates,
      payload,
      'Update AI editorial intelligence digest'
    );

    const emailResult = await sendDigestEmail(curated.stories);

    return res.status(200).json({
      success: true,
      editorialMode: curated.editorialMode,
      generatedAt: curated.generatedAt,
      rawStoryCount: rawStories.length,
      curatedStoryCount: curated.stories.length,
      rejectedCount: curated.rejectedStories.length,
      groupedDevelopmentCount: curated.groupedDevelopments.length,
      email: emailResult,
      homepageStories: curated.homepageTop5.map(story => ({
        title: story.title,
        category: story.category,
        impactLevel: story.impactLevel,
        featured: story.featured
      }))
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
      editorialMode: 'semantic-ai-agent'
    });
  }
};