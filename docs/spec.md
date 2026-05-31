# Clever Campaign Studio — Electron App + clever-slides-backend Specification

## 1. Product Vision

### Product Name

Working name:

**Clever Campaign Studio**

Alternative names:

* Clever Media Studio
* Clever Church Campaign Studio
* Clever Designer
* Clever Church Publisher

### One-sentence vision

Clever Campaign Studio is a desktop AI media assistant that turns sermons, church events, campaigns, devotionals, announcements, and ministry messages into ready-to-review presentation decks, social invitation packs, captions, thumbnails, and export packages.

### Core product idea

The user provides a text document.

The system acts like an automatic graphic designer and media director:

1. Understands the document.
2. Detects the campaign type.
3. Extracts the core message, audience, CTA, and event details.
4. Plans the media package.
5. Creates slides.
6. Creates social assets.
7. Creates captions.
8. Creates thumbnails.
9. Lets the user review and approve.
10. Exports everything.
11. Later, publishes/schedules everything to social channels.

### Final workflow vision

```text
Input document
→ AI understands campaign
→ AI proposes media package
→ AI generates slides + social pack + captions
→ Human reviews/approves
→ System exports
→ Later: system publishes/schedules
```

### The main mental model

This is not just a slide generator.

It is:

```text
AI Graphic Designer
+ AI Media Director
+ AI Social Campaign Assistant
+ Future Publishing Assistant
```

---

# 2. Strategic Architecture

## 2.1 Existing architecture

Current sermon app flow:

```text
clever-sermon-frontend
→ clever-sermon-backend
→ clever-slides-backend
→ slides/social/media/export
```

## 2.2 New architecture

The Electron app should reuse `clever-slides-backend` directly.

```text
Electron App
→ clever-slides-backend
→ generated media package
```

Do **not** require `clever-sermon-backend`.

## 2.3 Responsibility split

### clever-sermon-backend

Purpose:

```text
Sermon study / sermon workspace / theological research / manuscript flow
```

Responsibilities:

* Scripture lookup
* Study reports
* Sermon outlines
* Manuscript
* Socratic review
* Canonical themes
* Historical context
* Integrity/citation review
* Sermon workspace state

### clever-slides-backend

Purpose:

```text
Reusable media generation engine
```

Responsibilities:

* Campaign/document analysis
* Campaign media planning
* Slide deck generation
* Social pack generation
* Captions
* Thumbnails
* Image generation prompts
* Image provider orchestration
* Rendering
* PPTX/PDF/PNG/JPG export
* ZIP package creation
* Future publishing package generation

### Electron app

Purpose:

```text
Desktop operator console
```

Responsibilities:

* Document import/paste
* User settings
* Backend connection settings
* Campaign review/edit
* Asset preview
* Asset approval
* Export/download
* Future publishing approval/scheduling

---

# 3. Core Requirement

## 3.1 Main requirement

Build an Electron desktop app where the user can provide a text document containing:

* Sermon
* Church event
* Campaign brief
* Devotional
* Bible study
* Announcement
* Youth program
* Prayer meeting
* Funeral/memorial program
* Wedding/family event
* Evangelistic meeting
* Custom ministry message

The app should use `clever-slides-backend` to generate:

* Presentation deck
* Social pack
* Captions
* Thumbnails
* Export package

Later, the app will publish/schedule approved assets to social networks and channels.

## 3.2 Non-goals for first release

Do not implement yet:

* Facebook publishing
* Instagram publishing
* YouTube upload
* WhatsApp automation
* Email campaign sending
* Church website publishing
* Full scheduling system
* Multi-user collaboration
* Cloud accounts
* Payment/subscription system

These should be planned, but not built in the first implementation.

---

# 4. Supported Campaign Types

`clever-slides-backend` must become campaign-aware.

## 4.1 Campaign types

```ts
type CampaignType =
  | "sermon"
  | "church_event"
  | "bible_study"
  | "devotional"
  | "announcement"
  | "youth_program"
  | "prayer_meeting"
  | "evangelistic_meeting"
  | "funeral_memorial"
  | "wedding_family"
  | "community_outreach"
  | "general_campaign"
  | "custom";
```

## 4.2 Campaign goals

```ts
type CampaignGoal =
  | "invite_attendance"
  | "promote_livestream"
  | "share_devotional"
  | "announce_event"
  | "recap_event"
  | "teach_topic"
  | "encourage_response"
  | "custom";
```

## 4.3 Output intents

```ts
type OutputIntent =
  | "presentation_deck"
  | "social_pack"
  | "caption_pack"
  | "thumbnail"
  | "story_pack"
  | "whatsapp_forward"
  | "event_poster"
  | "export_package"
  | "publishing_package";
```

---

