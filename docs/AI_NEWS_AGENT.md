# Still Afloat AI News Agent

## Purpose
The Still Afloat AI News Agent is designed to:
- monitor cruise and travel news
- identify operationally relevant stories
- deduplicate overlapping coverage
- synthesize CliffNotes-style summaries
- request human approval before publishing
- automatically populate homepage/news/story pages after approval

The system is NOT autonomous publishing.

The human approval layer is mandatory.

---

# Editorial Philosophy
The system curates:
- events
- impacts
- operational intelligence

NOT article volume.

The feed should feel:
- curated
- intelligent
- traveler-focused
- operationally useful

Avoid:
- RSS spam
- duplicate stories
- clickbait
- source bias
- repetitive weather reposts

---

# News Source Hierarchy

## Tier 1 — Operational Impact Sources
Highest weighting.

Examples:
- NOAA
- National Hurricane Center
- FAA
- airport advisories
- port authority notices
- cruise line operational alerts

Priority examples:
- itinerary changes
- severe weather
- port closures
- airport disruptions
- strikes
- travel advisories

---

## Tier 2 — Cruise Industry Sources
Examples:
- Cruise Hive
- Cruise Critic
- Cruise Industry News
- Royal Caribbean newsroom
- Norwegian Cruise Line newsroom
- Carnival newsroom
- MSC newsroom

---

## Tier 3 — Mainstream News Sources
Examples:
- Fox News
- CNN
- Fox Weather
- Reuters
- AP
- NBC News
- ABC News
- CBS News
- Weather Channel

Purpose:
- identify large-scale travel impacts
- supplement operational context
- validate significance

---

## Tier 4 — Lifestyle / Commentary
Lowest weighting.

Examples:
- blogs
- influencers
- commentary sites

These should not dominate the feed.

---

# Deduplication Rules
The feed is event-based, NOT article-based.

If multiple sources report the same event:
- ONE story entry is created
- source citations are aggregated
- one canonical summary is generated

## Duplicate Types
### Hard Duplicates
Same syndicated article reposted.

### Soft Duplicates
Different outlets discussing the same event.

Soft duplicates require:
- semantic clustering
- entity matching
- AI synthesis

---

# Story Clustering
Stories are grouped by:
- cruise line
- ship
- ports
- airport
- event type
- location
- timing
- semantic similarity

Similarity threshold target:
85–90%

If exceeded:
- merge into existing cluster
- update sources
- refresh summary if needed

Do NOT create duplicate stories.

---

# Publishing Workflow

## Step 1 — Source Scan
Every 48 hours:
- fetch source feeds
- fetch RSS
- fetch APIs
- gather candidate stories

---

## Step 2 — AI Processing
The agent:
- removes duplicates
- categorizes stories
- scores traveler relevance
- generates summaries
- ranks stories

---

## Step 3 — Approval Email
An approval email is sent to Mark.

Each story includes:
- title
- category
- source list
- generated summary
- traveler impact score
- approve button
- reject button

---

## Step 4 — Approval Action
Approve button:
- updates approved stories datastore
- rebuilds news feed
- refreshes homepage stories

Reject button:
- archives/discards candidate story

---

## Step 5 — Publishing
Approved stories appear on:
- news.html
- homepage feed
- story.html

Homepage should display:
- top 5 unique stories
- highest operational relevance
- highest traveler impact

---

# Summary Requirements
Summaries should:
- synthesize multiple sources
- explain implications
- focus on traveler impact
- avoid generic rewrites

Do NOT:
- copy article intros
- use bullet summaries
- paraphrase first sentences only

Preferred format:
- 1–2 concise explanatory paragraphs
- operationally useful
- conversational but professional

---

# Data Architecture
Approved stories are stored in:
/data/news/approved-stories.json

Structure:
{
  "id": "story-id",
  "title": "",
  "category": "",
  "tier": "impact",
  "summary": "",
  "sources": [],
  "featured": true,
  "publishedAt": ""
}

---

# Frontend Integration
## Homepage
Display:
- top 5 approved stories
- ranked by impact + freshness

## news.html
Display:
- full approved feed
- no duplicates
- categorized stories

## story.html
Display:
- full CliffNotes summary
- source attribution
- external article links

---

# Human Oversight
The AI agent assists editorial workflow.

The human operator retains final publishing authority.

Trust and accuracy are more important than speed.
