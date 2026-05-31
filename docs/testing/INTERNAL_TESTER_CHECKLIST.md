# Internal Tester Checklist

## Pre-Session Setup

### Backend
- [ ] Backend running on `http://localhost:3001`
  - Verify: `curl -s http://localhost:3001/api-docs-json | head -c 100`
- [ ] `FAL_KEY` configured in backend process environment
- [ ] `NODE_ENV=development` (DevAuthGuard bypass active)
- [ ] No recent errors: `grep -i "error\|exception" /tmp/clever-slides-backend.log | grep -v "uuid\|Cannot GET" | tail -5`

### Electron App
- [ ] App built: `ls apps/clever-media-studio/out/main/index.js`
- [ ] App launches: window with "Clever Campaign Studio" title
- [ ] Backend URL shows `http://localhost:3001`
- [ ] "Start New Campaign" button clickable

### Test Materials
- [ ] Test script printed/open (`PASTOR_MEDIA_USER_TEST_SCRIPT.md`)
- [ ] 4 sample documents printed/open
- [ ] Feedback forms printed (one per participant)
- [ ] Quality rubric printed
- [ ] Issue log template ready
- [ ] Screenshot dir: `docs/qa/screenshots/user-testing/`

### Environment
- [ ] Laptop plugged in, mouse available, quiet space, WiFi connected

## During Session — Per Participant

### Campaign 1: Sermon Invitation
- [ ] Pasted document, clicked Analyze
- [ ] Analysis appeared (time: ___s)
- [ ] Navigated to Outputs, selected correct outputs
- [ ] Clicked Generate, progress showed, completed
- [ ] Viewed Slides/Social/Captions tabs
- [ ] Exported package successfully
- [ ] Screenshots captured

### Campaign 2: Church Event
- [ ] Completed independently
- [ ] Event details correct on social assets

### Campaign 3: Devotional Pack
- [ ] Completed independently
- [ ] Appropriate output selection (may toggle off deck)

### Campaign 4: Youth Program
- [ ] Completed independently, confident and fast

### Post-Test
- [ ] Feedback form completed
- [ ] Open-ended questions answered
- [ ] Participant thanked

## Post-Session Per Participant
- [ ] Screenshots saved to `participant-{ID}/`
- [ ] Feedback form digitized
- [ ] Issues filed in issue log
- [ ] Top 3 issues noted

## Post-All-Sessions Analysis
- [ ] Avg ease-of-use score (target >= 3.5): ___
- [ ] Avg slide quality: ___
- [ ] Avg social quality: ___
- [ ] % completed all 4 campaigns: ___
- [ ] Avg time per campaign (after first): ___
- [ ] % who'd use slides in real service: ___
- [ ] Top 3 confusion points identified
- [ ] Top 3 feature requests identified
- [ ] Classification: READY / NEEDS MINOR FIXES / NEEDS MAJOR WORK
