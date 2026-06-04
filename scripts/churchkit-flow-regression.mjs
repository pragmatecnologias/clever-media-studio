#!/usr/bin/env node
/**
 * ChurchKit data flow regression test.
 * Verifies that ChurchKit defaults flow from settings through campaign creation,
 * and that the backend preserves churchKit/socialHandles through to export metadata.
 *
 * Usage: node scripts/churchkit-flow-regression.mjs [apiBaseUrl]
 * Default API: http://localhost:3001
 */

const API = process.argv[2] || 'http://localhost:3001/api/v1';
let failures = 0;
let passed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✓ ${label}`); }
  else { failures++; console.error(`  ✗ ${label}`); }
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(url) {
  const res = await fetch(url);
  return { status: res.status, data: await res.json() };
}

async function patch(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

(async () => {
  console.log(`\nChurchKit Flow Regression Test\nAPI: ${API}\n`);

  const churchKit = {
    churchName: 'Test Church',
    address: '123 Main St, Atlanta, GA',
    website: 'testchurch.example',
    phone: '555-1234',
    livestreamUrl: 'youtube.com/testchurch',
    defaultServiceDay: 'Sunday',
    defaultServiceTime: '10:30 AM',
    timezone: 'America/Chicago',
    defaultCTA: 'Join us this Sunday!',
    socialHandles: {
      instagram: '@testchurch',
      facebook: 'fb.com/testchurch',
      youtube: 'youtube.com/testchurch',
      x: '@testchurch',
    },
    brandColors: { primary: '#336699', secondary: '#CC6633', accent: '#99CC33' },
  };

  // 1. Create campaign with ChurchKit in campaignSettings
  console.log('1. Create campaign with ChurchKit');
  const create = await post(`${API}/campaigns`, {
    title: 'ChurchKit Regression Test',
    sourceText: 'For God so loved the world that He gave His only Son.',
    language: 'en',
    campaignType: 'sermon',
    campaignGoal: 'invite_attendance',
    campaignSettings: { churchKit },
    eventDetails: {
      churchName: churchKit.churchName,
      address: churchKit.address,
      website: churchKit.website,
      phone: churchKit.phone,
    },
  });
  assert(create.status === 201, 'Campaign created');
  const campaignId = create.data?.campaignId;
  assert(!!campaignId, 'Has campaignId');

  // 2. Generate with ChurchKit in advancedSettings
  console.log('\n2. Generate media pack');
  const gen = await post(`${API}/campaigns/${campaignId}/generate-media-pack`, {
    outputs: {
      presentationDeck: { enabled: true },
      socialPack: { enabled: true },
      captionPack: { enabled: true },
    },
    visualStyle: 'auto',
    imageProvider: 'local',
    advancedSettings: { churchKit },
  });
  assert(gen.status === 201, 'Generation queued');
  const jobId = gen.data?.jobId;
  assert(!!jobId, 'Has jobId');

  // 3. Wait for completion
  console.log('\n3. Wait for generation');
  let complete = false;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const job = await get(`${API}/jobs/${jobId}`);
    if (job.data?.status === 'complete') { complete = true; break; }
  }
  assert(complete, 'Generation completed');

  // 4. Get campaign state
  console.log('\n4. Check campaign state');
  const campaign = await get(`${API}/campaigns/${campaignId}`);
  const summary = campaign.data?.summary || {};
  assert(summary.status === 'ready', 'Campaign status is ready');

  // 5. Check warnings — should NOT have CTA/main message stale warnings
  console.log('\n5. Check warnings');
  const warnings = summary.warnings || [];
  const hasCTAWarning = warnings.some(w => /no cta/i.test(w));
  const hasMainMsgWarning = warnings.some(w => /main message.*not extracted/i.test(w));
  assert(!hasCTAWarning, 'No stale CTA warning');
  assert(!hasMainMsgWarning, 'No stale main message warning');

  // 6. Export
  console.log('\n6. Export');
  await patch(`${API}/campaigns/${campaignId}`, { status: 'ready' });
  const exp = await post(`${API}/campaigns/${campaignId}/export`, {
    formats: ['zip'],
    includeSource: true,
    includeMetadata: true,
  });
  assert(exp.status === 201, 'Export created');
  const exportId = exp.data?.exportJobId;
  assert(!!exportId, 'Has exportId');

  // 7. Check export manifest
  console.log('\n7. Check export manifest');
  await new Promise(r => setTimeout(r, 3000));
  const dl = await get(`${API}/campaigns/${campaignId}/exports/${exportId}/download`);
  const manifest = dl.data?.manifest || {};
  const manifestCK = manifest.churchKit || {};
  assert(!!manifest.churchKit, 'ChurchKit present in manifest');
  assert(manifestCK.churchName === churchKit.churchName, 'churchName in manifest');
  assert(manifestCK.address === churchKit.address, 'address in manifest');
  assert(manifestCK.defaultCTA === churchKit.defaultCTA, 'defaultCTA in manifest');

  // 8. Check socialHandles
  console.log('\n8. Check socialHandles');
  const sh = manifestCK.socialHandles || {};
  assert(sh.instagram === churchKit.socialHandles.instagram, 'instagram in manifest');
  assert(sh.facebook === churchKit.socialHandles.facebook, 'facebook in manifest');
  assert(sh.youtube === churchKit.socialHandles.youtube, 'youtube in manifest');
  assert(sh.x === churchKit.socialHandles.x, 'x in manifest');

  // 9. Check campaignSettings.churchKit survived
  console.log('\n9. Check campaignSettings preservation');
  const csCK = (campaign.data?.campaignSettings || {}).churchKit;
  assert(!!csCK, 'campaignSettings.churchKit present');
  assert(csCK.churchName === churchKit.churchName, 'churchName in campaignSettings');

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failures} failed`);
  console.log(`========================================\n`);

  if (failures > 0) {
    console.error('CHURCHKIT_FLOW_REGRESSION_FAILED');
    process.exit(1);
  } else {
    console.log('CHURCHKIT_FLOW_REGRESSION_PASS');
    process.exit(0);
  }
})().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
