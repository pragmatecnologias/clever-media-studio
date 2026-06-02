const INVITATION_GOALS = new Set(['invite_attendance', 'announce_event', 'promote_livestream']);

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getAnalysisValue(campaign, key) {
  if (!isObject(campaign?.analysis)) return '';
  return normalizeString(campaign.analysis[key]);
}

export function countEnabledOutputs(outputSelections) {
  return Object.values(outputSelections).filter(Boolean).length;
}

export function getResolvedCampaignType(campaign) {
  const explicit = normalizeString(campaign?.campaignType);
  if (explicit && explicit !== 'auto') return explicit;
  const fromAnalysis = getAnalysisValue(campaign, 'detectedType');
  return fromAnalysis && fromAnalysis !== 'auto' ? fromAnalysis : explicit || 'general_campaign';
}

export function getResolvedCampaignGoal(campaign) {
  const explicit = normalizeString(campaign?.campaignGoal);
  if (explicit && explicit !== 'auto') return explicit;
  const fromAnalysis = getAnalysisValue(campaign, 'campaignGoal');
  return fromAnalysis && fromAnalysis !== 'auto' ? fromAnalysis : explicit || 'share_devotional';
}

export function resolveBestPreset(campaign, presets) {
  const enabledPresets = (presets || []).filter((preset) => countEnabledOutputs(preset.outputSelections) > 0);
  if (enabledPresets.length === 0) return null;

  const campaignType = getResolvedCampaignType(campaign);
  const campaignGoal = getResolvedCampaignGoal(campaign);

  const exactTypeGoal = enabledPresets.find(
    (preset) => preset.campaignType === campaignType && preset.campaignGoal === campaignGoal,
  );
  if (exactTypeGoal) return exactTypeGoal;

  if (campaignType === 'sermon' && INVITATION_GOALS.has(campaignGoal)) {
    return enabledPresets.find((preset) => preset.id === 'sermon-invitation')
      || enabledPresets.find((preset) => preset.campaignType === 'sermon');
  }

  const exactType = enabledPresets.find((preset) => preset.campaignType === campaignType);
  if (exactType) return exactType;

  const exactGoal = enabledPresets.find((preset) => preset.campaignGoal === campaignGoal);
  if (exactGoal) return exactGoal;

  const recommendedMatch = enabledPresets.find(
    (preset) => (preset.recommendedFor || []).includes(campaignType) || (preset.recommendedFor || []).includes('*'),
  );
  if (recommendedMatch) return recommendedMatch;

  return enabledPresets[0];
}

export function isInvitationCampaign(campaign) {
  const campaignType = getResolvedCampaignType(campaign);
  const campaignGoal = getResolvedCampaignGoal(campaign);
  const eventDetails = isObject(campaign?.eventDetails) ? campaign.eventDetails : {};
  return (
    (campaignType === 'sermon' && INVITATION_GOALS.has(campaignGoal))
    || campaignType === 'church_event'
    || campaignType === 'announcement'
    || Boolean(eventDetails.date || eventDetails.time || eventDetails.locationName || eventDetails.address)
  );
}

export function buildGenerateMediaPackRequest(campaign, visualStyleOverride) {
  const advanced = campaign?.advancedSettings || {};
  const outputs = campaign?.outputSelections || {};
  return {
    outputs: {
      presentationDeck: { enabled: Boolean(outputs.presentationDeck) },
      socialPack: { enabled: Boolean(outputs.socialPack) },
      captionPack: { enabled: Boolean(outputs.captionPack) },
      thumbnail: { enabled: Boolean(outputs.thumbnail) },
    },
    visualStyle: normalizeString(advanced.visualStyle) || normalizeString(visualStyleOverride) || 'auto',
    socialPackMode: advanced.socialPackMode,
    platforms: advanced.platforms,
    imageProvider: advanced.imageProvider,
    targetSlideCount: advanced.targetSlideCount !== 'auto' ? Number(advanced.targetSlideCount) : undefined,
    deckType: advanced.deckType !== 'auto' ? advanced.deckType : undefined,
    branding: {
      mode: advanced.brandingMode,
      showLogo: advanced.showLogo,
      showAddress: advanced.showAddress,
      showWebsite: advanced.showWebsite,
      showPhone: advanced.showPhone,
      showServiceTime: advanced.showServiceTime,
    },
    exportFormats: advanced.exportFormats,
    includeSource: advanced.includeSource,
    includeMetadata: advanced.includeMetadata,
    eventDetails: isObject(campaign?.eventDetails) ? campaign.eventDetails : {},
  };
}
