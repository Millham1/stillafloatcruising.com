const {
  DATA_PATHS,
  fetchRepoJson,
  writeRepoJson,
  authorize,
  archiveOldApproved
} = require('./_news-agent-utils');

const { buildPublishingBundle } = require('../agent-service/src/publishing-output');

function normalizeAction(value = '') {
  return String(value).toLowerCase().trim();
}

module.exports = async function handler(req, res) {
  try {
    if (!authorize(req)) {
      return res.status(401).send('Unauthorized');
    }

    const action = normalizeAction(req.query.action || '');
    const id = String(req.query.id || '').trim();

    if (!action || !id) {
      return res.status(400).send('Missing action or story id');
    }

    const candidates = await fetchRepoJson(DATA_PATHS.candidates);
    const approved = await fetchRepoJson(DATA_PATHS.approved);
    const archive = await fetchRepoJson(DATA_PATHS.archive);

    const stories = candidates.json?.stories || [];
    const story = stories.find(item => item.id === id);

    if (!story) {
      return res.status(404).send('Story not found');
    }

    if (action === 'reject') {
      const updatedCandidates = {
        ...candidates.json,
        stories: stories.filter(item => item.id !== id),
        rejectedStories: [
          ...(candidates.json.rejectedStories || []),
          {
            ...story,
            rejectedAt: new Date().toISOString(),
            rejectionReason: 'Manual editorial rejection'
          }
        ]
      };

      await writeRepoJson(
        DATA_PATHS.candidates,
        updatedCandidates,
        `Reject editorial candidate ${story.title}`
      );

      return res.status(200).send('Story rejected successfully');
    }

    const approvedStory = {
      ...story,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      featured: action === 'pin' ? true : Boolean(story.featured)
    };

    const existingApproved = approved.json?.stories || [];

    const updatedApproved = {
      ...approved.json,
      stories: [
        approvedStory,
        ...existingApproved.filter(item => item.id !== id)
      ]
    };

    const updatedCandidates = {
      ...candidates.json,
      stories: stories.filter(item => item.id !== id)
    };

    const archived = archiveOldApproved(updatedApproved, archive.json || { stories: [] });

    await writeRepoJson(
      DATA_PATHS.approved,
      archived.approved,
      `Approve editorial story ${story.title}`
    );

    await writeRepoJson(
      DATA_PATHS.archive,
      archived.archive,
      `Archive editorial rollover after ${story.title}`
    );

    await writeRepoJson(
      DATA_PATHS.candidates,
      updatedCandidates,
      `Remove approved editorial candidate ${story.title}`
    );

    const publishing = buildPublishingBundle({
      approvedStories: archived.approved.stories || [],
      homepageTop5: candidates.json?.homepageTop5 || []
    });

    await writeRepoJson(
      'data/news/homepage-feed.json',
      publishing.homepage,
      `Update homepage publishing feed after ${story.title}`
    );

    await writeRepoJson(
      'data/news/news-index.json',
      publishing.newsIndex,
      `Update news index after ${story.title}`
    );

    await writeRepoJson(
      'data/news/story-details.json',
      publishing.storyDetails,
      `Update story detail output after ${story.title}`
    );

    return res.status(200).send(`Story ${action} completed successfully`);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
};