# 5. Electron App Specification

## 5.1 Recommended stack

Use:

```text
Electron
React
TypeScript
Vite
Tailwind CSS
Zustand or Redux Toolkit
TanStack Query
```

Recommended package style:

```text
electron-vite
or
Vite + Electron Builder
```

## 5.2 App modes

The Electron app should support backend configuration modes.

```ts
type BackendMode = "hosted" | "local" | "custom";
```

### Hosted mode

Electron calls a hosted `clever-slides-backend`.

Pros:

* Easier updates.
* Backend handles image generation and exports.
* Easier future publishing.
* Less packaging pain.

### Local mode

Electron calls local `clever-slides-backend` running on localhost.

Pros:

* More private.
* Good for development.
* Good for internal use.

### Custom URL mode

User provides:

```text
http://localhost:4002
https://my-slides-backend.example.com
```

## 5.3 App settings

Settings screen should include:

```ts
interface AppSettings {
  backendMode: "hosted" | "local" | "custom";
  backendBaseUrl: string;
  defaultLanguage: "en" | "es";
  defaultCampaignGoal: CampaignGoal;
  defaultOutputPack: OutputIntent[];
  imageProvider: "auto" | "openai" | "fal" | "mock";
  brandProfileId?: string;
  exportFolder?: string;
}
```

## 5.4 Screens

### Screen 1: Welcome / Start

Purpose:

Let the user begin with a document.

Primary actions:

```text
Paste text
Import document
Open recent campaign
```

Supported first-release inputs:

```text
Plain text
Markdown
DOCX
```

Later:

```text
PDF
HTML
Google Docs
Word Online
Notion
URL import
```

### Screen 2: Document Import

User can:

* Paste text.
* Upload `.txt`.
* Upload `.md`.
* Upload `.docx`.
* Name the project.
* Choose language.
* Optionally choose campaign type, or leave as Auto.

UI copy:

```text
Drop your sermon, event, campaign, or announcement here.
We will analyze it and suggest slides, social posts, captions, and export assets.
```

### Screen 3: Campaign Analysis

After import, app calls:

```text
POST /api/v1/campaigns/analyze-document
```

The UI displays detected information:

```text
Detected type: Sermon
Title: ...
Main message: ...
Audience: ...
Passage/topic: ...
Event details found: ...
Recommended outputs: ...
Confidence: ...
Warnings: ...
```

User can correct:

* Campaign type
* Title
* Main topic
* Audience
* CTA
* Date/time
* Location
* Service/livestream details
* Output types

### Screen 4: Campaign Details Editor

Editable form:

```text
Campaign type
Campaign goal
Title
Subtitle
Passage/topic
Audience
Tone
Language
CTA
Event date
Event time
Timezone
Location name
Address
Website
Phone
Livestream URL
Speaker/presenter
Church/organization
Short brand name
Branding mode
```

### Screen 5: Output Selection

User selects what to generate:

```text
Presentation deck
Social invitation pack
Social devotional pack
YouTube thumbnail
WhatsApp forward image
Caption package
Export ZIP
```

For slides:

```text
Deck type:
- Presentation deck
- Teaching deck
- Announcement deck
- Event deck
- Short promo deck

Slide count:
- Auto
- 6
- 10
- 12
- 15
- Custom
```

For social:

```text
Campaign type:
- Invitation Campaign
- Devotional Pack
- Announcement Pack
- Recap Pack

Platforms:
- Instagram
- Facebook
- WhatsApp
- YouTube
- X
```

### Screen 6: Style Selection

User selects:

```text
Auto
Reverent Worship
Warm Pastoral
Evangelistic Invitation
Hopeful Prophecy
Bible Study Clean
Youth Modern
Spanish Church Warm
Modern Church
Minimal Clean
```

Style affects:

* Copy tone
* Layout family
* Typography
* Image motifs
* Color palette
* CTA style
* Export look

### Screen 7: Generation Progress

Shows job progress:

```text
Analyzing campaign
Planning deck
Writing slide copy
Composing layouts
Generating images
Rendering slides
Creating social assets
Writing captions
Exporting files
Packaging ZIP
```

Progress should be job-based, not fake.

### Screen 8: Review Dashboard

Main review tabs:

```text
Overview
Slides
Social Pack
Captions
Exports
Warnings
```

Each asset has status:

```ts
type AssetReviewStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "rejected"
  | "regenerating"
  | "exported";
```

User actions:

```text
Approve
Edit text
Regenerate copy
Regenerate image
Change layout
Use fallback background
Download asset
```

### Screen 9: Slide Preview

Features:

* Slide thumbnails.
* Full slide preview.
* Speaker notes.
* Layout name.
* Warnings.
* Export status.

Actions:

