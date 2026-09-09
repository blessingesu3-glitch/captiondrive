import React, { useState, useEffect } from 'react';
import { authedFetch } from '../lib/api';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  BookmarkCheck, 
  Send, 
  FileImage, 
  Video
} from 'lucide-react';
import { 
  MediaItem, 
  SocialPlatform, 
  CaptionTone, 
  CaptionLength, 
  TargetAudience, 
  CaptionSettings, 
  CaptionVariation 
} from '../types';

interface CaptionGeneratorModalProps {
  media: MediaItem;
  onClose: () => void;
  onSaveToHistory: (
    media: MediaItem, 
    settings: CaptionSettings, 
    variation: CaptionVariation
  ) => void;
  onOpenPublishModal?: (data: {
    mediaFilename: string;
    mediaThumbnail: string;
    captionText: string;
    platform: SocialPlatform;
  }) => void;
  onLimitReached?: () => void;
  onUpdateUsage?: (usage: any) => void;
}

export const CaptionGeneratorModal: React.FC<CaptionGeneratorModalProps> = ({
  media,
  onClose,
  onSaveToHistory,
  onOpenPublishModal,
  onLimitReached,
  onUpdateUsage
}) => {
  const isVideo = media.file_type === 'video';

  // Settings State
  const [settings, setSettings] = useState<CaptionSettings>({
    platform: 'Instagram',
    tone: 'Inspirational',
    length: 'Medium',
    target_audience: 'Creators',
    custom_notes: ''
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [variations, setVariations] = useState<CaptionVariation[]>([]);
  const [activeVariationIdx, setActiveVariationIdx] = useState<number>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedIdx, setSavedIdx] = useState<number | null>(null);
  
  // Editable state for active variation
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedBody, setEditedBody] = useState<string>('');

  const platforms: SocialPlatform[] = ['Instagram', 'LinkedIn', 'Facebook', 'X'];
  const tones: CaptionTone[] = [
    'Storytelling', 
    'Educational', 
    'Promotional', 
    'Inspirational', 
    'Professional', 
    'Casual', 
    'Humorous'
  ];
  const lengths: CaptionLength[] = ['Short', 'Medium', 'Long'];
  const audiences: TargetAudience[] = [
    'Business owners', 
    'Entrepreneurs', 
    'Students', 
    'Creators', 
    'General audience'
  ];

  // Call API to generate captions using Gemini
  const handleGenerateCaptions = async () => {
    setIsGenerating(true);
    setVariations([]);
    setIsEditing(false);
    try {
      const response = await authedFetch('/api/ai/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media, settings })
      });

      const data = await response.json();

      if (data.usage && onUpdateUsage) {
        onUpdateUsage(data.usage);
      }

      if (data.limitReached || response.status === 403) {
        onClose();
        if (onLimitReached) onLimitReached();
        return;
      }

      if (data.success && data.variations?.length) {
        setVariations(data.variations);
        setActiveVariationIdx(0);
        setEditedBody(data.variations[0]?.body || '');
      } else {
        alert('Failed to generate captions: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Error generating captions:', err);
      alert('Error connecting to caption server.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate captions when modal opens
  useEffect(() => {
    handleGenerateCaptions();
  }, []);

  const currentVar = variations[activeVariationIdx];

  const handleCopy = (variation: CaptionVariation, idx: number) => {
    const fullText = `${variation.hook}\n\n${isEditing && idx === activeVariationIdx ? editedBody : variation.body}\n\n${variation.cta}\n\n${variation.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const handleSave = (variation: CaptionVariation, idx: number) => {
    const varToSave = {
      ...variation,
      body: isEditing && idx === activeVariationIdx ? editedBody : variation.body
    };
    onSaveToHistory(media, settings, varToSave);
    setSavedIdx(idx);
    setTimeout(() => setSavedIdx(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#111111]/30 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl border border-[#EAE6DF] shadow-premium overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE6DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1ED] flex items-center justify-center text-[#E94B35] font-bold shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <span>AI Caption Studio</span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5]">
                  Gemini Vision
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Tailor platform-native captions based on visual media context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors cursor-pointer border border-[#EAE6DF]"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body: Split view */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* Left Column: Preferences Controls */}
          <div className="w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-[#EAE6DF] space-y-5 bg-[#F7F3ED]/40">
            
            {/* Selected Media Preview Snippet */}
            <div className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] flex items-center gap-3.5 shadow-xs">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#F7F3ED] border border-[#EAE6DF]">
                <img src={media.thumbnail} alt={media.filename} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 p-0.5 rounded bg-[#111111]/80 text-white text-[9px]">
                  {isVideo ? <Video className="w-2.5 h-2.5 text-[#E94B35]" strokeWidth={2} /> : <FileImage className="w-2.5 h-2.5 text-[#E94B35]" strokeWidth={2} />}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#111111] truncate">
                  {media.filename}
                </h4>
                <p className="text-[10px] text-gray-450 truncate mt-0.5">
                  Folder: {media.folder}
                </p>
                {media.ai_analysis?.mood && (
                  <span className="inline-block text-[10px] font-bold text-[#E94B35] mt-0.5 uppercase tracking-wide">
                    Mood: {media.ai_analysis.mood}
                  </span>
                )}
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                1. Target Platform
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSettings((prev) => ({ ...prev, platform: p }))}
                    className={`py-2 px-1 rounded-lg text-xs font-bold text-center transition-all cursor-pointer border ${
                      settings.platform === p
                        ? 'bg-[#E94B35] text-white border-[#E94B35] shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-[#F7F3ED] border-[#EAE6DF]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                2. Caption Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSettings((prev) => ({ ...prev, tone: t }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold text-left truncate transition-all cursor-pointer border ${
                      settings.tone === t
                        ? 'bg-[#FFF1ED] text-[#E94B35] border-[#FADCD5]'
                        : 'bg-white text-gray-600 hover:bg-[#F7F3ED] border-[#EAE6DF]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length & Target Audience */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                  Length
                </label>
                <select
                  value={settings.length}
                  onChange={(e) => setSettings((prev) => ({ ...prev, length: e.target.value as CaptionLength }))}
                  className="w-full px-2.5 h-9 text-xs font-bold rounded-lg bg-white border border-[#EAE6DF] text-[#111111] focus:outline-none focus:border-[#E94B35]"
                >
                  {lengths.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                  Audience
                </label>
                <select
                  value={settings.target_audience}
                  onChange={(e) => setSettings((prev) => ({ ...prev, target_audience: e.target.value as TargetAudience }))}
                  className="w-full px-2.5 h-9 text-xs font-bold rounded-lg bg-white border border-[#EAE6DF] text-[#111111] focus:outline-none focus:border-[#E94B35]"
                >
                  {audiences.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Notes optional */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={settings.custom_notes || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, custom_notes: e.target.value }))}
                placeholder="e.g. Include launch offer discount code or keep call to action brief..."
                rows={2}
                className="w-full p-3 text-xs rounded-lg bg-white border border-[#EAE6DF] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] resize-none"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateCaptions}
              disabled={isGenerating}
              className="w-full h-10.5 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer border-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Captions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" strokeWidth={2} />
                  <span>Generate Captions</span>
                </>
              )}
            </button>

          </div>

          {/* Right Column: Generated Variations Output */}
          <div className="w-full lg:w-7/12 p-6 flex flex-col justify-between bg-white space-y-4 min-h-[400px]">
            
            {variations.length > 0 ? (
              <div className="space-y-4 flex-1 flex flex-col">
                
                {/* Variations Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#F7F3ED]/60 border border-[#EAE6DF]">
                  {variations.map((v, idx) => (
                    <button
                      key={v.id || idx}
                      onClick={() => {
                        setActiveVariationIdx(idx);
                        setEditedBody(v.body);
                        setIsEditing(false);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeVariationIdx === idx
                          ? 'bg-white text-[#E94B35] shadow-xs'
                          : 'text-gray-500 hover:text-[#111111]'
                      }`}
                    >
                      <span>Variation {idx + 1}</span>
                    </button>
                  ))}
                </div>

                {/* Active Caption Card */}
                {currentVar && (
                  <div className="flex-1 p-5 rounded-2xl bg-[#F7F3ED]/30 border border-[#EAE6DF] flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-3.5">
                      
                      {/* Variation Style Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#E94B35] bg-[#FFF1ED] px-3 py-1 rounded-md uppercase tracking-wider border border-[#FADCD5]">
                          {currentVar.style_title || `Variation ${activeVariationIdx + 1}`}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (!isEditing) setEditedBody(currentVar.body);
                              setIsEditing(!isEditing);
                            }}
                            className="text-xs font-bold text-gray-650 hover:text-[#E94B35] flex items-center gap-1 px-3 py-1 rounded bg-white border border-[#EAE6DF] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{isEditing ? 'Save' : 'Edit'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Hook Box */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                          Scroll-Stopping Hook
                        </span>
                        <p className="text-xs font-bold text-[#111111] leading-relaxed">
                          {currentVar.hook}
                        </p>
                      </div>

                      {/* Main Caption Body */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                          Main Caption Body
                        </span>
                        
                        {isEditing ? (
                          <textarea
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            rows={6}
                            className="w-full p-3.5 text-xs rounded-xl bg-white border border-[#E94B35] text-[#111111] focus:outline-none resize-none leading-relaxed"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-white border border-[#EAE6DF] text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto custom-scrollbar">
                            {currentVar.body}
                          </div>
                        )}
                      </div>

                      {/* CTA Box */}
                      {currentVar.cta && (
                        <div className="p-3 rounded-xl bg-white border border-[#EAE6DF] space-y-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#E94B35] block">
                            Call to Action
                          </span>
                          <p className="text-xs font-bold text-[#111111]">
                            👉 {currentVar.cta}
                          </p>
                        </div>
                      )}

                      {/* Hashtag Badges */}
                      {currentVar.hashtags && currentVar.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentVar.hashtags.map((h, i) => (
                            <span key={i} className="px-2.5 py-1 rounded bg-white border border-[#EAE6DF] text-[10px] font-bold text-[#E94B35]">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                    </div>

                    {/* Bottom Action Toolbar */}
                    <div className="pt-3.5 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2.5 mt-4">
                      
                      <button
                        onClick={handleGenerateCaptions}
                        disabled={isGenerating}
                        className="px-3.5 h-9 rounded text-xs font-bold text-gray-500 hover:text-[#111111] flex items-center gap-1.5 hover:bg-[#F7F3ED] transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Regenerate</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleSave(currentVar, activeVariationIdx)}
                          className="px-3.5 h-9 rounded-xl text-xs font-bold bg-[#FFFFFF] hover:bg-[#F7F3ED] text-[#111111] border border-[#EAE6DF] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {savedIdx === activeVariationIdx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                              <span>Save</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(currentVar, activeVariationIdx)}
                          className="px-3.5 h-9 rounded-xl text-xs font-bold bg-[#FFFFFF] hover:bg-[#F7F3ED] text-[#111111] border border-[#EAE6DF] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedIdx === activeVariationIdx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-450" strokeWidth={2} />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>

                        {onOpenPublishModal && (
                          <button
                            onClick={() => {
                              const fullText = `${currentVar.hook}\n\n${currentVar.body}${currentVar.cta ? `\n\n${currentVar.cta}` : ''}${currentVar.hashtags ? `\n\n${currentVar.hashtags.join(' ')}` : ''}`;
                              onOpenPublishModal({
                                mediaFilename: media.filename,
                                mediaThumbnail: media.thumbnail,
                                captionText: fullText,
                                platform: settings.platform
                              });
                            }}
                            className="px-4.5 h-9 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer border-none"
                          >
                            <Send className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>Post / Schedule</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#EAE6DF] rounded-2xl space-y-3 bg-[#F7F3ED]/30">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center mx-auto border border-[#FADCD5]">
                  <Sparkles className="w-6 h-6 fill-current" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-[#111111]">
                  Ready to Generate Captions
                </h3>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  Select your target platform and tone, then click <strong className="text-[#E94B35]">Generate Captions</strong>.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
