import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CampaignRecord, CampaignStatus, AdvancedSettings, AppSettings } from './types';
import { generateLocalId } from './types';

export type AppScreen =
  | 'welcome'
  | 'import'
  | 'analysis'
  | 'details'
  | 'style'
  | 'outputs'
  | 'configure'
  | 'generating'
  | 'review'
  | 'slidePreview'
  | 'socialPreview'
  | 'export'
  | 'workspace'
  | 'settings';

export type WorkspaceTab = 'summary' | 'source' | 'configure' | 'slides' | 'social' | 'captions' | 'exports' | 'warnings';

export interface CampaignState {
  sourceText: string;
  sourceName: string;
  campaignType: string;
  campaignGoal: string;
  title: string;
  subtitle: string;
  passageOrTopic: string;
  mainMessage: string;
  audienceNeed: string;
  tone: string;
  cta: string;
  language: 'en' | 'es';
  eventDetails: {
    date?: string; time?: string; timezone?: string; timezoneLabel?: string;
    locationName?: string; address?: string; website?: string; phone?: string; livestreamUrl?: string;
  };
  outputSelections: { presentationDeck: boolean; socialPack: boolean; captionPack: boolean; thumbnail: boolean };
  generationJobId: string | null;
  generationError: string | null;
  campaignId: string | null;
  analysis: Record<string, unknown> | null;
  deckResults: Record<string, unknown> | null;
  socialResults: Record<string, unknown> | null;
  captionResults: Record<string, unknown> | null;
  exportResults: Record<string, unknown> | null;
  status: CampaignStatus;
  advancedSettings: AdvancedSettings;
  presetId: string | null;
}

export interface AppStore {
  screen: AppScreen;
  workspaceTab: WorkspaceTab;
  backendUrl: string;
  backendMode: 'hosted' | 'local' | 'custom';
  campaign: CampaignState;
  campaigns: CampaignRecord[];
  appSettings: AppSettings;
  drawerOpen: boolean;
  setScreen: (screen: AppScreen) => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  setBackendUrl: (url: string) => void;
  setBackendMode: (mode: 'hosted' | 'local' | 'custom') => void;
  updateCampaign: (partial: Partial<CampaignState>) => void;
  resetCampaign: () => void;
  saveCampaign: () => void;
  loadCampaign: (localId: string) => void;
  deleteCampaign: (localId: string) => void;
  duplicateCampaign: (localId: string) => void;
  toggleDrawer: () => void;
  updateAppSettings: (partial: Partial<AppSettings>) => void;
  clearCampaignHistory: () => void;
  getStatusForCampaign: () => CampaignStatus;
}

const defaultAdvancedSettings: AdvancedSettings = {
  strategyNotes: '',
  deckType: 'auto',
  targetSlideCount: 'auto',
  brandingMode: 'short_name',
  showLogo: true,
  showAddress: false,
  showWebsite: false,
  showPhone: false,
  showServiceTime: true,
  socialPackMode: 'invitation_campaign',
  platforms: ['instagram', 'facebook', 'whatsapp', 'youtube'],
  imageProvider: 'auto',
  visualStyle: 'auto',
  exportFormats: ['pptx', 'pdf', 'png', 'zip'],
  includeSource: true,
  includeMetadata: true,
};

const defaultAppSettings: AppSettings = {
  defaultLanguage: 'en',
  churchName: '',
  churchShortName: '',
  brandColor: '#3B82F6',
  exportFolder: '',
};

