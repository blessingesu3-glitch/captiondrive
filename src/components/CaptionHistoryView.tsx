import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Send
} from 'lucide-react';
import { CaptionHistoryItem, SocialPlatform } from '../types';

interface CaptionHistoryViewProps {
  history: CaptionHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onOpenPublishModal?: (data: {
    mediaFilename: string;
    mediaThumbnail: string;
    captionText: string;
    platform: SocialPlatform;
  }) => void;
}

export const CaptionHistoryView: React.FC<CaptionHistoryViewProps> = ({
  history,
  onDeleteHistoryItem,
  onOpenPublishModal
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const platforms = ['all', 'Instagram', 'LinkedIn', 'Facebook', 'X'];

  const filteredHistory = history.filter((item) => {
    if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesHook = item.caption_variation.hook.toLowerCase().includes(q);
      const matchesBody = item.caption_variation.body.toLowerCase().includes(q);
      const matchesFile = item.media_filename.toLowerCase().includes(q);
      return matchesHook || matchesBody || matchesFile;
    }
    return true;
  });

  const handleCopy = (item: CaptionHistoryItem) => {
    const text = `${item.caption_variation.hook}\n\n${item.caption_variation.body}\n\n${item.caption_variation.cta || ''}\n\n${item.caption_variation.hashtags?.join(' ') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E6EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#111111] flex items-center gap-2">
            <History className="w-5 h-5 text-[#14137B]" strokeWidth={2} />
            <span>Saved Captions ({history.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review, copy, or publish previously generated captions from your studio archive
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E6EC] flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search generated text or file..."
            className="w-full h-9.5 pl-9 pr-4 text-xs font-semibold rounded-lg bg-[#F5F7FA]/60 border border-[#E2E6EC] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#14137B]"
          />
        </div>

        {/* Platform Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#F5F7FA]/60 border border-[#E2E6EC] w-full sm:w-auto overflow-x-auto">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-white text-[#14137B] shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              {p === 'all' ? 'All Channels' : p}
            </button>
          ))}
        </div>

      </div>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-[#E2E6EC] space-y-3.5"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#E2E6EC] pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#F5F7FA] border border-[#E2E6EC]">
                    <img src={item.media_thumbnail} alt={item.media_filename} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#111111] truncate">
                      {item.media_filename}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="text-[#14137B]">{item.platform}</span>
                      <span>•</span>
                      <span>{item.tone} TONE</span>
                      <span>•</span>
                      <span>{item.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="px-3.5 h-8.5 rounded-lg text-xs font-bold bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#111111] border border-[#E2E6EC] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onOpenPublishModal && (
                    <button
                      onClick={() => {
                        const fullText = `${item.caption_variation.hook}\n\n${item.caption_variation.body}\n\n${item.caption_variation.cta || ''}\n\n${item.caption_variation.hashtags?.join(' ') || ''}`;
                        onOpenPublishModal({
                          mediaFilename: item.media_filename,
                          mediaThumbnail: item.media_thumbnail,
                          captionText: fullText,
                          platform: item.platform
                        });
                      }}
                      className="px-4 h-8.5 rounded-lg text-xs font-bold bg-[#14137B] hover:bg-[#0E0D57] text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer border-none"
                    >
                      <Send className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Post / Schedule</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#14137B] hover:bg-[#EDEDF8] transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Caption Content */}
              <div className="p-4 rounded-xl bg-[#F5F7FA]/50 border border-[#E2E6EC] space-y-2">
                <p className="text-xs font-extrabold text-[#111111]">
                  🪝 {item.caption_variation.hook}
                </p>
                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.caption_variation.body}
                </p>
                {item.caption_variation.cta && (
                  <p className="text-xs font-bold text-[#14137B] pt-1">
                    👉 {item.caption_variation.cta}
                  </p>
                )}
                {item.caption_variation.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.caption_variation.hashtags.map((h, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-[#14137B]">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-gray-400 text-right">
                Created: {new Date(item.created_at).toLocaleString()}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-white border border-dashed border-[#E2E6EC] p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F7FA] text-[#888888] flex items-center justify-center mx-auto border border-[#E2E6EC]">
            <History className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-[#111111]">
            No Saved Captions
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Select an image or video from your library and click Generate Caption to save history here.
          </p>
        </div>
      )}

    </div>
  );
};
