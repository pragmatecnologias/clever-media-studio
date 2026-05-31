# Pastor & Media Team User Test Script

## Test Goal

Observe whether pastors and church media users can independently use Clever Campaign Studio to turn a sermon, event, or devotional message into a complete media package (slides, social posts, captions, export ZIP) — and whether the generated assets are useful enough to use or lightly edit for real ministry.

## Participant Profile

**Ideal participants (recruit 3-5):**
- Pastor or associate pastor who prepares weekly sermons
- Church media director or social media volunteer
- Church admin who manages event announcements
- Youth or young adult ministry leader

**No prior AI tool experience required.** Basic computer literacy assumed.

## Required Setup

### Before the session:
1. Launch Clever Campaign Studio Electron app
2. Confirm backend URL is set to `http://localhost:3001`
3. Confirm the backend is running and FAL_KEY is configured
4. Open this test script on a second screen or printed copy
5. Prepare the 4 sample documents (print or open in separate window)

### Session materials:
- Laptop with Electron app running
- Sample input documents (4 provided)
- This test script
- Feedback form (printed or digital)
- Screen recording tool (optional, for later review)

## Step-by-Step Tasks

### Task 1: First Impressions (3 min)

**Instructions to participant:**
> "Open the app and look at the welcome screen. Without clicking anything yet, tell me what you think this app does."

**Observe:**
- Do they understand the purpose from the welcome text?
- Do they notice the backend URL field?
- Do they identify "Start New Campaign" as the first action?

### Task 2: Create a Sermon Invitation Campaign (10 min)

**Sample document:** `sermon-invitation-sample.md`

**Instructions to participant:**
> "You have a sermon document about God guiding His people through uncertain times. You want to create presentation slides for the service and social media posts inviting people to attend. Please use the app to do this."

**Steps they should follow:**
1. Click "Start New Campaign"
2. Paste the sermon document into the text area
3. Click "Analyze Document"
4. Review the analysis results
5. Click "Edit Details" and review fields
6. Click through to outputs screen
7. Confirm Presentation Deck + Social Pack + Caption Package are selected
8. Click "Generate Media Pack"
9. Wait for generation to complete
10. Click "Review Generated Media"
11. Browse slides, social pack, and captions tabs
12. Go to Exports tab, click "Open Export Center"
13. Click "Export Package"
14. Confirm export completion

**Observe:**
- Where do they hesitate?
- Do they understand each screen?
- Do they read the analysis results?
- Do they notice the BACKEND DATA indicators?
- Do they click through all review tabs?

### Task 3: Create a Church Event Campaign (8 min)

**Sample document:** `church-event-sample.md`

**Observe:** Do they find the flow easier the second time? Do they notice event details were extracted?

### Task 4: Create a Devotional Pack (8 min)

**Sample document:** `devotional-pack-sample.md`

**Observe:** Do they understand to toggle OFF Presentation Deck? Do they notice the different campaign type?

### Task 5: Create a Youth Program Campaign (8 min)

**Sample document:** `youth-program-sample.md`

**Observe:** Are they now confident and fast?

## Questions to Ask After Testing

1. "On a scale of 1-5, how easy was the app to use?"
2. "What was the most confusing step?"
3. "Would you use these slides in a real service? If not, what would you change?"
4. "Would you post these social media images?"
5. "Do the captions sound like something a real person would write?"
6. "How long would it normally take you to create all these assets manually?"
7. "Would you use this app weekly? Monthly?"
8. "What's the ONE thing you'd add to make this indispensable?"

## Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Completes all 4 campaigns | Must complete at least 3/4 |
| Time per campaign (2nd onward) | Under 6 minutes |
| Identifies correct outputs to enable | Must get at least 3/4 right |
| Navigates review tabs | Must view slides + social + captions |
| Successfully exports | Must export at least 2 campaigns |
| Would use slides in real service | Yes/Maybe (not No) |

## Scoring Rubric

| Score | Description |
|-------|-------------|
| 5 | Completed independently, no questions, expressed satisfaction |
| 4 | Completed with minor hesitation, 1 question |
| 3 | Completed but needed guidance at 1-2 steps |
| 2 | Completed but needed significant guidance |
| 1 | Could not complete without tester intervention |

**Overall:** Power User (45-60), Comfortable (30-44), Needs Support (15-29), Blocked (<15)
