const fixtures = require('../agent-service/tests/demo-fixtures');
const { preprocessStories } = require('../agent-service/src/preprocess-stories');
const { clusterStories, flattenRepresentativeStories } = require('../agent-service/src/semantic-clustering');
const { buildOperationalAlerts } = require('../agent-service/src/alert-prioritization');
const { buildSchedulingMetadata } = require('../agent-service/src/autonomous-scheduling');
const { buildContentOpportunities } = require('../agent-service/src/content-opportunities');
const { buildEditorialAnalytics } = require('../agent-service/src/editorial-analytics');

module.exports = async function handler(req, res) {
  try {
    const processed = preprocessStories(fixtures);

    const clusters = clusterStories(processed);
    const representativeStories = flattenRepresentativeStories(clusters);

    const approvedStories = representativeStories.filter(story => {
      const text = `${story.title} ${story.summary}`.toLowerCase();

      return !(
        text.includes('celebrity spotted') ||
        text.includes('baggage dispute')
      );
    });

    const rejectedStories = representativeStories.filter(story => !approvedStories.includes(story));

    const homepageTop5 = approvedStories.slice(0, 5);
    const alerts = buildOperationalAlerts(approvedStories);

    const scheduling = buildSchedulingMetadata({
      alerts,
      approvedStories
    });

    const opportunities = buildContentOpportunities({
      approvedStories,
      candidateStories: representativeStories
    });

    const analytics = buildEditorialAnalytics({
      approvedStories,
      rejectedStories,
      groupedDevelopments: clusters
    });

    return res.status(200).json({
      success: true,
      mode: 'editorial-agent-demo',
      originalStoryCount: fixtures.length,
      clusteredStoryCount: representativeStories.length,
      groupedDevelopments: clusters.map(cluster => ({
        representative: cluster.representative.title,
        duplicateCount: cluster.duplicateCount,
        sources: cluster.sources
      })),
      approvedStories: approvedStories.map(story => ({
        title: story.title,
        clusterId: story.clusterId,
        duplicateCount: story.duplicateCount,
        sources: story.clusteredSources,
        travelerImpact: story.travelerImpact || null
      })),
      rejectedStories: rejectedStories.map(story => ({
        title: story.title,
        reason: 'Rejected as irrelevant or low editorial value'
      })),
      homepageTop5: homepageTop5.map(story => story.title),
      operationalAlerts: alerts,
      scheduling,
      youtubeTopics: opportunities.youtubeTopics,
      analytics
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};