```text
Edit title
Edit subtitle
Edit body
Edit speaker notes
Change layout
Regenerate slide
Regenerate image
Approve slide
```

### Screen 10: Social Pack Preview

Cards grouped by platform:

```text
Instagram
Facebook
WhatsApp
YouTube
X
```

Each asset shows:

* Platform
* Format
* Role
* Preview
* Caption
* Quality score
* Warnings

Actions:

```text
Edit headline
Edit CTA
Edit caption
Change brand mode
Regenerate copy
Regenerate image
Change layout
Approve asset
Download
Copy caption
```

### Screen 11: Export Center

Export options:

```text
PPTX
PDF
Slides as PNG
Slides as JPG
Social assets as PNG/JPG
Captions as TXT
Captions as JSON
Full ZIP package
```

Export package structure:

```text
campaign-name/
  slides/
    deck.pptx
    deck.pdf
    png/
    jpg/
  social/
    instagram/
    facebook/
    whatsapp/
    youtube/
    x/
  captions/
    captions.json
    captions.txt
  metadata/
    campaign.json
    asset-manifest.json
    warnings.json
```

### Screen 12: Future Publishing Center

Not for first release, but UI should be planned.

Future publishing states:

```text
Not connected
Connected
Needs approval
Scheduled
Published
Failed
```

Future channels:

* Facebook Page
* Instagram Business
* YouTube
* WhatsApp Business
* X
* Church website
* Email/newsletter

---

# 6. Electron App Data Model

## 6.1 Local project model

Electron can store local project metadata.

```ts
interface LocalCampaignProject {
  id: string;
  name: string;
  backendCampaignId?: string;
  sourceDocument: SourceDocument;
  campaignSummary?: CampaignAnalysisResult;
  createdAt: string;
  updatedAt: string;
  localStatus: "draft" | "generated" | "reviewing" | "approved" | "exported";
}
```

## 6.2 Source document

```ts
interface SourceDocument {
  id: string;
  fileName?: string;
  mimeType?: string;
  sourceType: "paste" | "txt" | "markdown" | "docx" | "pdf";
  rawText: string;
  extractedText?: string;
  metadata?: Record<string, unknown>;
}
```

## 6.3 Campaign details

```ts
interface CampaignDetails {
  campaignType: CampaignType;
  campaignGoal: CampaignGoal;
  title: string;
  subtitle?: string;
  passageOrTopic?: string;
  audience?: string;
  language: "en" | "es";
  tone?: string;
  cta?: string;
  speaker?: string;
  eventDetails?: EventDetails;
  brandProfile?: BrandProfile;
}
```

## 6.4 Event details

```ts
interface EventDetails {
  date?: string;
  time?: string;
  timezone?: string;
  timezoneLabel?: string;
  locationName?: string;
  address?: string;
  website?: string;
  phone?: string;
  livestreamUrl?: string;
}
```

## 6.5 Brand profile

```ts
interface BrandProfile {
  id: string;
  organizationName: string;
  shortName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  defaultBrandMode:
    | "none"
    | "logo_only"
    | "short_name"
    | "full_name_small"
    | "full_name_prominent";
}
```

---

# 7. clever-slides-backend Required Changes

## 7.1 Current role to new role

Current role:

```text
Slide/social backend used by sermon app
```

New role:

```text
Reusable campaign media generation engine
```

## 7.2 New top-level module

Add module:

```text
CampaignsModule
```

Suggested path:

```text
services/clever-slides-backend/src/modules/campaigns
```

Responsibilities:

* Document analysis
* Campaign creation
* Campaign media pack generation
* Campaign job orchestration
* Campaign asset manifest
* Export package generation

## 7.3 New backend entities

If using a database, add these entities.

### CampaignProject

```ts
interface CampaignProject {
  id: string;
  campaignType: CampaignType;
  campaignGoal: CampaignGoal;
  title: string;
  subtitle?: string;
  sourceText: string;
  language: string;
  status:
    | "draft"
    | "analyzed"
    | "generating"
    | "ready"
    | "needs_review"
    | "exported"
    | "failed";
  analysis?: CampaignAnalysisResult;
  eventDetails?: EventDetails;
  brandProfile?: BrandProfile;
  createdAt: string;
  updatedAt: string;
}
```

### CampaignAsset

