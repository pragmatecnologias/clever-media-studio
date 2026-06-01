import React, { useEffect, useState } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient, type CampaignAnalysisResult } from '../lib/api';
import {
  CAMPAIGN_TYPE_LABELS, CAMPAIGN_GOAL_LABELS,
  stripLabelPrefix, getConfidenceColor, getConfidenceLabel, labelLanguage, labelOutput,
  TYPE_OPTIONS, GOAL_OPTIONS, OUTPUT_LABELS,
} from '../lib/labels';
import { PRESETS } from '../lib/presets';

export default function AnalysisScreen() {
  const { setScreen, updateCampaign, campaign, backendUrl } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CampaignAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const api = createApiClient(backendUrl);
        const data = await api.analyzeDocument(campaign.sourceText, campaign.language);
        setResult(data);
        setSelectedType(data.detectedType);
        setSelectedGoal(data.campaignGoal);
        // Clean prefix-stripped values
        const cleanTitle = stripLabelPrefix(data.title || '');
        const cleanMessage = stripLabelPrefix(data.mainMessage || '');
        const cleanPassage = stripLabelPrefix(data.passageOrTopic || '');
        const cleanTone = stripLabelPrefix(data.tone || '');
        const cleanCTA = stripLabelPrefix(data.cta || '');
        const cleanAudience = stripLabelPrefix(data.audienceNeed || '');
        updateCampaign({
          campaignType: data.detectedType,
          campaignGoal: data.campaignGoal,
          title: cleanTitle,
          subtitle: data.subtitle || '',
          passageOrTopic: cleanPassage,
          mainMessage: cleanMessage,
          audienceNeed: cleanAudience || '',
          tone: cleanTone || '',
          cta: cleanCTA || '',
          eventDetails: {
            date: data.eventDetails.date || undefined,
            time: data.eventDetails.time || undefined,
            timezone: data.eventDetails.timezone || undefined,
            locationName: data.eventDetails.locationName || undefined,
            address: data.eventDetails.address || undefined,
            website: data.eventDetails.website || undefined,
            phone: data.eventDetails.phone || undefined,
            livestreamUrl: data.eventDetails.livestreamUrl || undefined,
          },
          analysis: data as Record<string, unknown>,
          status: 'analyzed',
        });
      } catch (err: any) {
        setError(err?.message || 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };
    analyze();
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    updateCampaign({ campaignType: type });
  };

  const handleGoalChange = (goal: string) => {
    setSelectedGoal(goal);
    updateCampaign({ campaignGoal: goal });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Analyzing your document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-red-200">Analysis failed</p>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-black/20 p-3 text-xs text-gray-400 space-y-1">
            <p>Backend: <span className="font-mono text-gray-200 break-all">{backendUrl}</span></p>
            <p>Source text is preserved in the import form and campaign state.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                void (async () => {
                  try {
                    const api = createApiClient(backendUrl);
                    const data = await api.analyzeDocument(campaign.sourceText, campaign.language);
                    setResult(data);
                    setSelectedType(data.detectedType);
                    setSelectedGoal(data.campaignGoal);
                    const cleanTitle = stripLabelPrefix(data.title || '');
                    const cleanMessage = stripLabelPrefix(data.mainMessage || '');
                    const cleanPassage = stripLabelPrefix(data.passageOrTopic || '');
                    const cleanTone = stripLabelPrefix(data.tone || '');
                    const cleanCTA = stripLabelPrefix(data.cta || '');
                    const cleanAudience = stripLabelPrefix(data.audienceNeed || '');
                    updateCampaign({
                      campaignType: data.detectedType,
                      campaignGoal: data.campaignGoal,
                      title: cleanTitle,
                      subtitle: data.subtitle || '',
                      passageOrTopic: cleanPassage,
                      mainMessage: cleanMessage,
                      audienceNeed: cleanAudience || '',
                      tone: cleanTone || '',
                      cta: cleanCTA || '',
                      eventDetails: {
                        date: data.eventDetails.date || undefined,
                        time: data.eventDetails.time || undefined,
                        timezone: data.eventDetails.timezone || undefined,
                        locationName: data.eventDetails.locationName || undefined,
                        address: data.eventDetails.address || undefined,
                        website: data.eventDetails.website || undefined,
                        phone: data.eventDetails.phone || undefined,
                        livestreamUrl: data.eventDetails.livestreamUrl || undefined,
                      },
                      analysis: data as Record<string, unknown>,
                      status: 'analyzed',
                    });
                  } catch (err: any) {
                    setError(err?.message || 'Analysis failed');
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold"
            >
              Retry Analysis
            </button>
            <button onClick={() => setScreen('settings')} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-sm">
              Open Settings
            </button>
            <button onClick={() => setScreen('import')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm border border-white/10">
              Back to Import
            </button>
          </div>
        </div>
      </div>
    );
  }

  const confidence = result?.confidence || 0;
  const confidencePct = Math.round(confidence * 100);
  const confColor = getConfidenceColor(confidence);
  const isLowConf = confidence < 0.5;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Analysis Results</h2>

      {/* Confidence and Type/Goal */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full border ${confColor}`}>
            {confidencePct}% &middot; {getConfidenceLabel(confidence)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Campaign Type</label>
            <p className="text-sm text-gray-200 font-medium">{CAMPAIGN_TYPE_LABELS[selectedType] || selectedType}</p>
            {isLowConf && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TYPE_OPTIONS.filter(o => o.value !== selectedType).slice(0, 4).map(o => (
                  <button key={o.value} onClick={() => handleTypeChange(o.value)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 hover:bg-purple-500/20 hover:text-purple-200 transition-colors">
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Goal</label>
            <p className="text-sm text-gray-200 font-medium">{CAMPAIGN_GOAL_LABELS[selectedGoal] || selectedGoal}</p>
            {isLowConf && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {GOAL_OPTIONS.filter(o => o.value !== selectedGoal).slice(0, 4).map(o => (
                  <button key={o.value} onClick={() => handleGoalChange(o.value)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 hover:bg-purple-500/20 hover:text-purple-200 transition-colors">
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Message */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Extracted Message</h3>
        <div className="grid grid-cols-2 gap-4">
          <CleanField label="Title" value={campaign.title} missingText="Add a title" />
          <CleanField label="Passage / Topic" value={campaign.passageOrTopic} />
          <CleanField label="Tone" value={campaign.tone} />
          <CleanField label="CTA" value={campaign.cta} missingText="No CTA found — add in Configure" />
          <div className="col-span-2">
            <CleanField label="Main Message" value={campaign.mainMessage} />
          </div>
          <CleanField label="Audience" value={campaign.audienceNeed} />
          <CleanField label="Language" value={labelLanguage(campaign.language)} />
        </div>
        {/* Key Points / Outline */}
        {result?.keyPoints?.length ? (
          <div className="pt-2 border-t border-white/5">
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Key Points / Outline</label>
            <div className="space-y-1">
              {result.keyPoints.map((kp: string, i: number) => (
                <p key={i} className="text-sm text-gray-300">{i + 1}. {kp}</p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Recommended Outputs */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recommended for {CAMPAIGN_TYPE_LABELS[result?.detectedType || ''] || 'this campaign'}</h3>
        <div className="flex flex-wrap gap-1.5">
          {result?.recommendedOutputs?.map((o: string) => (
            <span key={o} className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">{labelOutput(o) || OUTPUT_LABELS[o]}</span>
          )) || <span className="text-xs text-gray-500">No recommendations</span>}
        </div>
        {/* Suggested preset */}
        {(() => {
          const bestPreset = PRESETS.find(p => p.campaignType === result?.detectedType);
          return bestPreset ? (
            <p className="text-xs text-gray-500">Suggested package: <span className="text-purple-300">{bestPreset.name}</span> — {bestPreset.description}</p>
          ) : null;
        })()}
      </div>

      {/* Missing Details */}
      {(() => {
        const missing: string[] = [];
        if (!campaign.cta && (result?.campaignGoal === 'invite_attendance' || result?.campaignGoal === 'announce_event')) missing.push('CTA — invitation campaigns need a clear call to action');
        const ev = result?.eventDetails || {};
        const hasEventDetails = ev.date || ev.time || ev.locationName || ev.address;
        if (['invite_attendance', 'announce_event', 'promote_livestream'].includes(result?.campaignGoal || '') && !hasEventDetails) {
          if (!ev.date) missing.push('Date/time — add in Configure for clearer invitations');
          if (!ev.locationName) missing.push('Location — add in Configure');
        }
        return missing.length > 0 ? (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Missing Details</h3>
            {missing.map((m, i) => <p key={i} className="text-amber-400/70 text-xs">• {m} <span className="text-amber-400/40">(add in Configure)</span></p>)}
          </div>
        ) : null;
      })()}

      {/* Event details if present */}
      {(() => {
        const ed = result?.eventDetails;
        const hasAny = ed && (ed.date || ed.time || ed.locationName || ed.address || ed.website || ed.livestreamUrl);
        return hasAny ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Event Details</h3>
            <div className="grid grid-cols-3 gap-3">
              {ed.date && <CleanField label="Date" value={ed.date} />}
              {ed.time && <CleanField label="Time" value={ed.time} />}
              {ed.locationName && <CleanField label="Location" value={ed.locationName} />}
              {ed.timezone && <CleanField label="Timezone" value={ed.timezone} />}
              {ed.address && <CleanField label="Address" value={ed.address} />}
              {ed.website && <CleanField label="Website" value={ed.website} />}
              {ed.livestreamUrl && <CleanField label="Livestream" value={ed.livestreamUrl} />}
            </div>
          </div>
        ) : null;
      })()}

      {/* Warnings */}
      {result?.warnings?.length ? (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-300 text-sm font-semibold mb-2">Warnings</p>
          {result.warnings.map((w, i) => <p key={i} className="text-amber-400/70 text-xs">• {w}</p>)}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button onClick={() => setScreen('import')} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Back</button>
        <button onClick={() => setScreen('configure')} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold">Continue to Configure</button>
      </div>
    </div>
  );
}

function CleanField({ label, value, missingText }: { label: string; value?: string | null; missingText?: string }) {
  const clean = stripLabelPrefix(value || '');
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-wider block">{label}</label>
      {clean ? (
        <p className="text-sm text-gray-200 mt-1">{clean}</p>
      ) : (
        <span className="text-xs text-gray-600 italic mt-1 block">{missingText || 'Not found'}</span>
      )}
    </div>
  );
}
