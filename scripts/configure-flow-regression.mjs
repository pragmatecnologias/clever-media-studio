import assert from 'node:assert/strict';
import { buildGenerateMediaPackRequest, countEnabledOutputs, resolveBestPreset, isInvitationCampaign } from '../src/renderer/src/lib/configure-flow.mjs';

const presets = [
  {
    id: 'sermon-invitation',
    campaignType: 'sermon',
    campaignGoal: 'invite_attendance',
    outputSelections: { presentationDeck: true, socialPack: true, captionPack: true, thumbnail: false },
    socialPackMode: 'invitation_campaign',
    recommendedFor: ['sermon'],
  },
  {
    id: 'custom',
    campaignType: 'general_campaign',
    campaignGoal: 'share_devotional',
    outputSelections: { presentationDeck: false, socialPack: false, captionPack: false, thumbnail: false },
    socialPackMode: 'devotional_pack',
    recommendedFor: [],
  },
];

const campaign = {
  campaignType: 'sermon',
  campaignGoal: 'invite_attendance',
  title: 'Psalm 37',
  sourceText: 'Psalm 37:23-24',
  language: 'en',
  passageOrTopic: 'Psalm 37:23-24',
  mainMessage: 'God still holds you.',
  cta: 'Join us this Sabbath',
  eventDetails: {
    date: '2026-05-31',
    time: '10:30 AM',
    locationName: 'Main Sanctuary',
    address: '123 Church St',
    website: 'https://example.org',
    phone: '555-0100',
  },
  advancedSettings: {
    strategyNotes: '',
    deckType: 'auto',
    targetSlideCount: 'auto',
    brandingMode: 'short_name',
    showLogo: true,
    showAddress: true,
    showWebsite: true,
    showPhone: true,
    showServiceTime: true,
    socialPackMode: 'invitation_campaign',
    platforms: ['instagram', 'facebook'],
    imageProvider: 'auto',
    visualStyle: 'warm_pastoral',
    exportFormats: ['pptx', 'pdf', 'png', 'zip'],
    includeSource: true,
    includeMetadata: true,
  },
  outputSelections: { presentationDeck: true, socialPack: true, captionPack: true, thumbnail: false },
};

assert.equal(resolveBestPreset(campaign, presets)?.id, 'sermon-invitation');
assert.equal(countEnabledOutputs({ presentationDeck: true, socialPack: true, captionPack: true, thumbnail: false }), 3);
assert.equal(isInvitationCampaign(campaign), true);

const request = buildGenerateMediaPackRequest(campaign, 'auto');
assert.equal(request.outputs.presentationDeck.enabled, true);
assert.equal(request.outputs.socialPack.enabled, true);
assert.equal(request.outputs.captionPack.enabled, true);
assert.equal(request.outputs.thumbnail.enabled, false);
assert.equal(request.visualStyle, 'warm_pastoral');
assert.equal(request.eventDetails?.address, '123 Church St');

console.log('CONFIGURE_FLOW_REGRESSION_PASS');
