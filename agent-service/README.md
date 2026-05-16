# Still Afloat Editorial Agent

This service is the standalone AI editorial intelligence platform for Still Afloat.

It is intentionally separate from the website presentation layer.

## Purpose

The agent owns:

- news ingestion
- cruise/travel editorial reasoning
- semantic clustering
- duplicate collapse
- approval email generation
- approve/reject/pin actions
- GitHub or content-store persistence
- homepage feed generation
- news index generation
- story detail generation
- operational alerts
- YouTube/vlog topic suggestions
- social post suggestions
- editorial analytics
- scheduling intelligence

The website owns:

- homepage rendering
- news page rendering
- story page rendering
- brand/UI presentation

## Service Boundaries

The website should consume outputs from this service, not contain the editorial intelligence itself.

Primary outputs:

- `/data/news/candidate-stories.json`
- `/data/news/approved-stories.json`
- `/data/news/archive-stories.json`
- `/data/news/homepage-feed.json`
- `/data/news/news-index.json`
- `/data/news/story-details.json`

## Required Environment Variables

```text
OPENAI_API_KEY
RESEND_API_KEY
GITHUB_TOKEN
AGENT_APPROVAL_TOKEN
APPROVAL_EMAIL
SITE_URL
GITHUB_REPOSITORY
AGENT_BRANCH
GNEWS_API_KEY
newsapi
weatherpage
pexels
```

## Key Runtime Endpoints

When extracted to its own Vercel project, the service should expose:

```text
/api/scan-news
/api/agent-action
/api/demo-agent
/api/health
```

## Demonstration Criteria

A successful demo is NOT merely returning JSON.

A successful Still Afloat demo means:

1. The agent scans stories.
2. The AI curates and rejects irrelevant stories.
3. A Still Afloat approval email is delivered.
4. Approve/reject/pin links work.
5. Approved stories persist.
6. Homepage feed updates.
7. News index updates.
8. Story detail JSON updates.
9. Clicking a story loads the synopsis.
10. The original source link opens the correct source article.

## Extraction Plan

1. Create a new GitHub repo named `stillafloat-agent`.
2. Move this `agent-service/` folder to the root of that repo.
3. Move the current agent API routes into `/api` in that repo.
4. Create a separate Vercel project for `stillafloat-agent`.
5. Configure the same environment variables in the new Vercel project.
6. Update `stillafloatcruising.com` to consume published JSON/API outputs from the agent service.

## Architectural Rule

The website is not the brain.

The agent is the brain.

The website is the presentation layer.