```ts
interface CampaignAsset {
  id: string;
  campaignId: string;
  assetType:
    | "presentation_deck"
    | "slide"
    | "social_asset"
    | "thumbnail"
    | "caption"
    | "export_file";
  platform?: "instagram" | "facebook" | "whatsapp" | "youtube" | "x";
  format?: string;
  role?: string;
  status:
    | "planned"
    | "generating"
    | "ready"
    | "failed"
    | "approved"
    | "rejected"
    | "exported";
  previewUrl?: string;
  exportUrl?: string;
  metadata?: Record<string, unknown>;
  warnings?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### CampaignMediaPack

```ts
interface CampaignMediaPack {
  id: string;
  campaignId: string;
  deckId?: string;
  socialPackId?: string;
  captionPackId?: string;
  exportPackId?: string;
  status: "pending" | "generating" | "ready" | "failed";
  qualityScore?: number;
  warnings?: string[];
}
```

---

# 8. New clever-slides-backend APIs

## 8.1 Analyze document

```http
POST /api/v1/campaigns/analyze-document
```

Request:

```json
{
  "sourceType": "plain_text",
  "fileName": "message.txt",
  "content": "...",
  "language": "en",
  "preferredCampaignType": "auto",
  "preferredCampaignGoal": "auto"
}
```

Response:

```json
{
  "status": "ready",
  "detectedType": "sermon",
  "campaignGoal": "invite_attendance",
  "confidence": 0.91,
  "title": "...",
  "subtitle": "...",
  "passageOrTopic": "...",
  "mainMessage": "...",
  "audienceNeed": "...",
  "tone": "...",
  "cta": "...",
  "eventDetails": {
    "date": null,
    "time": null,
    "timezone": null,
    "locationName": null,
    "address": null,
    "website": null,
    "phone": null,
    "livestreamUrl": null
  },
  "recommendedOutputs": ["presentation_deck", "social_pack", "caption_pack"],
  "warnings": []
}
```

## 8.2 Create campaign project

```http
POST /api/v1/campaigns
```

Request:

```json
{
  "campaignType": "sermon",
  "campaignGoal": "invite_attendance",
  "title": "...",
  "subtitle": "...",
  "sourceText": "...",
  "language": "en",
  "passageOrTopic": "...",
  "eventDetails": {},
  "brandProfile": {}
}
```

Response:

```json
{
  "campaignId": "...",
  "status": "draft"
}
```

## 8.3 Generate campaign media pack

```http
POST /api/v1/campaigns/:campaignId/generate-media-pack
```

Request:

```json
{
  "outputs": {
    "presentationDeck": {
      "enabled": true,
      "targetSlideCount": 10,
      "deckType": "presentation"
    },
    "socialPack": {
      "enabled": true,
      "campaignType": "invitation_campaign",
      "platforms": ["instagram", "facebook", "whatsapp", "youtube", "x"]
    },
    "captionPack": {
      "enabled": true
    }
  },
  "visualStyle": "auto",
  "imageProvider": "auto",
  "branding": {
    "brandMode": "short_name",
    "showLogo": true,
    "showAddress": false,
    "showWebsite": false,
    "showPhone": false,
    "showServiceTime": true
  }
}
```

Response:

```json
{
  "jobId": "...",
  "campaignId": "...",
  "status": "queued"
}
```

## 8.4 Get campaign status

```http
GET /api/v1/campaigns/:campaignId
```

Response:

```json
{
  "campaignId": "...",
  "status": "ready",
  "analysis": {},
  "mediaPack": {},
  "assets": [],
  "warnings": []
}
```

## 8.5 Get generation job status

```http
GET /api/v1/jobs/:jobId
```

Response:

```json
{
  "jobId": "...",
  "status": "running",
  "progress": 62,
  "currentStep": "Rendering social assets",
  "steps": [
    {
      "name": "Analyze campaign",
      "status": "complete"
    },
    {
      "name": "Generate slides",
      "status": "running"
    }
  ],
  "warnings": []
}
```

## 8.6 Export campaign package

```http
POST /api/v1/campaigns/:campaignId/export
```

Request:

```json
{
  "formats": ["pptx", "pdf", "png", "jpg", "captions_json", "captions_txt", "zip"],
  "includeSource": true,
  "includeMetadata": true
}
```

Response:

```json
{
  "exportJobId": "...",
  "status": "queued"
}
```

## 8.7 Download export package

```http
GET /api/v1/campaigns/:campaignId/exports/:exportId/download
```

---

# 9. Backend Services to Add

## 9.1 CampaignDocumentAnalyzerService

Purpose:

Analyze imported text.

Input:

```ts
interface AnalyzeDocumentInput {
  sourceText: string;
  sourceType: string;
  language?: string;
  preferredCampaignType?: CampaignType | "auto";
}
```

Output:

```ts
interface CampaignAnalysisResult {
  detectedType: CampaignType;
  campaignGoal: CampaignGoal;
  confidence: number;
  title: string;
  subtitle?: string;
  passageOrTopic?: string;
  mainMessage: string;
  audienceNeed?: string;
  tone?: string;
  cta?: string;
  eventDetails?: EventDetails;
  recommendedOutputs: OutputIntent[];
  warnings: string[];
}
```

Responsibilities:

* Detect document type.
* Extract title.
* Extract key message.
* Extract event details.
* Extract CTA.
* Extract audience.
* Detect language.
* Recommend output pack.

## 9.2 CampaignStrategyService

Purpose:

Create campaign strategy.

Output:

```ts
interface CampaignStrategy {
  campaignType: CampaignType;
  campaignGoal: CampaignGoal;
  primaryMessage: string;
  audienceNeed?: string;
  invitationAngle?: string;
  visualDirection: string;
  tone: string;
  assetPlan: CampaignAssetPlan[];
}
```

## 9.3 CampaignDeckPlannerService

Purpose:

Generate deck plan from generic campaign.

Supports:

* Sermon presentation
* Event presentation
* Bible study deck
* Announcement deck
* Devotional deck
* Youth program deck
* Memorial/wedding deck

## 9.4 CampaignSocialPackPlannerService

Purpose:

Generate social pack plan.

Must support:

* Invitation campaign
* Devotional pack
* Announcement pack
* Recap pack

## 9.5 CampaignCaptionWriterService

Purpose:

Generate caption package.

Captions should include:

* caption
* shortCaption
* CTA
* hashtags
* altText
* platform-specific variants

## 9.6 CampaignImagePromptService

Purpose:

Generate provider-agnostic image prompts.

Must use:

* Campaign type
* Asset role
* Platform
* Visual style
* Text zone
* Prompt safety rules
* No-text rules

## 9.7 CampaignExportPackageService

Purpose:

Create ZIP export.

Includes:

* Decks
* Social assets
* Captions
* Metadata
* Source document
* Asset manifest
* Warnings

## 9.8 CampaignQualityValidatorService

Purpose:

Validate whole campaign.

Checks:

* Does campaign satisfy goal?
* Are invitation assets actually invitations?
* Are slides readable?
* Are social assets platform-native?
* Are captions human-facing?
* Is metadata leaking?
* Are exports available?

---

# 10. Prompt Architecture Changes in clever-slides-backend

## 10.1 New prompt: document analysis

```text
You are analyzing a ministry/campaign document.

