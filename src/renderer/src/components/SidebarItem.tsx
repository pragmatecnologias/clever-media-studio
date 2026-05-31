import React from 'react';

interface Props {
  icon: string;
  label: string;
  active: boolean;
  badge?: string | number;
  onClick: () => void;
}

export default function SidebarItem({ icon, label, active, badge, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left ${
        active
          ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className="text-sm w-5 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge !== null && (
        <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}
