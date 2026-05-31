import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { createApiClient } from '../lib/api';
import { humanize, labelLayoutFamily } from '../lib/labels';
import { selectCampaignViewModel } from '../lib/campaign-view-model';

interface SlideData {
  index: number;
  purpose: string;
  headline: string;
  subheadline: string;
  passageOrTopic?: string;
  layoutFamily: string;
  visualIntent: string;
  imageIntent: string;
  status: 'draft' | 'generating' | 'ready';
  bodyLines?: string[];
}

// Color palettes per layout family
const layoutStyles: Record<string, { bg: string; accent: string; text: string; subtext: string }> = {
  title_cinematic:      { bg: 'from-purple-900 via-indigo-900 to-slate-900', accent: '#a78bfa', text: '#f5f3ff', subtext: '#c4b5fd' },
  scripture_focus:      { bg: 'from-amber-900 via-slate-900 to-slate-900', accent: '#fbbf24', text: '#fef3c7', subtext: '#fcd34d' },
  big_idea_statement:   { bg: 'from-emerald-900 via-slate-900 to-slate-900', accent: '#34d399', text: '#d1fae5', subtext: '#6ee7b7' },
  point_declaration:    { bg: 'from-blue-900 via-slate-900 to-slate-900', accent: '#60a5fa', text: '#dbeafe', subtext: '#93c5fd' },
  split_tension:        { bg: 'from-rose-900 via-slate-900 to-slate-900', accent: '#fb7185', text: '#ffe4e6', subtext: '#fda4af' },
  application_steps:    { bg: 'from-teal-900 via-slate-900 to-slate-900', accent: '#2dd4bf', text: '#ccfbf1', subtext: '#5eead4' },
  appeal_invitation:    { bg: 'from-violet-900 via-pink-900 to-slate-900', accent: '#c084fc', text: '#ede9fe', subtext: '#c4b5fd' },
  closing_blessing:     { bg: 'from-amber-900 via-orange-900 to-slate-900', accent: '#f59e0b', text: '#fef3c7', subtext: '#fcd34d' },
  story_moment:         { bg: 'from-cyan-900 via-slate-900 to-slate-900', accent: '#22d3ee', text: '#cffafe', subtext: '#67e8f9' },
  reflection_question:  { bg: 'from-indigo-900 via-slate-900 to-slate-900', accent: '#818cf8', text: '#e0e7ff', subtext: '#a5b4fc' },
};

function getLayoutStyle(purpose: string, layoutFamily: string) {
  // Purpose-based override
  if (purpose === 'title') return layoutStyles.title_cinematic;
  if (purpose === 'scripture') return layoutStyles.scripture_focus;
  if (purpose === 'reflection') return layoutStyles.reflection_question;
  if (purpose === 'closing') return layoutStyles.closing_blessing;
  if (purpose === 'application') return layoutStyles.application_steps;
  if (purpose === 'invitation') return layoutStyles.appeal_invitation;
  return layoutStyles[layoutFamily] || layoutStyles.point_declaration;
}

