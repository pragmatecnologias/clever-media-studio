import React from 'react';
import { useAppStore, type WorkspaceTab } from '../lib/store';
import SidebarItem from './SidebarItem';

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
  const deckResults = campaign.deckResults as any;
  const socialResults = campaign.socialResults as any;
  const captionResults = campaign.captionResults as any;

  const badges: Partial<Record<WorkspaceTab, number | string>> = {
    slides: deckResults?.slideCount || null,
    social: socialResults?.assetCount || socialResults?.assetIds?.length || null,
    captions: (captionResults?.length) || null,
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
