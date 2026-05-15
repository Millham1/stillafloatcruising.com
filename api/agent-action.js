const {
  DATA_PATHS,
  fetchRepoJson,
  writeRepoJson,
  authorize,
  archiveOldApproved
} = require('./_news-agent-utils');

module.exports = async function handler(req, res) {
  try {
    if (!authorize(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const action = String(req.query.action || '').toLowerCase();
    const storyId = String(req.query.id || '');

    if (!action || !storyId) {
      return res.status(400).json({ success: false, error: 'Missing action or id' });
    }

    const candidates = await fetchRepoJson(DATA_PATHS.candidates);
    const approved = await fetchRepoJson(DATA_PATHS.approved);
    const archive = await fetchRepoJson(DATA_PATHS.archive);

    const story = (candidates.json.stories || []).find(item => item.id === storyId);

    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    if (action === 'approve' || action === 'pin') {
      const approvedStory = {
        ...story,
        approved: true,
        pinned: action === 'pin',
        featured: true,
        approvedAt: new Date().toISOString(),
        status: 'published'
      };

      approved.json.stories = [
        approvedStory,
        ...(approved.json.stories || []).filter(item => item.id !== storyId)
      ];

      const archived = archiveOldApproved(approved.json, archive.json);

      await writeRepoJson(
        DATA_PATHS.approved,
        archived.approved,
        `Publish approved story ${storyId}`
      );

      await writeRepoJson(
        DATA_PATHS.archive,
        archived.archive,
        `Archive overflow stories after publishing ${storyId}`
      );
    }

    if (action === 'reject') {
      archive.json.stories = [
        {
          ...story,
          rejectedAt: new Date().toISOString(),
          status: 'rejected'
        },
        ...(archive.json.stories || [])
      ];

      await writeRepoJson(
        DATA_PATHS.archive,
        archive.json,
        `Archive rejected story ${storyId}`
      );
    }

    if (action === 'defer') {
      candidates.json.stories = (candidates.json.stories || []).map(item => {
        if (item.id !== storyId) return item;

        return {
          ...item,
          deferredAt: new Date().toISOString(),
          status: 'deferred'
        };
      });

      await writeRepoJson(
        DATA_PATHS.candidates,
        candidates.json,
        `Defer candidate story ${storyId}`
      );
    }

    return res.status(200).json({
      success: true,
      action,
      storyId
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
