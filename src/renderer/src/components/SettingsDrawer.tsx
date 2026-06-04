import React from 'react';
import { useAppStore } from '../lib/store';
import { TYPE_OPTIONS, GOAL_OPTIONS, SOCIAL_MODE_LABELS } from '../lib/labels';

export default function SettingsDrawer() {
  const { drawerOpen, toggleDrawer, campaign, updateCampaign } = useAppStore();
  const adv = campaign.advancedSettings;
  const churchKit = adv.churchKit || {};

  if (!drawerOpen) return null;

  const update = (partial: Partial<typeof adv>) => {
    updateCampaign({ advancedSettings: { ...adv, ...partial } });
  };

  const updateChurchKit = (partial: Record<string, unknown>) => {
    update({
      churchKit: {
        ...churchKit,
        ...partial,
      } as any,
    });
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateChurchKit({ logoPath: String(reader.result || '') });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-20" onClick={toggleDrawer} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-white/10 z-30 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Advanced Settings</h3>
          <button onClick={toggleDrawer} className="text-gray-500 hover:text-gray-300 text-lg">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Campaign Strategy */}
          <Section title="Campaign Strategy">
            <SelectField label="Type" value={campaign.campaignType}
              onChange={(v) => updateCampaign({ campaignType: v })}
              options={TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
            <SelectField label="Goal" value={campaign.campaignGoal}
              onChange={(v) => updateCampaign({ campaignGoal: v })}
              options={GOAL_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
            <InputField label="Tone" value={campaign.tone} onChange={(v) => updateCampaign({ tone: v })} />
            <InputField label="CTA" value={campaign.cta} onChange={(v) => updateCampaign({ cta: v })} />
          </Section>

          {/* Church Kit */}
          <Section title="Church Kit">
            <InputField label="Church Name" value={churchKit.churchName || ''} onChange={(v) => updateChurchKit({ churchName: v })} />
            <InputField label="Short Name" value={churchKit.shortName || ''} onChange={(v) => updateChurchKit({ shortName: v })} />
            <InputField label="Address" value={churchKit.address || ''} onChange={(v) => updateChurchKit({ address: v })} />
            <InputField label="Website" value={churchKit.website || ''} onChange={(v) => updateChurchKit({ website: v })} />
            <InputField label="Phone" value={churchKit.phone || ''} onChange={(v) => updateChurchKit({ phone: v })} />
            <InputField label="Livestream URL" value={churchKit.livestreamUrl || ''} onChange={(v) => updateChurchKit({ livestreamUrl: v })} />
            <InputField label="Default Service Time" value={churchKit.defaultServiceTime || ''} onChange={(v) => updateChurchKit({ defaultServiceTime: v })} />
            <InputField label="Default CTA" value={churchKit.defaultCTA || ''} onChange={(v) => updateChurchKit({ defaultCTA: v })} />
            <InputField label="Typography Preset" value={churchKit.typographyPreset || ''} onChange={(v) => updateChurchKit({ typographyPreset: v })} placeholder="modern_pastoral" />
            <InputField label="Logo Data URL or Path" value={churchKit.logoPath || ''} onChange={(v) => updateChurchKit({ logoPath: v })} />
            <label className="block text-[10px] text-gray-500">
              Logo file
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void handleLogoUpload(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-[10px] text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-gray-200 hover:file:bg-white/15"
              />
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <InputField label="Primary" value={churchKit.brandColors?.primary || ''} onChange={(v) => updateChurchKit({ brandColors: { ...(churchKit.brandColors || {}), primary: v } })} />
              <InputField label="Secondary" value={churchKit.brandColors?.secondary || ''} onChange={(v) => updateChurchKit({ brandColors: { ...(churchKit.brandColors || {}), secondary: v } })} />
              <InputField label="Accent" value={churchKit.brandColors?.accent || ''} onChange={(v) => updateChurchKit({ brandColors: { ...(churchKit.brandColors || {}), accent: v } })} />
            </div>
            <SelectField label="Logo Display" value={churchKit.logoDisplayPreference || 'show'}
              onChange={(v) => updateChurchKit({ logoDisplayPreference: v })}
              options={[
                { value: 'show', label: 'Show' },
                { value: 'footer_only', label: 'Footer only' },
                { value: 'hide', label: 'Hide' },
              ]} />
            <SelectField label="Contact Display" value={churchKit.contactDisplayPreference || 'minimal'}
              onChange={(v) => updateChurchKit({ contactDisplayPreference: v })}
              options={[
                { value: 'minimal', label: 'Minimal' },
                { value: 'show_address', label: 'Address' },
                { value: 'show_website', label: 'Website' },
                { value: 'show_phone', label: 'Phone' },
              ]} />
          </Section>

          {/* Deck */}
          <Section title="Deck Settings">
            <SelectField label="Deck Type" value={adv.deckType}
              onChange={(v) => update({ deckType: v })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'sermon_presentation', label: 'Sermon Presentation' },
                { value: 'teaching_deck', label: 'Teaching Deck' },
                { value: 'event_announcement', label: 'Event Announcement' },
              ]} />
            <SelectField label="Slide Count" value={String(adv.targetSlideCount)}
              onChange={(v) => update({ targetSlideCount: v === 'auto' ? 'auto' : Number(v) })}
              options={[
                { value: 'auto', label: 'Auto' }, { value: '6', label: '6' },
                { value: '8', label: '8' }, { value: '10', label: '10' }, { value: '12', label: '12' },
              ]} />
            <ToggleRow label="Show Logo" checked={adv.showLogo} onChange={() => update({ showLogo: !adv.showLogo })} />
            <ToggleRow label="Show Address" checked={adv.showAddress} onChange={() => update({ showAddress: !adv.showAddress })} />
            <ToggleRow label="Show Website" checked={adv.showWebsite} onChange={() => update({ showWebsite: !adv.showWebsite })} />
            <ToggleRow label="Show Phone" checked={adv.showPhone} onChange={() => update({ showPhone: !adv.showPhone })} />
            <ToggleRow label="Show Service Time" checked={adv.showServiceTime} onChange={() => update({ showServiceTime: !adv.showServiceTime })} />
          </Section>

          {/* Social Pack */}
          <Section title="Social Pack">
            <SelectField label="Mode" value={adv.socialPackMode}
              onChange={(v) => update({ socialPackMode: v as any })}
              options={Object.entries(SOCIAL_MODE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <CheckboxGroup label="Platforms" selected={adv.platforms}
              options={['instagram', 'facebook', 'whatsapp', 'youtube', 'x']}
              onChange={(v) => update({ platforms: v })} />
          </Section>

          {/* Image Settings */}
          <Section title="Image Settings">
            <SelectField label="Provider" value={adv.imageProvider}
              onChange={(v) => update({ imageProvider: v as any })}
              options={[
                { value: 'auto', label: 'Auto' }, { value: 'fal', label: 'FAL.AI' },
                { value: 'openai', label: 'OpenAI' }, { value: 'local', label: 'Local / Mock' },
              ]} />
            <InputField label="Visual Style" value={adv.visualStyle}
              onChange={(v) => update({ visualStyle: v })} placeholder="auto" />
          </Section>

          {/* Export */}
          <Section title="Export">
            <CheckboxGroup label="Formats" selected={adv.exportFormats}
              options={['pptx', 'pdf', 'png', 'jpg', 'json', 'txt', 'md', 'zip']}
              onChange={(v) => update({ exportFormats: v })} />
            <ToggleRow label="Include Source" checked={adv.includeSource} onChange={() => update({ includeSource: !adv.includeSource })} />
            <ToggleRow label="Include Metadata" checked={adv.includeMetadata} onChange={() => update({ includeMetadata: !adv.includeMetadata })} />
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group" open>
      <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300 mb-2">
        {title}
      </summary>
      <div className="space-y-2 pl-1">{children}</div>
    </details>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 block mb-0.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-200" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 block mb-0.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-200">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between py-0.5 cursor-pointer">
      <span className="text-[10px] text-gray-400">{label}</span>
      <button onClick={onChange}
        className={`w-7 h-4 rounded-full transition-colors relative ${checked ? 'bg-purple-500' : 'bg-white/20'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-3.5' : 'left-0.5'}`} />
      </button>
    </label>
  );
}

function CheckboxGroup({ label, selected, options, onChange }: { label: string; selected: string[]; options: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div>
      <label className="text-[10px] text-gray-500 block mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)}
            className={`text-[10px] px-2 py-0.5 rounded capitalize transition-colors ${
              selected.includes(opt) ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40' : 'bg-white/5 text-gray-500 border border-white/10'
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
