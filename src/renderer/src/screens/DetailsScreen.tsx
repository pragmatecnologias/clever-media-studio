import React from 'react';
import { useAppStore } from '../lib/store';

const campaignTypes = ['sermon','church_event','bible_study','devotional','announcement','youth_program','prayer_meeting','evangelistic_meeting','funeral_memorial','wedding_family','community_outreach','general_campaign','custom'];
const campaignGoals = ['invite_attendance','promote_livestream','share_devotional','announce_event','recap_event','teach_topic','encourage_response','custom'];

export default function DetailsScreen() {
  const { setScreen, updateCampaign, campaign } = useAppStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Campaign Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Campaign Type" value={campaign.campaignType} onChange={(v) => updateCampaign({ campaignType: v })} options={campaignTypes} />
        <SelectField label="Campaign Goal" value={campaign.campaignGoal} onChange={(v) => updateCampaign({ campaignGoal: v })} options={campaignGoals} />
        <InputField label="Title" value={campaign.title} onChange={(v) => updateCampaign({ title: v })} />
        <InputField label="Subtitle" value={campaign.subtitle} onChange={(v) => updateCampaign({ subtitle: v })} />
        <InputField label="Passage/Topic" value={campaign.passageOrTopic} onChange={(v) => updateCampaign({ passageOrTopic: v })} />
        <InputField label="Audience" value={campaign.audienceNeed} onChange={(v) => updateCampaign({ audienceNeed: v })} />
        <InputField label="Tone" value={campaign.tone} onChange={(v) => updateCampaign({ tone: v })} />
        <InputField label="CTA" value={campaign.cta} onChange={(v) => updateCampaign({ cta: v })} />
      </div>

      <h3 className="text-lg font-semibold pt-4">Event Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Date" value={campaign.eventDetails.date || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, date: v } })} />
        <InputField label="Time" value={campaign.eventDetails.time || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, time: v } })} />
        <InputField label="Timezone Label" value={campaign.eventDetails.timezoneLabel || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, timezoneLabel: v } })} />
        <InputField label="Location" value={campaign.eventDetails.locationName || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, locationName: v } })} />
        <InputField label="Address" value={campaign.eventDetails.address || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, address: v } })} />
        <InputField label="Website" value={campaign.eventDetails.website || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, website: v } })} />
        <InputField label="Livestream URL" value={campaign.eventDetails.livestreamUrl || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, livestreamUrl: v } })} />
        <InputField label="Phone" value={campaign.eventDetails.phone || ''} onChange={(v) => updateCampaign({ eventDetails: { ...campaign.eventDetails, phone: v } })} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => setScreen('analysis')} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Back</button>
        <button onClick={() => setScreen('style')} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold">Choose Visual Style</button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-wider block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 mt-1" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-wider block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
  );
}
