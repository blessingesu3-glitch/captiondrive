import React from 'react';
import { Heart } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface FavoritesViewProps {
  items: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  onGenerateCaption: (item: MediaItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenLibrary: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  items,
  onSelectMedia,
  onGenerateCaption,
  onToggleFavorite,
  onOpenLibrary
}) => {
  const favoriteItems = items.filter((i) => i.is_favorite);

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      
      <div className="p-6 rounded-2xl bg-white border border-[#E2E6EC] flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[#111111] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#14137B] fill-current" strokeWidth={2} />
            <span>Saved Assets ({favoriteItems.length})</span>
          </h1>
          <p className="text-xs text-gray-505 mt-1">
            Access your starred media items for rapid caption generation
          </p>
        </div>
      </div>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              viewMode="grid"
              onSelectMedia={onSelectMedia}
              onGenerateCaption={onGenerateCaption}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-white border border-dashed border-[#E2E6EC] p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EDEDF8] text-[#14137B] flex items-center justify-center mx-auto border border-[#C9C8E8]">
            <Heart className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-[#111111]">
            No Favorite Assets Starred
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Click the heart icon on any media item in your library to bookmark it here.
          </p>
          <button
            onClick={onOpenLibrary}
            className="mt-2 px-5 h-10 rounded-full text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white shadow-sm cursor-pointer border-none"
          >
            Explore Media Library
          </button>
        </div>
      )}

    </div>
  );
};
