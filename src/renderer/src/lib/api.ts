import axios from 'axios';
import type { CampaignState } from './store';
import type { CampaignAnalysisResult } from '../../../../../../shared/campaign.contract';
import type {
  CampaignGeneratedMediaDto,
  CampaignSummaryDto,
  DeckDto,
  SocialPackDto,
} from '../../../../../../shared/campaign-normalized.contract';

export interface GenerationJob {
  id: string;
  campaignId: string;
  type: string;
  status: string;
  progress: number;
  currentStep?: string;
  steps?: { name: string; status: string }[];
  warnings?: string[];
  deckResults?: { deckId?: string; slideCount?: number; layouts?: number; quality?: unknown; slides?: unknown[] } | null;
  socialResults?: { mode?: string; assetCount?: number; assetIds?: string[] } | null;
  captionResults?: { cta?: string; hashtagCount?: number; captionPreview?: string; longCaption?: string; hashtags?: string[] }[] | null;
}

export interface ExportJob {
  exportJobId: string;
  status: string;
}

export interface CampaignResponseDto {
  summary: CampaignSummaryDto;
  generatedMedia: CampaignGeneratedMediaDto;
  analysis?: CampaignAnalysisResult;
  mediaPackJobId?: string;
  exportJobId?: string;
}

export function createApiClient(baseUrl: string, token?: string) {
  const isDev = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  const devToken = isDev ? 'dev-bypass' : token;

  const client = axios.create({
    baseURL: `${baseUrl}/api/v1`,
    headers: devToken ? { Authorization: `Bearer ${devToken}` } : {},
    timeout: 30000,
  });

  return {
    analyzeDocument: async (content: string, language?: string, sourceType?: string): Promise<CampaignAnalysisResult> => {
      const { data } = await client.post('/campaigns/analyze-document', {
        content,
        sourceType: sourceType || 'plain_text',
        language: language || 'en',
        preferredCampaignType: 'auto',
      });
      return data;
    },

    createCampaign: async (campaign: CampaignState, analysis?: CampaignAnalysisResult): Promise<{ campaignId: string; status: string }> => {
      const { data } = await client.post('/campaigns', {
        campaignType: campaign.campaignType,
        campaignGoal: campaign.campaignGoal,
        title: campaign.title,
        subtitle: campaign.subtitle,
        sourceText: campaign.sourceText,
        language: campaign.language,
        passageOrTopic: campaign.passageOrTopic,
        eventDetails: campaign.eventDetails,
        analysis: analysis || undefined,
      });
      return data;
    },

    generateMediaPack: async (
      campaignId: string,
      options: {
        outputs: Record<string, { enabled: boolean }>;
        visualStyle?: string;
        branding?: Record<string, unknown>;
        socialPackMode?: string;
        platforms?: string[];
        imageProvider?: string;
      },
    ): Promise<{ jobId: string; campaignId: string; status: string }> => {
      const { data } = await client.post(`/campaigns/${campaignId}/generate-media-pack`, options);
      return data;
    },

    getCampaign: async (campaignId: string): Promise<CampaignResponseDto> => {
      const { data } = await client.get(`/campaigns/${campaignId}`);
      return data;
    },

    getJobStatus: async (jobId: string): Promise<GenerationJob> => {
      const { data } = await client.get(`/jobs/${jobId}`);
      return data;
    },

    exportCampaign: async (campaignId: string, formats: string[]): Promise<ExportJob> => {
      const { data } = await client.post(`/campaigns/${campaignId}/export`, {
        formats,
        includeSource: true,
        includeMetadata: true,
      });
      return data;
    },

    getCampaignSlides: async (campaignId: string): Promise<DeckDto> => {
      const { data } = await client.get(`/campaigns/${campaignId}/slides`);
      return data;
    },

    getCampaignSocialAssets: async (campaignId: string): Promise<SocialPackDto> => {
      const { data } = await client.get(`/campaigns/${campaignId}/social-assets`);
      return data;
    },
  };
}
