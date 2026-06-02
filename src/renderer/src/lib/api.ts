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
  captionResults?: { id?: string; role?: string; platform?: string; status?: string; cta?: string; hashtagCount?: number; captionPreview?: string; longCaption?: string; hashtags?: string[] }[] | null;
}

export interface ExportJob {
  exportJobId: string;
  status: string;
}

export interface ExportManifestFile {
  name: string;
  label: string;
  format: string;
  path: string;
  downloadable: boolean;
}

export interface ExportDownloadInfo {
  campaignId: string;
  exportId: string;
  exportDir?: string;
  zipFilePath?: string | null;
  status: string;
  campaignName?: string;
  manifest?: {
    exportId?: string;
    campaignName?: string;
    generatedAt?: string;
    selectedPackage?: string;
    selectedVisualStyle?: string;
    counts?: {
      slides?: number;
      socialAssets?: number;
      captions?: number;
      filesGenerated?: number;
    };
    exportFormats?: string[];
    warnings?: string[];
    fileList?: ExportManifestFile[];
    files?: ExportManifestFile[];
  };
}

export interface CampaignResponseDto {
  summary: CampaignSummaryDto;
  generatedMedia: CampaignGeneratedMediaDto;
  analysis?: CampaignAnalysisResult;
  mediaPackJobId?: string;
  exportJobId?: string;
}

export interface BackendHealthDto {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  storeMode: 'memory' | 'database';
  database: {
    configured: boolean;
    connected: boolean;
    name: string;
  };
  queue?: {
    configured: boolean;
    connected: boolean;
    name: string;
  };
  providers: {
    fal: boolean;
    openai: boolean;
    local: boolean;
  };
  image?: {
    defaultProvider: string;
    paidProvidersEnabled: boolean;
    mockMode: boolean;
    inpaintEnabled: boolean;
  };
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
        campaignSettings: campaign.advancedSettings,
        analysis: analysis || undefined,
      });
      return data;
    },

    updateCampaign: async (campaignId: string, patch: Record<string, unknown>): Promise<CampaignResponseDto> => {
      const { data } = await client.patch(`/campaigns/${campaignId}`, patch);
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
        eventDetails?: Record<string, unknown>;
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

    getHealth: async (): Promise<BackendHealthDto> => {
      const { data } = await client.get('/health');
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

    getExportDownloadInfo: async (campaignId: string, exportId: string): Promise<ExportDownloadInfo> => {
      const { data } = await client.get(`/campaigns/${campaignId}/exports/${exportId}/download`);
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

    approveSlide: async (campaignId: string, slideId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/slides/${slideId}/approve`);
      return data;
    },
    approveAllSlides: async (campaignId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/slides/approve-all`);
      return data;
    },
    regenerateSlide: async (campaignId: string, slideId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/slides/${slideId}/regenerate`);
      return data;
    },
    regenerateAllSlides: async (campaignId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/slides/regenerate`);
      return data;
    },
    approveSocialAsset: async (campaignId: string, assetId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/social-assets/${assetId}/approve`);
      return data;
    },
    approveAllSocialAssets: async (campaignId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/social-assets/approve-all`);
      return data;
    },
    regenerateSocialAsset: async (campaignId: string, assetId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/social-assets/${assetId}/regenerate`);
      return data;
    },
    regenerateAllSocialAssets: async (campaignId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/social-assets/regenerate`);
      return data;
    },
    approveCaption: async (campaignId: string, captionId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/captions/${captionId}/approve`);
      return data;
    },
    approveAllCaptions: async (campaignId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/captions/approve-all`);
      return data;
    },
    regenerateCaption: async (campaignId: string, captionId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/captions/${captionId}/regenerate`);
      return data;
    },
    regenerateAllCaptions: async (campaignId: string) => {
      const { data } = await client.post(`/campaigns/${campaignId}/captions/regenerate`);
      return data;
    },
  };
}
