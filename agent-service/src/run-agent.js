const directive = require('./editorial-directive');
const { preprocessStories } = require('./preprocess-stories');
const { enrichStoriesWithArticles } = require('./article-extractor');
const { buildEditorialMemory, buildReinforcementPrompt } = require('./editorial-memory');

async function runEditorialAgent({ stories = [], openai, editorialMemory = {} }) {
  if (!openai) {
    throw new Error('OpenAI client not configured');
  }

  const processedStories = preprocessStories(stories);
  const enrichedStories = await enrichStoriesWithArticles(processedStories);

  const memory = buildEditorialMemory(editorialMemory);
  const reinforcement = buildReinforcementPrompt(memory);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${openai}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1',
      temperature: 0.15,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: directive
        },
        {
          role: 'user',
          content: JSON.stringify({
            timestamp: new Date().toISOString(),
            candidateStoryCount: enrichedStories.length,
            stories: enrichedStories,
            editorialInstructions: {
              prioritizeCruiseImpact: true,
              prioritizeTravelerRelevance: true,
              avoidWeatherSpam: true,
              avoidDuplicateOperationalStories: true,
              rejectWeakAirportStories: true,
              homepageLimit: 5,
              digestLimit: 20
            },
            reinforcement
          })
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Editorial agent failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Editorial agent returned empty content');
  }

  return JSON.parse(content);
}

module.exports = {
  runEditorialAgent
};