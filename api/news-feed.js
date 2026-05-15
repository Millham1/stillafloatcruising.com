module.exports = async function handler(req, res) {
  try {
    const stories = require('../data/news/approved-stories.json');

    const approved = Array.isArray(stories.stories)
      ? stories.stories
      : [];

    const sorted = approved
      .filter(story => story.approved !== false)
      .sort((a, b) => {
        const aDate = new Date(a.publishedAt || 0).getTime();
        const bDate = new Date(b.publishedAt || 0).getTime();
        return bDate - aDate;
      });

    const homepage = sorted
      .filter(story => story.featured)
      .slice(0, 5);

    res.status(200).json({
      generatedAt: stories.generatedAt || null,
      homepage,
      stories: sorted
    });
  } catch (error) {
    console.error('News API failed', error);

    res.status(500).json({
      error: 'Unable to load news feed'
    });
  }
};
