import React from 'react';
import { useAppStore, type WorkspaceTab } from '../lib/store';
import SidebarItem from './SidebarItem';
import { selectCampaignViewModel } from '../lib/campaign-view-model';

interface NavItem { tab: WorkspaceTab; icon: string; label: string; }

const navItems: NavItem[] = [
  { tab: 'summary', icon: '📋', label: 'Summary' },
  { tab: 'source', icon: '📄', label: 'Source' },
  { tab: 'configure', icon: '⚙️', label: 'Configure' },
  { tab: 'slides', icon: '🎞️', label: 'Slides' },
  { tab: 'social', icon: '📱', label: 'Social Pack' },
  { tab: 'captions', icon: '✏️', label: 'Captions' },
  { tab: 'exports', icon: '📦', label: 'Exports' },
  { tab: 'warnings', icon: '⚠️', label: 'Warnings' },
];

export default function Sidebar() {
  const { workspaceTab, setWorkspaceTab, campaign } = useAppStore();
  const view = selectCampaignViewModel(campaign);

  const badges: Partial<Record<WorkspaceTab, number | string>> = {
    slides: view.summary.counts.slides || null,
    social: view.summary.counts.socialAssets || null,
    captions: view.summary.counts.captions || null,
    exports: view.summary.counts.exports || null,
  };

  return (
    <nav className="w-48 flex-shrink-0 space-y-0.5 p-2">
      {navItems.map((item) => (
        <SidebarItem
          key={item.tab}
          icon={item.icon}
          label={item.label}
          active={workspaceTab === item.tab}
          badge={badges[item.tab]}
          onClick={() => setWorkspaceTab(item.tab)}
        />
      ))}
    </nav>
  );
}
