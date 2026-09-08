import React from 'react';
import { 
  X, 
  Sparkles, 
  Folder, 
  Heart, 
  Video, 
  FileImage, 
  MessageSquareQuote, 
  ExternalLink
} from 'lucide-react';
import { MediaItem } from '../types';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onGenerateCaption: (item: MediaItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAnalyzeWithAI: (item: MediaItem) => void;
  isAnalyzing?: boolean;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onGenerateCaption,
  onToggleFavorite,
  onAnalyzeWithAI,
  isAnalyzing = false
}) => {
  const isVideo = item.file_type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-[#EAE6DF] shadow-premium overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-[#F7F3ED] text-gray-500 hover:text-[#111111] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Left Column: High-Res Preview */}
        <div className="w-full md:w-1/2 bg-[#F7F3ED] flex flex-col justify-between relative group min-h-[280px] md:min-h-auto border-r border-[#EAE6DF]">
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
            {isVideo ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={item.preview_url || item.thumbnail} 
                  alt={item.filename}
                  className="w-full max-h-[380px] object-contain rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="p-4 rounded-full bg-white/95 text-[#E94B35] shadow-md">
                    <Video className="w-8 h-8 fill-current" />
                  </div>
                </div>
              </div>
            ) : (
              <img 
                src={item.preview_url || item.thumbnail} 
                alt={item.filename}
                className="w-full max-h-[420px] object-contain rounded-xl"
              />
            )}
          </div>

          {/* Bottom Bar on image column */}
          <div className="p-4 bg-white border-t border-[#EAE6DF] flex items-center justify-between gap-3 text-xs">
            <span className="truncate max-w-[200px] font-bold text-gray-500">{item.filename}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onToggleFavorite(item.id, e)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  item.is_favorite 
                    ? 'text-[#E94B35] bg-[#FFF1ED] border-[#FADCD5]' 
                    : 'border-[#EAE6DF] text-gray-400 hover:text-[#E94B35] hover:bg-[#FFF1ED]'
                }`}
              >
                <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} strokeWidth={2} />
              </button>
              {item.web_view_link && (
                <a
                  href={item.web_view_link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border border-[#EAE6DF] text-gray-500 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors"
                  title="Open in Drive"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Caption Trigger */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-none">
          
          <div className="space-y-5">
            
            {/* Title Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#FFF1ED] text-[#E94B35] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#FADCD5]">
                  {isVideo ? <Video className="w-3 h-3" /> : <FileImage className="w-3 h-3" />}
                  {item.file_type}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <Folder className="w-3 h-3 text-[#E94B35]" strokeWidth={2} />
                  {item.folder}
                </span>
              </div>
              
              <h2 className="text-lg font-bold text-[#111111] leading-tight mt-1.5">
                {item.filename}
              </h2>
            </div>

            {/* AI Insights Panel */}
            <div className="p-4 rounded-xl bg-[#FFF1ED]/40 border border-[#FADCD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E94B35] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E94B35]" strokeWidth={2} />
                  AI Content Analysis
                </span>
                
                <button
                  onClick={() => onAnalyzeWithAI(item)}
                  disabled={isAnalyzing}
                  className="text-[11px] font-bold text-[#E94B35] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer border-none bg-transparent"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}
                </button>
              </div>

              {item.ai_analysis ? (
                <div className="space-y-3 text-xs text-gray-700">
                  
                  {/* Overall Summary */}
                  <div>
                    <span className="font-bold text-[#111111]">Summary:</span>
                    <p className="mt-1 leading-relaxed text-gray-600 italic bg-white p-2.5 rounded-lg border border-[#EAE6DF]">
                      "{item.ai_analysis.overall_summary}"
                    </p>
                  </div>

                  {/* Main Subject & Mood */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-white border border-[#EAE6DF]">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Main Subject</span>
                      <p className="font-bold text-gray-700 line-clamp-2">{item.ai_analysis.main_subject}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#EAE6DF]">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Mood & Vibe</span>
                      <p className="font-bold text-gray-700">{item.ai_analysis.mood}</p>
                    </div>
                  </div>

                  {/* Detected Objects Pills */}
                  {item.ai_analysis.objects && item.ai_analysis.objects.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Detected Objects</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.ai_analysis.objects.map((obj) => (
                          <span key={obj} className="px-2 py-0.5 rounded-md bg-white border border-[#EAE6DF] text-[10px] font-bold text-gray-600">
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Palette */}
                  {item.ai_analysis.colors && item.ai_analysis.colors.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Color Palette</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.ai_analysis.colors.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-full bg-[#F7F3ED] text-[10px] font-bold text-gray-600 border border-[#EAE6DF]">
                            #{c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Specific: Transcript & Points */}
                  {isVideo && item.ai_analysis.transcript && (
                    <div className="pt-2 border-t border-[#EAE6DF] space-y-1.5">
                      <span className="font-bold text-[#111111] flex items-center gap-1">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-[#E94B35]" />
                        Speech Transcript:
                      </span>
                      <p className="text-[11px] text-gray-600 bg-white p-2.5 rounded-lg border border-[#EAE6DF]">
                        {item.ai_analysis.transcript}
                      </p>
                      {item.ai_analysis.key_talking_points && (
                        <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5 pt-1">
                          {item.ai_analysis.key_talking_points.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs space-y-2">
                  <p>AI analysis not generated yet.</p>
                  <button
                    onClick={() => onAnalyzeWithAI(item)}
                    className="px-4 h-8 rounded-full bg-[#E94B35] hover:bg-[#D13E29] text-white font-bold text-[10px] cursor-pointer shadow-sm border-none"
                  >
                    Analyze with Gemini
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-[#EAE6DF] mt-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4.5 h-9.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onGenerateCaption(item);
              }}
              className="px-5 h-9.5 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer border-none"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
              <span>Generate Captions</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
