import React, { useState } from 'react';
import { useAppStore } from '../lib/store';

export default function ImportScreen() {
  const { setScreen, updateCampaign, campaign, backendUrl } = useAppStore();
  const [text, setText] = useState(campaign.sourceText);
  const [language, setLanguage] = useState(campaign.language);

  const handleContinue = () => {
    updateCampaign({ sourceText: text, sourceName: 'import.txt', language: language as 'en' | 'es' });
    setScreen('analysis');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Import Your Document</h2>
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Paste a sermon outline, event announcement, devotional, or youth message.
        </p>
        <div className="flex gap-1.5">
          {['Sermon','Event','Devotional','Youth'].map((t) => (
            <button key={t}
              onClick={() => {
                const samples: Record<string, string> = {
                  Sermon: `Title: Held by His Hand\nPassage: Psalm 37:23-24\nSermon Outline:\n1. God\'s Delight in You\n2. His Hand Upholds You\n3. Trust His Plan\nMain Message: God guides and upholds His people.`,
                  Event: `Community Fellowship Potluck\nDate: Friday, June 12 at 6:30 PM\nLocation: Fellowship Hall\nBring a dish to share and enjoy fellowship together!`,
                  Devotional: `Strength for the Weary\nPassage: Isaiah 40:31\nBut those who hope in the Lord will renew their strength.`,
                  Youth: `Unshakable — Building Faith That Lasts\nPassage: Matthew 7:24-25\nFriday 7pm — Pizza + Games + Worship`,
                };
                setText(samples[t] || '');
              }}
              className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors border border-white/5">{t}</button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your sermon, event details, campaign brief, or ministry message here..."
        className="w-full h-64 bg-gray-900 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 resize-y"
      />

      <div className="flex items-center gap-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setScreen('welcome')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10">Back</button>
        <button onClick={handleContinue} disabled={!text.trim()} className="px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-semibold transition-all">
          Analyze Document
        </button>
      </div>
    </div>
  );
}
