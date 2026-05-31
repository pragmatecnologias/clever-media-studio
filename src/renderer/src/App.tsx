import React from 'react';
import { useAppStore, type AppScreen } from './lib/store';
import WelcomeScreen from './screens/WelcomeScreen';
import ImportScreen from './screens/ImportScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import DetailsScreen from './screens/DetailsScreen';
import StyleSelectionScreen from './screens/StyleSelectionScreen';
import OutputsScreen from './screens/OutputsScreen';
import ConfigureScreen from './screens/ConfigureScreen';
import GeneratingScreen from './screens/GeneratingScreen';
import ReviewScreen from './screens/ReviewScreen';
import SlidePreviewScreen from './screens/SlidePreviewScreen';
import SocialPackPreviewScreen from './screens/SocialPackPreviewScreen';
import ExportScreen from './screens/ExportScreen';
import SettingsScreen from './screens/SettingsScreen';
import WorkspaceLayout from './components/WorkspaceLayout';

const screenTitles: Record<AppScreen, string> = {
  welcome: 'Home',
  import: 'Create',
  analysis: 'Create',
  details: 'Configure',
  style: 'Configure',
  outputs: 'Configure',
  configure: 'Configure',
  generating: 'Generate',
  review: 'Review',
  slidePreview: 'Slides',
  socialPreview: 'Social Pack',
  export: 'Export',
  workspace: 'Workspace',
  settings: 'Settings',
};

// Simplified 3-step flow that maps old screens to new steps
const FLOW_STEPS = ['import', 'configure', 'generate'] as const;
function getFlowStep(screen: AppScreen): number {
  if (screen === 'import' || screen === 'analysis') return 0;
  if (screen === 'details' || screen === 'style' || screen === 'outputs') return 1;
  if (screen === 'generating') return 2;
  return -1;
}
const FLOW_LABELS = ['Create', 'Configure', 'Generate'];

export default function App() {
  const { screen, setScreen, campaign, saveCampaign } = useAppStore();

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return <WelcomeScreen />;
      case 'import': return <ImportScreen />;
      case 'analysis': return <AnalysisScreen />;
      case 'details': return <DetailsScreen />;
      case 'style': return <StyleSelectionScreen />;
      case 'outputs': return <ConfigureScreen />;
      case 'configure': return <ConfigureScreen />;
      case 'details': return <ConfigureScreen />;
      case 'style': return <ConfigureScreen />;
      case 'generating': return <GeneratingScreen />;
      case 'review': return <ReviewScreen />;
      case 'slidePreview': return <SlidePreviewScreen />;
      case 'socialPreview': return <SocialPackPreviewScreen />;
      case 'export': return <ExportScreen />;
      case 'settings': return <SettingsScreen />;
      case 'workspace': return <WorkspaceLayout />;
      default: return <WelcomeScreen />;
    }
  };

  const flowStep = getFlowStep(screen);
  const isInFlow = flowStep >= 0;
  const isHomeOrSettings = screen === 'welcome' || screen === 'settings';
  const isWorkspaceOrPreview = screen === 'workspace' || screen === 'review' ||
    screen === 'slidePreview' || screen === 'socialPreview' || screen === 'export';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-900/50 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { saveCampaign(); setScreen('welcome'); }}
            className="text-lg font-bold tracking-tight hover:text-purple-300 transition-colors"
          >
            Clever Campaign Studio
          </button>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">v1.0</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {campaign.title && <span className="text-gray-300">{campaign.title}</span>}
          {campaign.title && <span className="text-gray-600">|</span>}
          <span>{screenTitles[screen]}</span>
          <button onClick={() => { saveCampaign(); setScreen('settings'); }}
            className="ml-2 text-gray-600 hover:text-gray-400 transition-colors" title="Settings">
            ⚙
          </button>
        </div>
      </header>

      {/* Simple breadcrumb — only during the 3-step create flow */}
      {isInFlow && (
        <div className="px-6 py-2 border-b border-white/5 bg-gray-900/30">
          <div className="flex items-center gap-2 text-xs">
            {FLOW_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span className="text-gray-700">→</span>}
                <span className={`px-2 py-0.5 rounded-full ${
                  i === flowStep
                    ? 'bg-purple-500/20 text-purple-200 font-medium'
                    : i < flowStep
                      ? 'text-gray-500'
                      : 'text-gray-700'
                }`}>
                  {i < flowStep ? '✓' : ''} {label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={isInFlow ? 'p-6' : ''}>{renderScreen()}</main>
    </div>
  );
}