Determine what kind of content this is:
- sermon
- church event
- devotional
- Bible study
- announcement
- youth program
- prayer meeting
- funeral/memorial
- wedding/family event
- evangelistic meeting
- community outreach
- custom

Extract:
- title
- main message
- audience need
- tone
- CTA
- speaker/presenter
- event date/time
- location
- livestream/website/contact
- recommended outputs

Return JSON only.
Do not invent missing event details.
```

## 10.2 New prompt: campaign strategy

```text
You are a church media director.

Create a media campaign strategy from this document.

The campaign may need:
- presentation slides
- social invitation assets
- devotional teaser graphics
- story/status images
- YouTube thumbnail
- WhatsApp forward image
- captions
- export package

Decide asset roles based on campaign type and goal.

Return JSON only.
```

## 10.3 New prompt: slide deck planner

Generic, not sermon-only.

```text
You are a presentation designer for ministry and campaign content.

Create a platform-ready presentation deck plan.

Input includes:
- campaign type
- campaign goal
- title
- main message
- source document summary
- audience
- tone
- event details
- visual style

Create slides with:
- slide purpose
- headline
- subheadline
- body lines
- speaker notes
- layout family
- visual intent
- image intent

Return JSON only.
```

## 10.4 New prompt: social pack strategy

```text
You are a church social media campaign strategist.

Create a platform-native social pack.

If campaign goal is invitation:
At least half the assets must clearly invite attendance or viewing.

If campaign goal is devotional:
Assets should be shareable spiritual content.

Return an asset plan with:
- platform
- format
- asset role
- headline angle
- CTA need
- caption need
- visual direction
- layout family
```

## 10.5 New prompt: social asset copywriter

```text
You are writing copy for a church social media asset.

Write platform-native image text and caption.

Image text must be short.
Caption carries details.
Do not put raw URLs, raw timezone, timestamps, or internal metadata on the image.
Do not repeat the same headline across the pack.
Return JSON only.
```

## 10.6 New prompt: image prompt builder

```text
You are creating an image-generation prompt for a church media asset.

The generated image must not contain text.
All words will be added later by the renderer.

Include:
- visual subject
- composition
- mood
- lighting
- color palette
- clean negative space
- text-safe zone
- avoid list

Do not ask the model to render scripture, church names, dates, or captions.
Return JSON only.
```

---

# 11. Slide Generation Requirements

## 11.1 Generic deck types

```ts
type CampaignDeckType =
  | "sermon_presentation"
  | "teaching_deck"
  | "event_announcement"
  | "campaign_pitch"
  | "devotional_deck"
  | "memorial_deck"
  | "wedding_family_deck"
  | "custom";