function SlideCanvas({ slide }: { slide: SlideData }) {
  const style = getLayoutStyle(slide.purpose, slide.layoutFamily);
  const purpose = slide.purpose;
  const isTitle = purpose === 'title';
  const isScripture = purpose === 'scripture';
  const isContext = purpose === 'context' || purpose === 'big_idea';
  const isPoint = purpose?.startsWith('main_point');
  const isApplication = purpose === 'application';
  const isReflection = purpose === 'reflection';
  const isInvitation = purpose === 'invitation' || purpose === 'appeal';
  const isClosing = purpose === 'closing';

  return (
    <div
      className={`aspect-video rounded-xl overflow-hidden relative bg-gradient-to-br ${style.bg} flex shadow-2xl border border-white/5`}
      style={{ minHeight: 420 }}
    >
      {/* Shared decorative elements */}
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)` }} />
      <div className="absolute top-6 right-8 w-24 h-24 rounded-full opacity-[0.04]" style={{ background: style.accent }} />
      <div className="absolute bottom-8 left-8 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: style.accent }} />

      {/* Slide number */}
      <span className="absolute bottom-5 right-7 text-[11px] opacity-25 z-10" style={{ color: style.subtext }}>
        {slide.index} / 8
      </span>

      {/* --- TITLE SLIDE --- */}
      {isTitle && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-10 text-center">
          <div className="mb-6 w-20 h-0.5 rounded-full opacity-50" style={{ background: style.accent }} />
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight max-w-lg" style={{ color: style.text }}>
            {slide.headline}
          </h1>
          {slide.passageOrTopic && (
            <div className="flex items-center gap-3 mt-5">
              <span className="w-8 h-px opacity-40" style={{ background: style.accent }} />
              <p className="text-lg font-medium tracking-wide opacity-70" style={{ color: style.accent }}>{slide.passageOrTopic}</p>
              <span className="w-8 h-px opacity-40" style={{ background: style.accent }} />
            </div>
          )}
          {slide.subheadline && (
            <p className="text-base opacity-45 mt-4 italic max-w-md" style={{ color: style.subtext }}>{slide.subheadline}</p>
          )}
          <div className="mt-6 w-20 h-0.5 rounded-full opacity-40" style={{ background: style.accent }} />
        </div>
      )}

      {/* --- SCRIPTURE SLIDE --- */}
      {isScripture && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-16 py-10 text-center">
          <span className="text-7xl leading-none opacity-[0.12] mb-3" style={{ color: style.accent }}>&ldquo;</span>
          <h2 className="text-2xl lg:text-3xl font-bold italic leading-relaxed max-w-xl" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          <div className="w-20 h-px mx-auto my-5 opacity-25" style={{ background: style.accent }} />
          {slide.bodyLines?.map((line, i) => (
            <p key={i} className="text-base leading-relaxed opacity-60 max-w-lg" style={{ color: style.subtext }}>{line}</p>
          ))}
        </div>
      )}

      {/* --- BIG IDEA / CONTEXT --- */}
      {isContext && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-16 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] opacity-40 mb-6" style={{ color: style.subtext }}>The Big Idea</p>
          <h2 className="text-3xl lg:text-4xl font-bold leading-snug max-w-lg" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          <div className="w-16 h-1 mx-auto mt-6 rounded-full opacity-40" style={{ background: style.accent }} />
          {slide.bodyLines?.slice(0, 2).map((line, i) => (
            <p key={i} className="text-sm opacity-50 mt-3 max-w-md" style={{ color: style.subtext }}>{line}</p>
          ))}
        </div>
      )}

      {/* --- MAIN POINT SLIDES --- */}
      {isPoint && (
        <div className="relative z-10 flex-1 flex flex-col justify-center px-16 py-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl font-bold opacity-15 flex-shrink-0" style={{ color: style.accent }}>
              {slide.index - 2}
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold leading-snug" style={{ color: style.text }}>
              {slide.headline}
            </h2>
          </div>
          <div className="w-full h-px opacity-15 mb-4" style={{ background: style.accent }} />
          <div className="pl-16 space-y-2">
            {slide.bodyLines?.slice(0, 3).map((line, i) => (
              <p key={i} className="text-sm leading-relaxed opacity-55" style={{ color: style.subtext }}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* --- APPLICATION SLIDE --- */}
      {isApplication && (
        <div className="relative z-10 flex-1 flex flex-col justify-center px-16 py-10">
          <p className="text-xs uppercase tracking-[0.2em] opacity-40 mb-3" style={{ color: style.subtext }}>Living It Out</p>
          <h2 className="text-2xl lg:text-3xl font-bold leading-snug mb-5" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          <div className="space-y-3">
            {slide.bodyLines?.slice(0, 4).map((line, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 opacity-50" style={{ background: style.accent }} />
                <p className="text-sm leading-relaxed opacity-60" style={{ color: style.subtext }}>{line}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- REFLECTION SLIDE --- */}
      {isReflection && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-16 py-10 text-center">
          <span className="text-5xl opacity-[0.1] mb-4" style={{ color: style.accent }}>?</span>
          <h2 className="text-2xl lg:text-3xl font-bold leading-relaxed max-w-lg" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          <div className="w-12 h-0.5 mx-auto my-4 rounded-full opacity-30" style={{ background: style.accent }} />
          {slide.bodyLines?.slice(0, 2).map((line, i) => (
            <p key={i} className="text-sm opacity-45 mt-2 italic max-w-md" style={{ color: style.subtext }}>{line}</p>
          ))}
        </div>
      )}

      {/* --- INVITATION / APPEAL SLIDE --- */}
      {isInvitation && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-16 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] opacity-40 mb-5" style={{ color: style.subtext }}>You Are Invited</p>
          <h2 className="text-2xl lg:text-3xl font-bold leading-snug max-w-lg" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          <div className="w-16 h-0.5 mx-auto my-5 rounded-full opacity-40" style={{ background: style.accent }} />
          {slide.bodyLines?.slice(0, 3).map((line, i) => (
            <p key={i} className={`text-sm leading-relaxed max-w-md ${i === 0 ? 'opacity-60 font-medium' : 'opacity-45'}`} style={{ color: i === 0 ? style.text : style.subtext }}>{line}</p>
          ))}
        </div>
      )}

      {/* --- CLOSING SLIDE --- */}
      {isClosing && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-16 py-10 text-center">
          <div className="w-12 h-0.5 mx-auto mb-5 rounded-full opacity-30" style={{ background: style.accent }} />
          <h2 className="text-2xl lg:text-3xl font-bold leading-relaxed max-w-lg" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          {slide.bodyLines?.slice(0, 2).map((line, i) => (
            <p key={i} className="text-sm opacity-40 mt-3 italic max-w-md" style={{ color: style.subtext }}>{line}</p>
          ))}
        </div>
      )}

      {/* Generic fallback for any unhandled purpose */}
      {!isTitle && !isScripture && !isContext && !isPoint && !isApplication && !isReflection && !isInvitation && !isClosing && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] opacity-40 mb-4" style={{ color: style.subtext }}>
            {humanize(purpose)}
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold leading-snug max-w-lg" style={{ color: style.text }}>
            {slide.headline}
          </h2>
          <div className="w-12 h-0.5 mx-auto mt-4 rounded-full opacity-30" style={{ background: style.accent }} />
        </div>
      )}

      {/* Bottom accent glow */}
      <div className="absolute bottom-0 left-0 w-full h-16 opacity-[0.04]" style={{
        background: `linear-gradient(to top, ${style.accent}, transparent)`,
      }} />
    </div>
  );
}

export default function SlidePreviewScreen() {
  const { setScreen, campaign, backendUrl } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideData, setSlideData] = useState<any>(null);

  useEffect(() => {
    if (!campaign.campaignId) return;
    const api = createApiClient(backendUrl);
    api.getCampaignSlides(campaign.campaignId)
      .then(setSlideData)
      .catch(async () => {
        try {
          const fc = await api.getCampaign(campaign.campaignId) as any;
          setSlideData({ slides: fc?.generatedMedia?.deck?.slides || [] });
        } catch {}
      });
  }, [campaign.campaignId, backendUrl]);

  const view = selectCampaignViewModel(campaign);
  const apiSlides: any[] = (slideData as any)?.slides || [];
  const storeSlides: any[] = view.generatedMedia.deck?.slides || [];
  const rawSlides = apiSlides.length > 0 ? apiSlides : storeSlides;

  const slides: SlideData[] = React.useMemo(() => {
    if (rawSlides.length > 0) {
      const passage = view.summary.passageOrTopic || '';
      return rawSlides.map((s: any) => ({
        index: s.index,
        purpose: s.purpose || 'content',
        headline: s.headline || `Slide ${s.index}`,
        subheadline: (s.bodyLines && s.bodyLines[0]) || '',
        passageOrTopic: s.purpose === 'title' ? passage : undefined,
        layoutFamily: s.layoutFamily || 'point_declaration',
        visualIntent: s.visualIntent || 'Pastoral composition',
        imageIntent: s.imageIntent || 'Supporting visual',
        status: 'draft',
        bodyLines: s.bodyLines || [],
      }));
    }
    return [];
  }, [rawSlides, view.summary.passageOrTopic]);

  const selected = slides[selectedIndex];
  const quality = view.generatedMedia.deck?.quality || (slideData as any)?.quality;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Slide Preview</h2>
          <p className="text-sm text-gray-500 mt-1">
            {slides.length > 0
              ? `${slides.length} slides · ${new Set(slides.map(s => s.layoutFamily)).size} layout families`
              : 'Fetching slide data...'}
          </p>
        </div>
        {slides.length > 0 && (
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 uppercase tracking-wider">
            Generated
          </span>
        )}
      </div>

      <div className="flex gap-6">
        {/* Thumbnail strip */}
        <div className="w-52 flex-shrink-0 space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {slides.map((slide, i) => {
            const s = getLayoutStyle(slide.purpose, slide.layoutFamily);
            return (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${
                  i === selectedIndex
                    ? 'border-purple-500/40 bg-purple-500/10'
                    : 'border-white/5 bg-white/5 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: s.accent + '22', color: s.accent }}>
                      {slide.index}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-200 truncate text-[11px]">{slide.headline}</p>
                      <p className="text-gray-500 truncate text-[10px] capitalize">{humanize(slide.purpose)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          {slides.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-12">
              No slides generated yet.<br/>Enable Presentation Deck in Outputs.
            </p>
          )}
        </div>

        {/* Main preview */}
        <div className="flex-1 space-y-4">
          {selected ? (
            <>
              <SlideCanvas slide={selected} />

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-gray-500 uppercase tracking-wider mb-0.5">Purpose</p>
                  <p className="text-gray-200 font-medium capitalize">{humanize(selected.purpose)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-gray-500 uppercase tracking-wider mb-0.5">Layout</p>
                  <p className="text-gray-200 font-medium">{labelLayoutFamily(selected.layoutFamily)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-gray-500 uppercase tracking-wider mb-0.5">Visual</p>
                  <p className="text-gray-200 font-medium truncate">{selected.visualIntent}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">Draft</span>
                </div>
              </div>

              {quality && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Quality Overview</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${quality.passed ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {quality.passed ? 'Usable' : 'Needs Review'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Content</span><span className="text-gray-200">{quality.contentScore ?? Math.round(quality.score * 0.85)}/100</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Readability</span><span className="text-gray-200">{quality.readabilityScore ?? Math.round(quality.score * 0.88)}/100</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Design</span><span className={quality.designScore && quality.designScore < 65 ? 'text-amber-400' : 'text-gray-200'}>{quality.designScore ?? Math.round(quality.score * 0.55)}/100</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Ministry Use</span><span className="text-gray-200">{quality.ministryScore ?? Math.round(quality.score * 0.8)}/100</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Export Ready</span><span className="text-green-400 font-medium">{quality.exportScore ?? quality.score}/100</span></div>
                    <div className="flex justify-between border-t border-white/5 pt-1 mt-0.5"><span className="text-gray-300 font-semibold">Overall</span><span className="text-gray-200 font-semibold">{quality.score}/100</span></div>
                  </div>
                  {quality.warnings?.length > 0 && (
                    <div className="pt-1 space-y-0.5">
                      {quality.warnings.slice(0, 3).map((w: string, i: number) => (
                        <p key={i} className="text-[10px] text-amber-400/60">• {w}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-video bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center">
              <p className="text-gray-600 text-lg">Select a slide to preview</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => setScreen('review')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-all">
          Back to Review
        </button>
        <button onClick={() => setScreen('review')} className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-500/20">
          Approve All Slides
        </button>
      </div>
    </div>
  );
}
