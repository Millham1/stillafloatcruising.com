const {
  buildCandidateFeed,
  APPROVAL_EMAIL,
  DATA_PATHS,
  writeRepoJson,
  sendDigestEmail,
  fetchRepoJson
} = require('./_news-agent-utils');

const { runEditorialAgent } = require('../agent-service/src/run-agent');
const { normalizeAgentOutput } = require('../agent-service/src/normalize-agent-output');
const { renderEditorialDigest } = require('../agent-service/src/render-digest');

module.exports = async function handler(req, res) {
  try {
    const approved = await fetchRepoJson(DATA_PATHS.approved).catch(() => ({ json: { stories: [] } }));
    const candidatesExisting = await fetchRepoJson(DATA_PATHS.candidates).catch(() => ({ json: { rejectedStories: [] } }));

    const rawStories = await buildCandidateFeed();

    const agentOutput = await runEditorialAgent({
      stories: rawStories,
      openai: process.env.OPENAI_API_KEY,
      editorialMemory: {
        approvedStories: approved.json?.stories || [],
        rejectedStories: candidatesExisting.json?.rejectedStories || []
      }
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

    const digestHtml = renderEditorialDigest({
      stories: curated.stories,
      homepageTop5: curated.homepageTop5,
      groupedDevelopments: curated.groupedDevelopments,
      rejectedStories: curated.rejectedStories,
      siteUrl: process.env.SITE_URL || process.env.VERCEL_URL,
      token: process.env.AGENT_APPROVAL_TOKEN
    });

    const emailResult = await sendDigestEmail([
      {
        id: 'editorial-digest',
        title: 'Still Afloat AI Editorial Digest',
        category: 'Editorial Intelligence',
        impactScore: 100,
        sources: ['Still Afloat AI Agent'],
        summary: digestHtml
      }
    ]);

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