const defaultCampaign: CampaignState = {
  sourceText: '', sourceName: '',
  campaignType: 'auto', campaignGoal: 'auto',
  title: '', subtitle: '', passageOrTopic: '',
  mainMessage: '', audienceNeed: '', tone: '', cta: '',
  language: 'en',
  eventDetails: {},
  outputSelections: { presentationDeck: true, socialPack: true, captionPack: true, thumbnail: false },
  generationJobId: null, campaignId: null,
  generationError: null,
  analysis: null, deckResults: null, socialResults: null, captionResults: null,
  exportResults: null,
  status: 'draft',
  advancedSettings: { ...defaultAdvancedSettings },
  presetId: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      screen: 'welcome',
      workspaceTab: 'summary',
      backendUrl: 'http://localhost:3001',
      backendMode: 'local',
      campaign: { ...defaultCampaign },
      campaigns: [],
      appSettings: { ...defaultAppSettings },
      drawerOpen: false,

      setScreen: (screen) => set({ screen }),
      setWorkspaceTab: (tab) => set({ workspaceTab: tab }),
      setBackendUrl: (url) => set({ backendUrl: url }),
      setBackendMode: (mode) => set({ backendMode: mode }),
      updateCampaign: (partial) => set((state) => ({
        campaign: { ...state.campaign, ...partial },
      })),
      resetCampaign: () => set({ campaign: { ...defaultCampaign } }),
      toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

      // Campaign persistence
      saveCampaign: () => {
        const { campaign, campaigns } = get();
        const now = new Date().toISOString();
        const existingIdx = campaigns.findIndex(
          (c) => c.localId === (campaign as any)._localId,
        );

        const record: CampaignRecord = {
          localId: (campaign as any)._localId || generateLocalId(),
          title: campaign.title || campaign.sourceText.slice(0, 60).replace(/\n/g, ' ') || 'Untitled',
          type: campaign.campaignType,
          goal: campaign.campaignGoal,
          status: campaign.status,
          updatedAt: now,
          createdAt: existingIdx >= 0 ? campaigns[existingIdx].createdAt : now,
          backendCampaignId: campaign.campaignId,
          generationJobId: campaign.generationJobId,
          snapshot: { ...campaign },
        };

        // Store localId on campaign for future reference
        (campaign as any)._localId = record.localId;

        if (existingIdx >= 0) {
          const updated = [...campaigns];
          updated[existingIdx] = record;
          set({ campaigns: updated });
        } else {
          set({ campaigns: [record, ...campaigns].slice(0, 50) });
        }
      },

      loadCampaign: (localId) => {
        const record = get().campaigns.find((c) => c.localId === localId);
        if (!record) return;
        set({
          campaign: { ...record.snapshot, _localId: record.localId },
          screen: 'workspace',
          workspaceTab: 'summary',
        });
      },

      deleteCampaign: (localId) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.localId !== localId),
        }));
      },

      duplicateCampaign: (localId) => {
        const record = get().campaigns.find((c) => c.localId === localId);
        if (!record) return;
        const newRecord: CampaignRecord = {
          ...record,
          localId: generateLocalId(),
          title: `${record.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          backendCampaignId: null,
          generationJobId: null,
          status: 'draft',
          snapshot: {
            ...record.snapshot,
            campaignId: null,
            generationJobId: null,
            generationError: null,
            analysis: null,
            deckResults: null,
            socialResults: null,
            captionResults: null,
            exportResults: null,
            status: 'draft',
          },
        };
        set((state) => ({ campaigns: [newRecord, ...state.campaigns] }));
      },

      updateAppSettings: (partial) => set((state) => ({
        appSettings: { ...state.appSettings, ...partial },
      })),
      clearCampaignHistory: () => set({ campaigns: [] }),

      getStatusForCampaign: () => {
        const { campaign } = get();
        if (campaign.generationJobId && campaign.deckResults) return 'generated';
        if (campaign.generationJobId) return 'generating';
        if (campaign.analysis) return 'analyzed';
        if (campaign.sourceText) return 'draft';
        return 'draft';
      },
    }),
    {
      name: 'clever-campaign-studio',
      partialize: (state) => ({
        campaigns: state.campaigns,
        backendUrl: state.backendUrl,
        appSettings: state.appSettings,
      }),
    },
  ),
);