```

## 11.2 Layout families

Required layout families:

```text
title_cinematic
scripture_focus
big_idea_statement
point_declaration
story_moment
split_tension
application_steps
reflection_question
appeal_invitation
event_details
closing_blessing
```

For non-sermon events, add:

```text
event_hero
schedule_overview
speaker_intro
location_details
call_to_action
```

## 11.3 Quality requirements

Deck must have:

* Strong title slide.
* Clear message.
* Purpose-based slide layouts.
* Notes if applicable.
* Readable text.
* Image-aware composition.
* Export-ready layout.

---

# 12. Social Pack Requirements

## 12.1 Social pack modes

```ts
type SocialPackMode =
  | "invitation_campaign"
  | "devotional_pack"
  | "announcement_pack"
  | "recap_pack";
```

## 12.2 Invitation campaign required roles

```text
main_invitation
story_invitation
whatsapp_forward
facebook_or_instagram_post
youtube_thumbnail
devotional_teaser
reflection_question
```

## 12.3 Devotional pack required roles

```text
devotional_quote
scripture_reminder
reflection_question
encouragement_card
story_quote
whatsapp_share
```

## 12.4 Platform output formats

```ts
interface SocialPlatformFormat {
  platform: "instagram" | "facebook" | "whatsapp" | "youtube" | "x";
  format:
    | "square"
    | "feed_portrait"
    | "story"
    | "wide"
    | "thumbnail"
    | "status";
  width: number;
  height: number;
}
```

Examples:

```text
Instagram square: 1080x1080
Instagram portrait: 1080x1350
Instagram story: 1080x1920
Facebook post/banner: 1200x630
YouTube thumbnail: 1280x720
WhatsApp status: 1080x1920
X wide: 1600x900
```

---

# 13. Approval Workflow

## 13.1 Asset states

```ts
type ApprovalStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "rejected"
  | "regenerate_requested"
  | "exported"
  | "scheduled"
  | "published"
  | "failed";
```

## 13.2 Required behavior

Before export:

* User can export drafts.
* Approved assets should be clearly marked.
* Future publishing should require approval.

Before future publishing:

* Asset must be approved.
* Caption must be approved.
* Platform account must be connected.
* Publishing schedule must be confirmed.

---

# 14. Future Publishing Architecture

Not first release, but design now.

## 14.1 Publishing module

Future backend module:

```text
PublishingModule
```

Responsibilities:

* Platform auth
* Scheduled publishing
* Publishing queue
* Retry
* Failure reporting
* Published asset history

## 14.2 Publishing targets

```ts
type PublishingTarget =
  | "facebook_page"
  | "instagram_business"
  | "youtube"
  | "whatsapp_business"
  | "x"
  | "church_website"
  | "email_newsletter";
```

## 14.3 Publishing package

```ts
interface PublishingPackage {
  campaignId: string;
  assets: PublishingAsset[];
  schedule?: PublishingSchedule;
  status: "draft" | "ready" | "scheduled" | "publishing" | "published" | "failed";
}
```

---

# 15. Security and Configuration

## 15.1 API keys

Electron app should not expose shared provider keys unless running in local-only mode.

Preferred:

* Hosted backend stores provider keys.
* Electron sends generation requests.
* Backend calls providers.

For local mode:

* User may configure keys locally.
* Keys stored in OS keychain if possible.
* Do not store plaintext keys in project files.

## 15.2 Sensitive data

Campaigns may contain private church announcements or personal content.

Need:

* Clear backend mode indicator.
* Option to delete campaign data.
* Option to run local backend.
* Export package control.

## 15.3 Future publishing auth

Use OAuth where available.

Never store social network passwords.

---

# 16. Backend Job Queue

## 16.1 Why jobs are needed

Media generation can be slow:

* LLM planning
* Image generation
* Rendering
* PPTX/PDF export
* ZIP packaging

Do not make users wait on synchronous HTTP calls.

## 16.2 Job model

```ts
interface MediaGenerationJob {
  id: string;
  campaignId: string;
  type:
    | "analyze_document"
    | "generate_deck"
    | "generate_social_pack"
    | "generate_caption_pack"
    | "render_assets"
    | "export_package";
  status: "queued" | "running" | "complete" | "failed";
  progress: number;
  currentStep?: string;
  warnings?: string[];
  error?: string;
}
```

## 16.3 Progress events

Support:

```text
polling first
websocket/SSE later
```

First release can use polling:

```http
GET /api/v1/jobs/:jobId
```

---

# 17. File and Export Handling

## 17.1 Export package

ZIP should include:

```text
campaign/
  README.txt
  source/
    source.txt
  deck/
    presentation.pptx
    presentation.pdf
    slides-png/
  social/
    instagram/
    facebook/
    whatsapp/
    youtube/
    x/
  captions/
    captions.json
    captions.md
    captions.txt
  metadata/
    campaign.json
    asset-manifest.json
    warnings.json
