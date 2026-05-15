# Still Afloat AI News Agent

## Purpose
The Still Afloat AI News Agent is designed to:
- monitor cruise and travel news
- identify operationally relevant stories
- deduplicate overlapping coverage
- synthesize CliffNotes-style summaries
- request human approval before publishing
- automatically populate homepage/news/story pages after approval
- maintain a rolling operational archive

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

# Story Limits
## Homepage
Maximum visible stories:
5

## news.html
Maximum active visible stories:
20

The website should remain:
- clean
- curated
- high-signal

The site is NOT intended to become an infinite news feed.

---

# Digest Workflow
The system sends:
- ONE digest email
- every 48 hours
- to stillafloatcruising@gmail.com

The digest contains:
- top 20 candidate operational events
- already deduplicated
- already clustered
- ranked by traveler impact

The system should NOT send one email per story.

---

# News Source Hierarchy

## Tier 1 — Operational Impact Sources
Highest weighting.

Examples:
- NOAA
- National Hurricane Center
- FAA
- airport advisories
- weather API feeds
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

# Approval Actions
Each digest story supports:
- Approve
- Reject
- Defer
- Merge
- Pin

## Approve
Publish story.

## Reject
Suppress similar stories temporarily.

## Defer
Continue monitoring without publishing.

## Merge
Merge into existing operational event.

## Pin
Force homepage visibility.

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

# Weather Correlation
Weather is treated as:
- operational intelligence
- not supplemental data

The system should correlate:
- weather API data
- operational alerts
- cruise reporting
- mainstream reporting

Example:
- storm alerts
- itinerary changes
- airport disruptions

should become ONE curated operational event.

---

# Publishing Workflow

## Step 1 — Source Scan
Every 48 hours:
- fetch source feeds
- fetch RSS
- gather weather intelligence
- gather operational alerts
- gather candidate stories

---

## Step 2 — AI Processing
The agent:
- removes duplicates
- categorizes stories
- scores traveler relevance
- generates summaries
- ranks stories
- clusters overlapping reports

---

## Step 3 — Editorial Digest
One digest email is sent to:
stillafloatcruising@gmail.com

Containing:
- top 20 candidate stories
- grouped by category
- ranked by impact

---

## Step 4 — Approval Action
Approve button:
- updates approved stories datastore
- rebuilds news feed
- refreshes homepage stories

Reject button:
- archives/discards candidate story
- suppresses regeneration temporarily

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

# Archive System
The system maintains:
- hidden archive datastore
- not publicly visible on website

Archive retention:
180 days

Purpose:
- duplicate prevention
- trend analysis
- event continuity
- operational memory

Archived stories preserve:
- headline
- links
- timestamps
- categories
- summaries
- source lists
- cluster metadata

Archive should be append-only.

---

# Data Architecture
## Candidate Stories
/data/news/candidate-stories.json

## Approved Stories
/data/news/approved-stories.json

## Archive
/data/news/archive-stories.json

---

# Frontend Integration
## Homepage
Display:
- top 5 approved stories
- ranked by impact + freshness

## news.html
Display:
- maximum 20 active stories
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
