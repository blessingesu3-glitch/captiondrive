import React from 'react';
import { 
  FileImage, 
  Video, 
  Folder, 
  Calendar, 
  Heart, 
  Sparkles, 
  Play, 
  Clock
} from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  viewMode: 'grid' | 'list';
  onSelectMedia: (item: MediaItem) => void;
  onGenerateCaption: (item: MediaItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  viewMode,
  onSelectMedia,
  onGenerateCaption,
  onToggleFavorite,
}) => {
  const isVideo = item.file_type === 'video';

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onSelectMedia(item)}
        className="group relative flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#E94B35] transition-all-fast cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F7F3ED] border border-[#EAE6DF]">
            <img 
              src={item.thumbnail} 
              alt={item.filename}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5">
              {isVideo ? <Video className="w-2.5 h-2.5 text-[#E94B35]" strokeWidth={2.5} /> : <FileImage className="w-2.5 h-2.5 text-[#E94B35]" strokeWidth={2.5} />}
            </div>
            {isVideo && item.duration && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[8px] font-mono">
                {item.duration}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[#111111] truncate group-hover:text-[#E94B35] transition-colors">
              {item.filename}
            </h4>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Folder className="w-3 h-3 text-gray-400" strokeWidth={2} />
                <span className="truncate max-w-[120px]">{item.folder}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" strokeWidth={2} />
                <span>{new Date(item.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </span>
              {item.size_formatted && (
                <span className="text-gray-300">• {item.size_formatted}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => onToggleFavorite(item.id, e)}
            className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer border ${
              item.is_favorite 
                ? 'text-[#E94B35] bg-[#FFF1ED] border-[#FADCD5]' 
                : 'text-gray-400 hover:text-[#E94B35] hover:bg-[#FFF1ED] hover:border-[#FADCD5] border-[#EAE6DF]'
            }`}
            title="Toggle favorite"
          >
            <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} strokeWidth={2} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCaption(item);
            }}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-bold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm transition-colors cursor-pointer border-none"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
            <span>Caption Studio</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid view layout
  return (
    <div 
      onClick={() => onSelectMedia(item)}
      className="group relative flex flex-col rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#E94B35] transition-all-fast cursor-pointer overflow-hidden shadow-xs"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#F7F3ED]">
        <img 
          src={item.thumbnail} 
          alt={item.filename}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[#111111] text-[9px] font-bold uppercase tracking-wider shadow-sm border border-[#EAE6DF]">
            {isVideo ? (
              <>
                <Video className="w-3 h-3 text-[#E94B35]" strokeWidth={2.5} />
                <span>Video</span>
              </>
            ) : (
              <>
                <FileImage className="w-3 h-3 text-[#E94B35]" strokeWidth={2.5} />
                <span>Image</span>
              </>
            )}
          </span>

          <button
            onClick={(e) => onToggleFavorite(item.id, e)}
            className={`p-1.5 rounded-full backdrop-blur-xs transition-all cursor-pointer ${
              item.is_favorite 
                ? 'bg-[#E94B35] text-white shadow-sm' 
                : 'bg-black/45 text-white hover:bg-black/60 hover:text-[#E94B35]'
            }`}
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-current' : ''}`} strokeWidth={2} />
          </button>
        </div>

        {/* Video Play Icon */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#E94B35] transition-all">
              <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={2} />
            </div>
          </div>
        )}

        {/* Bottom overlay info */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-gray-800 bg-white/90 px-2 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-bold border border-[#EAE6DF] shadow-xs">
            <Folder className="w-3 h-3 text-gray-500" strokeWidth={2} />
            <span className="truncate max-w-[100px]">{item.folder}</span>
          </span>

          {isVideo && item.duration && (
            <span className="flex items-center gap-1 text-gray-800 bg-white/90 px-2 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-bold border border-[#EAE6DF] shadow-xs">
              <Clock className="w-3 h-3 text-gray-500" strokeWidth={2} />
              <span>{item.duration}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3.5">
        <div>
          <p className="text-xs font-extrabold text-[#111111] truncate group-hover:text-[#E94B35] transition-colors">
            {item.filename}
          </p>

          <p className="text-[10px] font-semibold text-gray-400 mt-1">
            {new Date(item.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 border-t border-[#EAE6DF] flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            {item.size_formatted || '1.2 MB'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCaption(item);
            }}
            className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-bold bg-[#F7F3ED] hover:bg-[#E94B35] hover:text-white text-[#111111] border border-[#EAE6DF] transition-all-fast cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" strokeWidth={2} />
            <span>Caption</span>
          </button>
        </div>
      </div>
    </div>
  );
};