```

## 17.2 Captions format

`captions.json`:

```json
{
  "campaignId": "...",
  "assets": [
    {
      "assetId": "...",
      "platform": "instagram",
      "role": "main_invitation",
      "caption": "...",
      "shortCaption": "...",
      "hashtags": [],
      "altText": "..."
    }
  ]
}
```

---

# 18. Quality Validators

## 18.1 CampaignQualityValidator

Checks:

* Campaign has clear type.
* Campaign has clear goal.
* Recommended assets match goal.
* Missing event details are handled gracefully.
* No invented event details.

## 18.2 DeckQualityValidator

Checks:

* Slide count appropriate.
* Layout variety.
* Text readability.
* No tiny text.
* Speaker notes if needed.
* Export readiness.

## 18.3 SocialPackQualityValidator

Checks:

* Platform-native output.
* Invitation campaign has invitation assets.
* Devotional pack has devotional assets.
* No repeated headline across all assets.
* No metadata leakage.
* Captions exist.

## 18.4 ImagePromptQualityValidator

Checks:

* No text requested in image.
* Prompt is not generic.
* Clean text zone included.
* Passage/topic motifs included.
* No provider-specific leakage.

## 18.5 ExportQualityValidator

Checks:

* Files exist.
* Images exported.
* PPTX generated.
* PDF generated.
* Captions generated.
* ZIP manifest complete.

---

# 19. Implementation Phases

## Phase 1 — Reusable Campaign Engine in clever-slides-backend

Deliver:

* CampaignsModule
* Analyze document endpoint
* Create campaign endpoint
* Generate media pack endpoint
* Job status endpoint
* Export package endpoint
* Generic campaign strategy service
* Generic campaign deck planner
* Generic social pack planner
* Caption writer
* Campaign validators
* Export ZIP

Exit criteria:

```text
clever-slides-backend can generate slides + social pack from raw text without clever-sermon-backend.
```

## Phase 2 — Electron App Shell

Deliver:

* Electron scaffold
* Backend settings screen
* Document import/paste
* Campaign analysis screen
* Campaign detail editor
* Output selection
* Generation progress
* Preview screens
* Export center

Exit criteria:

```text
User can paste a document, generate media through backend, preview assets, and export files.
```

## Phase 3 — Review and Approval Workflow

Deliver:

* Asset statuses
* Approve/reject
* Regenerate asset
* Edit social text
* Edit captions
* Edit event details
* Save local project history

Exit criteria:

```text
User can review and approve generated assets before export.
```

## Phase 4 — Brand Kit

Deliver:

* Church/org brand profile
* Logo upload
* Short name/full name
* Brand colors
* Default CTA
* Default service time
* Default address
* Default social links

Exit criteria:

```text
Generated assets consistently use brand settings.
```

## Phase 5 — Publishing Prep

Deliver:

* PublishingPackage model
* Channel placeholders
* Schedule UI mock
* Approval requirement
* Publishing queue design

Exit criteria:

```text
System can prepare publishing packages but not publish yet.
```

## Phase 6 — Publishing Integrations

Future:

* Facebook
* Instagram
* YouTube
* WhatsApp Business
* X
* Website
* Email/newsletter

---

# 20. Acceptance Criteria

## 20.1 Backend acceptance

`clever-slides-backend` is ready if:

* It can analyze a raw document.
* It can create a campaign project.
* It can generate a presentation deck.
* It can generate a social pack.
* It can generate captions.
* It can export ZIP.
* It does not require `clever-sermon-backend`.
* It supports multiple campaign types.
* It uses provider-agnostic image generation.
* It validates output quality.

## 20.2 Electron acceptance

Electron app is ready if:

* User can configure backend URL.
* User can paste/import text.
* App calls backend analysis.
* User can edit campaign details.
* User can select outputs.
* App starts generation job.
* App shows progress.
* App previews slides/social/captions.
* User can approve/reject assets.
* User can export a package.

## 20.3 Product acceptance

The product is successful if:

* A user can paste a sermon/event/campaign document.
* The app produces a usable media package.
* The package includes slides and social assets.
* Invitation assets actually invite.
* Captions are human-facing.
* Exports are organized.
* The user understands what to do next.

---

# 21. Suggested Repository Structure

## Electron app repository

Option A:

```text
clever-campaign-studio/
  apps/
    desktop/
      src/
        main/
        renderer/
        preload/
      package.json
  docs/
