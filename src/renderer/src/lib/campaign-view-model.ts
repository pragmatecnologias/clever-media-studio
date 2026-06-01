import type { CampaignState } from './store';
import type { CampaignResponseDto } from './api';
import { buildCampaignGeneratedMediaDto, buildCampaignSummaryDto } from '../../../../../../shared/campaign-normalized.contract';

export interface CampaignViewModel {
  summary: ReturnType<typeof buildCampaignSummaryDto>;
  generatedMedia: ReturnType<typeof buildCampaignGeneratedMediaDto>;
}

export function selectCampaignViewModel(campaign: CampaignState, backendCampaign?: CampaignResponseDto | null): CampaignViewModel {
  const summarySource = backendCampaign?.summary || buildCampaignSummaryDto({
    campaignId: campaign.campaignId || '',
    title: campaign.title,
    type: campaign.campaignType,
    goal: campaign.campaignGoal,
    status: campaign.status,
    language: campaign.language,
    passageOrTopic: campaign.passageOrTopic,
    mainMessage: campaign.mainMessage,
    cta: campaign.cta,
    eventDetails: campaign.eventDetails,
    deckResults: campaign.deckResults,
    socialResults: campaign.socialResults,
    captionResults: campaign.captionResults ? (campaign.captionResults as any[]) : [],
    exportResults: campaign.exportResults as any,
    warnings: Array.isArray((campaign.analysis as any)?.warnings) ? (campaign.analysis as any).warnings : [],
    analysis: campaign.analysis as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const mediaSource = backendCampaign?.generatedMedia || buildCampaignGeneratedMediaDto({
    campaignId: summarySource.campaignId,
    deckResults: campaign.deckResults,
    socialResults: campaign.socialResults,
    captionResults: campaign.captionResults ? (campaign.captionResults as any[]) : [],
    exportResults: campaign.exportResults as any,
    qualityResults: campaign.deckResults ? (campaign.deckResults as any)?.quality : null,
  });

  return {
    summary: summarySource,
    generatedMedia: mediaSource,
  };
}
