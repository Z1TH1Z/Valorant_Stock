# Phase Three --- UI/UX Design Document

# VCT Performance Tracker & Prediction Platform

------------------------------------------------------------------------

# TL;DR

This document defines the UI/UX architecture for the VCT Performance
Tracker. The design bridges esports analytics with financial data
visualization ("Bloomberg Terminal for Valorant"). It prioritizes a
dark-mode-first, data-dense but highly scannable interface built for
Next.js and Tailwind, ensuring graph loads under 1 second.

------------------------------------------------------------------------

# 1. Core UI/UX Philosophy

## Esports Financial Aesthetic

Combine the high-contrast, aggressive styling of Valorant with the
precision and data-density of a stock market tracker.

## Performance-First

Data rendering (especially Recharts/Chart.js graphs) must not block the
main thread. Optimistic UI must be used for all prediction submissions
to mask backend latency (\<200ms target).

## Mobile-Responsive Data

Complex tables and stock graphs must gracefully degrade on mobile via: -
Horizontal scrolling tables - Simplified aggregate views - Reduced graph
complexity

------------------------------------------------------------------------

# 2. Information Architecture (Sitemap)

  ----------------------------------------------------------------------------------
  Path                  Primary Purpose                Key Components
  --------------------- ------------------------------ -----------------------------
  /dashboard            Overview                       Global Top 5 Stock Graph,
                                                       Live/Upcoming Matches ticker,
                                                       Quick Predictions

  /regions/\[region\]   Regional Hub                   Region-specific stock graph,
                                                       regional team leaderboard,
                                                       match schedule

  /teams/\[teamId\]     Deep Dive                      Team stock history, roster
                                                       list with Player Scores,
                                                       match margin multipliers

  /predictions          User Action Center             Active predictions, past
                                                       prediction results, accuracy
                                                       metrics

  /leaderboards         Social / Gamification          Global, Regional, Weekly,
                                                       Monthly user rankings
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Core Interface Specifications

------------------------------------------------------------------------

## 3.1 The Stock Market Graph Interface (Centerpiece)

### Visuals

-   Multi-line chart
-   X-axis: Weeks
-   Y-axis: Performance Score

### Interactions

**Hover Tooltips** - Exact Performance Score - Week date - Match impact
event

**Toggles** - Legend acts as toggle to isolate teams - Enables
comparison (e.g., Sentinels vs Fnatic)

**Zoom / Pan** - Required for full season analysis

### UX Performance Rule

Graph loading flow:

1.  Skeleton state loads instantly
2.  Cached Redis data loads next
3.  Graph hydrates smoothly

------------------------------------------------------------------------

## 3.2 Team & Player Profiles

### Team View

Displays:

-   TeamBaseScore
-   Performance trend graph
-   Match history

### Match Heatmap Color Coding

  Match Result   Color
  -------------- -------------------
  13--0 win      Bright green glow
  13--5 win      Green
  13--11 win     Light green
  11--13 loss    Light red
  5--13 loss     Dark red

------------------------------------------------------------------------

### Player View

Spider / Radar chart showing:

-   Rating
-   ACS
-   KD Ratio
-   ADR
-   KAST
-   FK/FD
-   Headshot %

Purpose:

Instant visual performance comparison

------------------------------------------------------------------------

## 3.3 Prediction Flow Interface

### Entry Points

Accessible from:

-   Match schedule
-   Team page
-   Dashboard

------------------------------------------------------------------------

### Prediction UI Components

#### Winner Selection

Two large team cards

    [ FNATIC ]     vs     [ PRX ]

------------------------------------------------------------------------

#### Map Score Range

Dual-thumb slider

Example:

    13–5 to 13–10

------------------------------------------------------------------------

#### Series Score Toggle

Quick select buttons:

    2–0   2–1   3–0   3–1   3–2

------------------------------------------------------------------------

### Feedback

On success:

-   Toast notification
-   Nav bar prediction count updates instantly

------------------------------------------------------------------------

# 4. Design System & Theming

Built for:

-   Next.js
-   TailwindCSS

------------------------------------------------------------------------

## 4.1 Color Palette

  Token          Hex       Usage
  -------------- --------- ----------------------
  bg-primary     #0F1923   Main background
  bg-secondary   #ECE8E1   Light contrast panel
  accent-brand   #FF4655   Primary buttons
  chart-bull     #00FF9D   Positive trend
  chart-bear     #FF4655   Negative trend

------------------------------------------------------------------------

## 4.2 Typography

### Headings

Font:

Tungsten (or condensed alternative)

Purpose:

Broadcast-style esports feel

------------------------------------------------------------------------

### Body / Data

Font:

Inter or Roboto Mono

Purpose:

Precise numerical alignment

------------------------------------------------------------------------

# 5. Prediction Scoring UX Transparency

After match resolution, show scoring receipt:

Example:

    Your Prediction Score Breakdown

    Range Points: 80 / 100
    Winner Bonus: +50
    Exact Match Bonus: 0

    Total Score: 130

------------------------------------------------------------------------

## Scoring Rules

  Rule                           Points
  ------------------------------ ---------
  Range accuracy                 Max 100
  Winner correct                 +50
  Exact score                    +100
  Penalty per round difference   -10

------------------------------------------------------------------------

# 6. Accessibility & Error Handling

------------------------------------------------------------------------

## Loading States

Use skeleton loaders for:

-   Graph
-   Leaderboards
-   Team pages

Avoid full page spinners.

------------------------------------------------------------------------

## Error States

If external API fails:

Show badge:

    ⚠ Stale Data
    Last updated: timestamp

Do NOT break UI.

------------------------------------------------------------------------

## Accessibility (A11y)

Requirements:

-   WCAG compliant contrast ratios
-   Screen reader aria-labels on graphs
-   Keyboard navigation support

Example aria-label:

    "Fnatic performance increased 12 points between Week 3 and Week 4"

------------------------------------------------------------------------

# Final UX Outcome

Users experience:

-   Financial-grade esports analytics
-   Fast graph rendering
-   Transparent prediction scoring
-   High-performance, scalable UI

The interface feels like a professional esports trading terminal.
