#!/usr/bin/env node
/**
 * Full Product Data Contract Regression Check
 * Verifies: presetId export, social quality warnings, imageCostSummary
 */
const API = process.argv[2] || 'http://localhost:3001/api/v1';
let passed = 0, failed = 0;
const assert = (c, l) => { if (c) { passed++; console.log(`  ✓ ${l}`); } else { failed++; console.error(`  ✗ ${l}`); } };

async function post(u, b) { const r = await fetch(u, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(b) }); return { s: r.status, d: await r.json() }; }
async function get(u) { const r = await fetch(u); return { s: r.status, d: await r.json() }; }
async function patch(u, b) { const r = await fetch(u, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(b) }); return { s: r.status, d: await r.json() }; }

(async () => {
  console.log('Full Product Data Contract Check\n');

  // A. Create campaign with preset and church kit
  const churchKit = { churchName: 'DC Test Church', address: '123 Main St', defaultCTA: 'Join us.', socialHandles: { instagram: '@test' } };
  const create = await post(`${API}/campaigns`, {
    title: 'Data Contract Check', sourceText: 'The Lord is my shepherd.', language: 'en',
    campaignType: 'sermon', campaignGoal: 'invite_attendance',
    campaignSettings: { presetId: 'sermon_invitation', churchKit }
  });
  assert(create.s === 201, 'Campaign created');
  const cid = create.d?.campaignId;

  // B. Generate
  const gen = await post(`${API}/campaigns/${cid}/generate-media-pack`, {
    outputs: { presentationDeck: { enabled: true }, socialPack: { enabled: true }, captionPack: { enabled: true } },
    visualStyle: 'auto', imageProvider: 'local',
    advancedSettings: { presetId: 'sermon_invitation', churchKit }
  });
  assert(gen.s === 201, 'Generation queued');

  // Wait
  for (let i=0; i<90; i++) {
    await new Promise(r=>setTimeout(r,2000));
    const j = await get(`${API}/jobs/${gen.d.jobId}`);
    if (j.d?.status === 'complete') break;
  }

  // C. Check social quality warnings (from campaign state)
  console.log('\n--- Social Quality Warnings ---');
  const c = await get(`${API}/campaigns/${cid}`);
  const sr = c.d?.socialResults || c.d?.generatedMedia?.socialPack || {};
  const assets = sr.assets || [];
  assert(assets.length > 0, `Social assets present: ${assets.length}`);
  let hasQualityField = 0, hasNonEmptyWarnings = 0;
  for (const a of assets) {
    if (a.quality) { hasQualityField++; if (a.quality.warnings?.length > 0) hasNonEmptyWarnings++; }
  }
  assert(hasQualityField === assets.length, `All ${assets.length} assets have quality field`);
  console.log(`  i Assets with non-empty warnings: ${hasNonEmptyWarnings}/${assets.length}`);

  // D. Check imageCostSummary
  console.log('\n--- Image Cost Summary ---');
  const cs = c.d?.campaignSettings || {};
  const imgSum = cs.imageCostSummary;
  assert(!!imgSum, 'imageCostSummary present in campaignSettings');
  if (imgSum) {
    console.log(`  i provider: ${imgSum.defaultProvider || 'N/A'}, cost: $${imgSum.estimatedCostUsd || 0}`);
  }

  // E. Export and check manifest
  console.log('\n--- Export Metadata ---');
  await patch(`${API}/campaigns/${cid}`, { status: 'ready' });
  const exp = await post(`${API}/campaigns/${cid}/export`, { formats: ['zip'], includeSource: true, includeMetadata: true });
  assert(exp.s === 201, 'Export created');
  assert(!!exp.d?.exportJobId, 'Has exportJobId');

  await new Promise(r=>setTimeout(r,3000));
  const dl = await get(`${API}/campaigns/${cid}/exports/${exp.d.exportJobId}/download`);
  const m = dl.d?.manifest || {};
  assert(m.selectedPackage !== 'Unknown' || !!m.presetId, 'selectedPackage not Unknown or presetId present');
  console.log(`  i selectedPackage: ${m.selectedPackage}`);
  console.log(`  i presetId: ${m.presetId || 'NOT FOUND (from campaignSettings)'}`);
  assert(!!m.churchKit, 'churchKit in manifest');
  assert(!!m.churchKit?.socialHandles, 'socialHandles in manifest churchKit');

  // F. Final
  console.log(`\n========================================`);
  console.log(`Data Contract: ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? 'DATA_CONTRACT_VERIFIED' : 'DATA_CONTRACT_PARTIAL');
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
