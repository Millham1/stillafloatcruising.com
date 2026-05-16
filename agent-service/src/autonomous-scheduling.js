function nextScanWindow(urgency = 'normal') {
  const now = Date.now();

  const offsets = {
    critical: 15 * 60 * 1000,
    high: 60 * 60 * 1000,
    normal: 6 * 60 * 60 * 1000,
    low: 12 * 60 * 60 * 1000
  };

  return new Date(now + (offsets[urgency] || offsets.normal)).toISOString();
}

function determineEditorialMode(alerts = []) {
  if (alerts.some(alert => alert.urgency === 'critical')) {
    return 'breaking-travel-operations';
  }

  if (alerts.some(alert => alert.urgency === 'high')) {
    return 'elevated-travel-watch';
  }

  return 'standard-editorial-cycle';
}

function buildSchedulingMetadata({ alerts = [], approvedStories = [] }) {
  const criticalCount = alerts.filter(alert => alert.urgency === 'critical').length;
  const highCount = alerts.filter(alert => alert.urgency === 'high').length;

  let urgency = 'normal';

  if (criticalCount > 0) {
    urgency = 'critical';
  } else if (highCount >= 3) {
    urgency = 'high';
  }

  return {
    generatedAt: new Date().toISOString(),
    editorialMode: determineEditorialMode(alerts),
    nextRecommendedScan: nextScanWindow(urgency),
    urgency,
    operationalAlertCount: alerts.length,
    approvedStoryCount: approvedStories.length,
    recommendations: {
      triggerHomepageRefresh: alerts.some(alert => alert.urgency === 'critical'),
      sendEmergencyDigest: criticalCount > 0,
      increaseMonitoringFrequency: highCount > 2
    }
  };
}

module.exports = {
  buildSchedulingMetadata,
  determineEditorialMode
};
