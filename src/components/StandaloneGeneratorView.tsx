import React, { useState, useEffect } from 'react';
import { authedFetch } from '../lib/api';
import { 
  FileImage, 
  Video, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Send, 
  Bookmark,
  ChevronLeft,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { MediaItem, CaptionSettings, CaptionVariation, SocialPlatform, CaptionTone, CaptionLength, TargetAudience } from '../types';

interface StandaloneGeneratorViewProps {
  mediaItems: MediaItem[];
  onSaveToHistory: (media: MediaItem, settings: CaptionSettings, variation: CaptionVariation) => void;
  onOpenPublishModal: (data: {
    mediaFilename: string;
    mediaThumbnail: string;
    captionText: string;
    platform: SocialPlatform;
    tone?: string;
  }) => void;
  onOpenImportModal: () => void;
  onLimitReached?: () => void;
  onUpdateUsage?: (usage: any) => void;
}

export const StandaloneGeneratorView: React.FC<StandaloneGeneratorViewProps> = ({
  mediaItems,
  onSaveToHistory,
  onOpenPublishModal,
  onOpenImportModal,
  onLimitReached,
  onUpdateUsage
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  
  // Generator settings
  const [settings, setSettings] = useState<CaptionSettings>({
    platform: 'Instagram',
    tone: 'Storytelling',
    length: 'Medium',
    target_audience: 'General audience',
    custom_notes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<CaptionVariation[]>([]);
  const [activeVariationIdx, setActiveVariationIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editedText, setEditedText] = useState('');

  const platforms: SocialPlatform[] = ['Instagram', 'LinkedIn', 'Facebook', 'X'];
  const tones: CaptionTone[] = ['Storytelling', 'Educational', 'Promotional', 'Inspirational', 'Casual', 'Professional', 'Humorous'];
  const lengths: CaptionLength[] = ['Short', 'Medium', 'Long'];
  const audiences: TargetAudience[] = ['General audience', 'Creators', 'Business owners', 'Entrepreneurs', 'Students'];

  const handleGenerate = async () => {
    if (!selectedMedia) return;
    setIsGenerating(true);
    setCopied(false);
    setSaved(false);
    
    try {
      const response = await authedFetch('/api/ai/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: selectedMedia, settings })
      });
      const data = await response.json();

      if (data.usage && onUpdateUsage) {
        onUpdateUsage(data.usage);
      }

      if (data.limitReached || response.status === 403) {
        if (onLimitReached) onLimitReached();
        return;
      }

      if (data.success && data.variations?.length) {
        setVariations(data.variations);
        setActiveVariationIdx(0);
        const firstVar = data.variations[0];
        setEditedText(`${firstVar.hook}\n\n${firstVar.body}${firstVar.cta ? `\n\n${firstVar.cta}` : ''}${firstVar.hashtags ? `\n\n${firstVar.hashtags.join(' ')}` : ''}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariation = (idx: number) => {
    setActiveVariationIdx(idx);
    const selectedVar = variations[idx];
    if (selectedVar) {
      setEditedText(`${selectedVar.hook}\n\n${selectedVar.body}${selectedVar.cta ? `\n\n${selectedVar.cta}` : ''}${selectedVar.hashtags ? `\n\n${selectedVar.hashtags.join(' ')}` : ''}`);
    }
  };

  const handleSave = () => {
    if (!selectedMedia || !variations[activeVariationIdx]) return;
    // Extract variation details or save the edited text
    const lines = editedText.split('\n\n');
    const hook = lines[0] || '';
    const body = lines.slice(1, lines.length - 1).join('\n\n') || '';
    const cta = lines[lines.length - 1] || '';
    
    const varToSave: CaptionVariation = {
      id: variations[activeVariationIdx].id || 'var_custom',
      style_title: variations[activeVariationIdx].style_title || 'Customized Caption',
      hook: hook,
      body: body,
      cta: cta,
      hashtags: []
    };

    onSaveToHistory(selectedMedia, settings, varToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    if (!selectedMedia) return;
    onOpenPublishModal({
      mediaFilename: selectedMedia.filename,
      mediaThumbnail: selectedMedia.thumbnail,
      captionText: editedText,
      platform: settings.platform,
      tone: settings.tone
    });
  };

  // Auto-generate if selectedMedia changes
  useEffect(() => {
    if (selectedMedia) {
      handleGenerate();
    }
  }, [selectedMedia]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#E2E6EC] pb-4">
        <div>
          <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
            Caption Studio
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate and tailor social copy with Google Gemini AI.
          </p>
        </div>

        {selectedMedia && (
          <button
            onClick={() => {
              setSelectedMedia(null);
              setVariations([]);
              setEditedText('');
            }}
            className="px-4 h-9.5 rounded-full text-xs font-bold bg-[#FFFFFF] hover:bg-[#F5F7FA] text-gray-700 border border-[#E2E6EC] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Select Another Asset</span>
          </button>
        )}
      </div>

      {/* STATE 1: ASSET SELECTION GRID */}
      {!selectedMedia ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Select media from your library
            </h2>
            <button
              onClick={onOpenImportModal}
              className="px-4 h-9 rounded-full text-xs font-bold bg-[#14137B] hover:bg-[#0E0D57] text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Media</span>
            </button>
          </div>

          {mediaItems.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-dashed border-[#E2E6EC] text-xs text-gray-400">
              Your library is currently empty. Connect Google Drive or upload local assets to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="group bg-white rounded-2xl border border-[#E2E6EC] overflow-hidden shadow-xs hover:border-[#14137B] transition-all-fast cursor-pointer flex flex-col justify-between"
                >
                  <div className="aspect-square w-full relative overflow-hidden bg-[#FAF8F5]">
                    <img src={item.thumbnail} alt={item.filename} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-white/95 text-[#111111] text-[8px] font-bold uppercase tracking-wider shadow-sm border border-[#E2E6EC]">
                      {item.file_type}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="text-xs font-bold text-[#111111] truncate">{item.filename}</p>
                    <p className="text-[9px] font-medium text-gray-400 uppercase mt-0.5">{item.folder}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STATE 2: THREE-COLUMN CAPTION STUDIO WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* COLUMN 1: MEDIA PREVIEW (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E2E6EC] flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Media Preview</span>
              
              {/* Image box with rounded corners */}
              <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F7FA] relative border border-[#E2E6EC]">
                <img 
                  src={selectedMedia.thumbnail} 
                  alt={selectedMedia.filename}
                  className="w-full h-full object-cover"
                />
                
                {/* Format Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono uppercase flex items-center gap-1">
                    {selectedMedia.file_type === 'video' ? <Video className="w-2.5 h-2.5 text-[#14137B]" /> : <FileImage className="w-2.5 h-2.5 text-[#14137B]" />}
                    <span>{selectedMedia.file_type}</span>
                  </span>
                </div>
              </div>

              {/* Media description */}
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-[#111111] truncate">{selectedMedia.filename}</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase">{selectedMedia.folder}</p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: CAPTION EDITOR (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-white border border-[#E2E6EC] flex flex-col gap-4 flex-1">
              
              {/* Writer Header with Version Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E6EC] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Write your caption
                </h3>

                {/* AI variations switcher */}
                {variations.length > 0 && (
                  <div className="flex items-center gap-1">
                    {variations.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectVariation(idx)}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                          activeVariationIdx === idx
                            ? 'bg-[#14137B] text-white shadow-sm'
                            : 'bg-[#F5F7FA] text-gray-600 hover:bg-[#E2E6EC]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Editor */}
              <div className="flex-1 flex flex-col">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Generating copywriting..."
                  disabled={isGenerating}
                  rows={10}
                  className="w-full flex-1 p-4 rounded-xl bg-[#F5F7FA]/50 border border-[#E2E6EC] text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#14137B] focus:ring-1 focus:ring-[#14137B] resize-none leading-relaxed custom-scrollbar disabled:opacity-50"
                />
                
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2.5">
                  <span>{editedText.length} characters</span>
                  <span>Select dropdowns below to customize tone.</span>
                </div>
              </div>

              {/* Preference Row Dropdowns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E2E6EC]">
                {/* Platform */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Platform</label>
                  <select
                    value={settings.platform}
                    onChange={(e) => setSettings((prev) => ({ ...prev, platform: e.target.value as SocialPlatform }))}
                    className="w-full px-2.5 h-8.5 rounded-lg bg-[#F5F7FA] border border-[#E2E6EC] text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#14137B]"
                  >
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Tone */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tone</label>
                  <select
                    value={settings.tone}
                    onChange={(e) => setSettings((prev) => ({ ...prev, tone: e.target.value as CaptionTone }))}
                    className="w-full px-2.5 h-8.5 rounded-lg bg-[#F5F7FA] border border-[#E2E6EC] text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#14137B]"
                  >
                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Length */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Length</label>
                  <select
                    value={settings.length}
                    onChange={(e) => setSettings((prev) => ({ ...prev, length: e.target.value as CaptionLength }))}
                    className="w-full px-2.5 h-8.5 rounded-lg bg-[#F5F7FA] border border-[#E2E6EC] text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#14137B]"
                  >
                    {lengths.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Audience */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Audience</label>
                  <select
                    value={settings.target_audience}
                    onChange={(e) => setSettings((prev) => ({ ...prev, target_audience: e.target.value as TargetAudience }))}
                    className="w-full px-2.5 h-8.5 rounded-lg bg-[#F5F7FA] border border-[#E2E6EC] text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#14137B]"
                  >
                    {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-4.5 h-10 rounded-xl text-xs font-bold bg-[#F5F7FA] hover:bg-[#E2E6EC] text-gray-700 border border-[#E2E6EC] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3.5 h-10 rounded-xl text-xs font-bold bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#111111] border border-[#E2E6EC] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="px-5 h-10 rounded-xl text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer border-none"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{saved ? 'Saved' : 'Save Caption'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 3: PUBLISHING READY/STATUS (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-white border border-[#E2E6EC] flex flex-col gap-5 flex-1">
              <h3 className="font-display text-lg font-black text-[#111111] tracking-tight flex items-center gap-2">
                <Send className="w-4 h-4 text-[#14137B]" />
                <span>Ready to post?</span>
              </h3>

              {/* Checklist */}
              <div className="space-y-3.5 flex-1">
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#66D100] fill-[#EDF9DC]" strokeWidth={2} />
                  <span className="font-semibold">Caption generated</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#66D100] fill-[#EDF9DC]" strokeWidth={2} />
                  <span className="font-semibold">Media selected</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#66D100] fill-[#EDF9DC]" strokeWidth={2} />
                  <span className="font-semibold">Platform set</span>
                </div>
              </div>

              {/* Trigger Scheduling Actions */}
              <div className="space-y-2 pt-4 border-t border-[#E2E6EC]">
                <button
                  onClick={handlePublish}
                  className="w-full h-11 rounded-xl text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer border-none"
                >
                  <span>Schedule Post →</span>
                </button>
                <button
                  onClick={handleSave}
                  className="w-full h-10 rounded-xl text-xs font-bold bg-[#FFFFFF] hover:bg-[#F5F7FA] text-gray-700 border border-[#E2E6EC] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>Save Draft</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