```

Option B:

Inside existing monorepo:

```text
clever-church/
  apps/
    clever-campaign-desktop/
      src/
        main/
        renderer/
        preload/
```

Recommendation:

Use separate repo first if you want clean packaging.

Use monorepo if you want shared types easier.

## Backend shared contracts

Add shared package:

```text
shared/
  campaign.contract.ts
  media-pack.contract.ts
  social-pack.contract.ts
  export.contract.ts
```

Both Electron and backend should use the same types.

---

# 22. Agent Implementation Prompt

Use this prompt for your coding agent.

```text
You are working on Clever Church.

We are adding a new Electron desktop app that reuses clever-slides-backend directly.

The goal is to build an AI media designer workflow:

User provides a text document containing a sermon, church event, campaign, devotional, Bible study, announcement, or ministry message.
The app analyzes the document.
The app uses clever-slides-backend to generate:
- presentation slides
- social pack
- captions
- thumbnails
- export package

Later we will add publishing to social networks, but do not implement publishing now.

Important architecture:
- Do not use clever-sermon-backend.
- clever-slides-backend must become a reusable campaign media generation engine.
- Electron app is the desktop operator console.
- clever-slides-backend owns campaign analysis, deck generation, social pack generation, captions, exports, and image provider orchestration.

Implement Phase 1 and Phase 2 architecture foundations.

Backend changes required in clever-slides-backend:
1. Add CampaignsModule.
2. Add campaign document analysis endpoint:
   POST /api/v1/campaigns/analyze-document
3. Add campaign create endpoint:
   POST /api/v1/campaigns
4. Add campaign media pack generation endpoint:
   POST /api/v1/campaigns/:campaignId/generate-media-pack
5. Add campaign status endpoint:
   GET /api/v1/campaigns/:campaignId
6. Add job status endpoint:
   GET /api/v1/jobs/:jobId
7. Add campaign export endpoint:
   POST /api/v1/campaigns/:campaignId/export
8. Add services:
   - CampaignDocumentAnalyzerService
   - CampaignStrategyService
   - CampaignDeckPlannerService
   - CampaignSocialPackPlannerService
   - CampaignCaptionWriterService
   - CampaignImagePromptService
   - CampaignExportPackageService
   - CampaignQualityValidatorService
9. Add shared contracts for:
   - CampaignType
   - CampaignGoal
   - CampaignProject
   - CampaignAnalysisResult
   - CampaignMediaPack
   - CampaignAsset
   - CampaignExportPackage
10. Make sure the backend can generate slides/social/captions from raw text without clever-sermon-backend.

Electron app requirements:
1. Scaffold Electron + React + TypeScript desktop app.
2. Add backend settings screen:
   - hosted
   - local
   - custom URL
3. Add document import/paste screen.
4. Add campaign analysis screen.
5. Add editable campaign details screen.
6. Add output selection screen.
7. Add generation progress screen.
8. Add review dashboard:
   - slides
   - social pack
   - captions
   - exports
   - warnings
9. Add export center.
10. Do not implement publishing yet.

Quality requirements:
- The app must not expose prompt-engineering fields as the main UX.
- The user should feel like they are giving a document to a graphic designer.
- The backend must support generic campaign types, not only sermons.
- Social packs must respect campaign goal.
- Invitation campaigns must produce invitation-first assets.
- Devotional packs must produce devotional-first assets.
- Captions must be human-facing.
- Exports must be organized.

Create docs:
- docs/architecture/ELECTRON_CAMPAIGN_MEDIA_APP_ARCHITECTURE.md
- docs/qa/ELECTRON_CAMPAIGN_MEDIA_APP_PHASE1_REPORT.md

Final classification:
- ELECTRON_CAMPAIGN_MEDIA_APP_PHASE1_READY
- ELECTRON_CAMPAIGN_MEDIA_APP_PHASE1_PARTIAL
- ELECTRON_CAMPAIGN_MEDIA_APP_PHASE1_NOT_READY

Do not choose READY unless:
- clever-slides-backend can be used without clever-sermon-backend
- campaign analyze endpoint exists
- campaign media generation endpoint exists
- Electron app can submit a document and display generated results
- export package can be generated
```

---

# 23. Final Recommendation

This is a strong direction.

The most important architectural decision is:

```text
Make clever-slides-backend the campaign media engine.
```

The most important UX decision is:

```text
The Electron app should feel like giving a document to a graphic designer, not filling prompt fields.
```

The most important product boundary is:

```text
Do export and approval first. Publishing comes later.
```

Recommended first milestone:

```text
Paste document
→ analyze
→ confirm campaign details
→ generate slides + social pack
→ preview
→ export ZIP
```

Once that works beautifully, publishing becomes the natural next layer.
