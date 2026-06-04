import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CampaignRecord, CampaignStatus, AdvancedSettings, AppSettings, ChurchKit } from './types';
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
    churchName?: string; date?: string; time?: string; serviceTime?: string;
    timezone?: string; timezoneLabel?: string;
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
  reconcileBackendCampaigns: () => Promise<void>;
  getStatusForCampaign: () => CampaignStatus;
}

const defaultChurchKit: ChurchKit = {
  churchName: '',
  shortName: '',
  logoPath: '',
  logoAssetId: '',
  address: '',
  website: '',
  phone: '',
  livestreamUrl: '',
  defaultServiceDay: '',
  defaultServiceTime: '',
  timezone: '',
  socialHandles: {},
  brandColors: {},
  typographyPreset: '',
  language: 'en',
  defaultCTA: '',
  logoDisplayPreference: 'show',
  contactDisplayPreference: 'minimal',
};

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
  preferredLayoutKey: '',
  preferredTypographyPreset: '',
  designVariant: null,
  selectedDesignVariantId: null,
  selectedDesignVariant: null,
  designVariants: [],
  layoutTemplates: [],
  churchKit: { ...defaultChurchKit },
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
  churchKit: { ...defaultChurchKit },
};

function createDefaultCampaign(appSettings: AppSettings = defaultAppSettings): CampaignState {
  const appChurchKit = appSettings.churchKit || defaultChurchKit;
  return {
    sourceText: '',
    sourceName: '',
    campaignType: 'auto',
    campaignGoal: 'auto',
    title: '',
    subtitle: '',
    passageOrTopic: '',
    mainMessage: '',
    audienceNeed: '',
    tone: '',
    cta: '',
    language: 'en',
    eventDetails: {
      churchName: appChurchKit.churchName || appSettings.churchName || '',
      locationName: appChurchKit.address || '',
      address: appChurchKit.address || '',
      website: appChurchKit.website || '',
      phone: appChurchKit.phone || '',
      livestreamUrl: appChurchKit.livestreamUrl || '',
      serviceTime: appChurchKit.defaultServiceTime || '',
      date: appChurchKit.defaultServiceDay || '',
      timezone: appChurchKit.timezone || 'America/New_York',
      timezoneLabel: 'ET',
    },
    outputSelections: { presentationDeck: true, socialPack: true, captionPack: true, thumbnail: false },
    generationJobId: null,
    campaignId: null,
    generationError: null,
    analysis: null,
    deckResults: null,
    socialResults: null,
    captionResults: null,
    exportResults: null,
    status: 'draft',
    advancedSettings: {
      ...defaultAdvancedSettings,
      churchKit: {
        ...defaultChurchKit,
        ...appChurchKit,
        churchName: appChurchKit.churchName || appSettings.churchName,
        shortName: appChurchKit.shortName || appSettings.churchShortName,
      },
    },
    presetId: null,
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      screen: 'welcome',
      workspaceTab: 'summary',
      backendUrl: 'http://localhost:3001',
      backendMode: 'local',
      campaign: createDefaultCampaign(defaultAppSettings),
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
      resetCampaign: () => set((state) => ({ campaign: createDefaultCampaign(state.appSettings) })),
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

      loadCampaign: async (localId) => {
        const record = get().campaigns.find((c) => c.localId === localId);
        if (!record) return;

        // Backend-backed campaign: fetch fresh state from API
        if (record.backendCampaignId && get().backendUrl) {
          try {
            const { createApiClient } = await import('./api');
            const api = createApiClient(get().backendUrl);
            const fresh = await api.getCampaign(record.backendCampaignId);
            if (fresh) {
              const snapshot = {
                ...createDefaultCampaign(get().appSettings),
                title: fresh.summary?.title || record.title,
                campaignType: fresh.summary?.type || record.type,
                campaignGoal: fresh.summary?.goal || record.goal,
                status: (fresh.summary?.status || record.status) as any,
                campaignId: record.backendCampaignId,
                deckResults: fresh.deckResults || fresh.generatedMedia?.deck || null,
                socialResults: fresh.socialResults || fresh.generatedMedia?.socialPack || null,
                captionResults: fresh.captionResults || fresh.generatedMedia?.captions || null,
                _localId: record.localId,
              };
              set({
                campaign: snapshot as any,
                screen: 'workspace',
                workspaceTab: 'summary',
              });
              return;
            }
          } catch (err) {
            console.warn('Failed to load backend campaign, using cached snapshot', (err as any)?.message);
          }
        }

        // Local-only campaign: restore from snapshot
        if (record.snapshot) {
          set({
            campaign: { ...record.snapshot, _localId: record.localId },
            screen: 'workspace',
            workspaceTab: 'summary',
          });
        }
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

      reconcileBackendCampaigns: async () => {
        const { backendUrl, campaigns: localCampaigns } = get();
        if (!backendUrl) return;
        try {
          // Dynamically import to avoid circular dependency
          const { createApiClient } = await import('./api');
          const api = createApiClient(backendUrl);
          const backendList = await api.listCampaigns();
          if (!Array.isArray(backendList) || backendList.length === 0) return;

          const backendMap = new Map(backendList.map((b: any) => [b.campaignId, b]));

          // Step 1: Remove stale local-only Draft/Untitled test campaigns
          const cleanedLocal = localCampaigns.filter((c) => {
            const isStaleTestDraft =
              !c.backendCampaignId &&
              c.status === 'draft' &&
              (!c.title || c.title === 'Untitled' || c.title.startsWith('Debug') || c.title.startsWith('Test'));
            if (isStaleTestDraft) return false;

            // Remove local entries that exist in backend (backend wins)
            if (c.backendCampaignId && backendMap.has(c.backendCampaignId)) {
              return false; // Will be replaced by backend entry
            }
            return true;
          });

          // Step 2: Add backend campaigns as authoritative entries
          const backendEntries: CampaignRecord[] = backendList.map((b: any) => ({
            localId: `backend_${b.campaignId}`,
            title: b.title || 'Untitled',
            type: b.campaignType,
            goal: b.campaignGoal,
            status: b.status as any,
            updatedAt: b.updatedAt,
            createdAt: b.createdAt,
            backendCampaignId: b.campaignId,
            generationJobId: null,
            snapshot: null as any, // Backed by backend, loaded on open
          }));

          // Step 3: Merge — dedupe by backendCampaignId, backend wins
          const seen = new Set<string>();
          const merged: CampaignRecord[] = [];
          for (const entry of [...backendEntries, ...cleanedLocal]) {
            const key = entry.backendCampaignId || entry.localId;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(entry);
            }
          }

          set({ campaigns: merged.slice(0, 50) });
        } catch (err) {
          // Backend unreachable — keep local state
          console.warn('Campaign reconciliation skipped: backend unreachable', (err as any)?.message);
        }
      },

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
