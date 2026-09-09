import React, { useState } from 'react';
import { authedFetch } from '../lib/api';
import { X, Search, Sparkles, ArrowRight, Check } from 'lucide-react';
import { MediaItem } from '../types';

interface SmartSearchModalProps {
  mediaList: MediaItem[];
  onClose: () => void;
  onSelectMatchedMedia: (matched: MediaItem[], queryText: string) => void;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  mediaList,
  onClose,
  onSelectMatchedMedia,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedResults, setMatchedResults] = useState<MediaItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const samplePrompts = [
    'Show my beach photos',
    'Find videos about AI',
    'Find pictures with laptops',
    'Show speaking event photos',
    'Find media with coffee cups',
    'Find travel vibes'
  ];

  const handleRunSearch = async (promptText?: string) => {
    const activeQuery = promptText || query;
    if (!activeQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setMatchedResults([]);

    try {
      const response = await authedFetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeQuery, mediaList })
      });

      const data = await response.json();
      if (data.matched_ids && Array.isArray(data.matched_ids)) {
        const matches = mediaList.filter((m) => data.matched_ids.includes(m.id));
        setMatchedResults(matches);
      }
    } catch (err) {
      console.error('Smart search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyResults = () => {
    onSelectMatchedMedia(matchedResults, query);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-[#EAE6DF] shadow-premium overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <span>Smart Search</span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5]">
                AI Powered
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Search by visual content, mood, objects, and themes
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
            placeholder='e.g. "Show beach photos" or "Videos about AI"'
            className="w-full h-11 pl-4 pr-24 text-xs sm:text-sm rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E94B35] focus:border-[#E94B35]"
          />
          <button
            onClick={() => handleRunSearch()}
            disabled={isSearching || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-[#E94B35] hover:bg-[#D13E29] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Sample Prompt Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Example Queries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setQuery(p);
                  handleRunSearch(p);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-[#F7F3ED]/60 hover:bg-[#FFF1ED] hover:text-[#E94B35] text-gray-700 border border-[#EAE6DF] hover:border-[#FADCD5] transition-colors cursor-pointer"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* Results output */}
        {hasSearched && (
          <div className="pt-3 border-t border-[#EAE6DF] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Results ({matchedResults.length} found)</span>
              {matchedResults.length > 0 && (
                <button
                  onClick={handleApplyResults}
                  className="text-[#E94B35] hover:underline flex items-center gap-1 font-bold cursor-pointer border-none bg-transparent"
                >
                  <span>Filter Library View</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            {matchedResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1 custom-scrollbar">
                {matchedResults.map((m) => (
                  <div 
                    key={m.id}
                    className="group relative rounded-xl overflow-hidden bg-[#F7F3ED] border border-[#EAE6DF] aspect-square"
                  >
                    <img src={m.thumbnail} alt={m.filename} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-95 p-2 flex flex-col justify-end text-white text-[10px]">
                      <span className="font-bold truncate">{m.filename}</span>
                      <span className="text-gray-300 text-[9px] truncate">{m.ai_analysis?.main_subject || m.folder}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 text-center text-xs text-gray-500">
                No files matched your query. Try a broader search term.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
