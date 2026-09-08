import React, { useState } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Folder, 
  ArrowUpDown, 
  Filter,
  FileImage,
  Video,
  Zap
} from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface FilterState {
  searchQuery: string;
  mediaType: 'all' | 'image' | 'video';
  folder: string;
  sortBy: 'newest' | 'oldest' | 'name';
  viewMode: 'grid' | 'list';
}

interface MediaGridProps {
  items: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  onGenerateCaption: (item: MediaItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onRunSmartSearch: (promptText: string) => void;
  isLoadingSmartSearch?: boolean;
  globalSearchQuery?: string;
  smartSearchFilter?: string[] | null;
  onClearSmartSearch?: () => void;
  smartSearchQueryText?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  onSelectMedia,
  onGenerateCaption,
  onToggleFavorite,
  onRunSmartSearch,
  isLoadingSmartSearch = false,
  globalSearchQuery = '',
  smartSearchFilter = null,
  onClearSmartSearch,
  smartSearchQueryText = ''
}) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    mediaType: 'all',
    folder: 'all',
    sortBy: 'newest',
    viewMode: 'grid'
  });

  // Extract unique folders
  const folders = Array.from(new Set(items.map((i) => i.folder)));

  // Filter & Sort Logic
  const filteredItems = items
    .filter((item) => {
      // Smart search filter (AI matches)
      if (smartSearchFilter !== null && !smartSearchFilter.includes(item.id)) {
        return false;
      }
      // Type filter
      if (filterState.mediaType !== 'all' && item.file_type !== filterState.mediaType) {
        return false;
      }
      // Folder filter
      if (filterState.folder !== 'all' && item.folder !== filterState.folder) {
        return false;
      }
      // Combine global and internal queries
      const query = (globalSearchQuery || filterState.searchQuery || '').trim().toLowerCase();
      if (query) {
        const matchesName = item.filename.toLowerCase().includes(query);
        const matchesFolder = item.folder.toLowerCase().includes(query);
        const matchesSummary = item.ai_analysis?.overall_summary?.toLowerCase().includes(query);
        const matchesSubject = item.ai_analysis?.main_subject?.toLowerCase().includes(query);
        return matchesName || matchesFolder || matchesSummary || matchesSubject;
      }
      return true;
    })
    .sort((a, b) => {
      if (filterState.sortBy === 'newest') {
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      }
      if (filterState.sortBy === 'oldest') {
        return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      }
      return a.filename.localeCompare(b.filename);
    });

  const samplePills = [
    "product closeups",
    "beach shots",
    "organic ingredients",
    "videos with people"
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* Header Controls & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by filename, subject, or AI summary..."
              className="w-full pl-10 pr-4 h-10 text-xs font-semibold rounded-lg bg-[#F7F3ED]/60 border border-[#EAE6DF] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] transition-all"
            />
          </div>

          {/* Quick Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#F7F3ED]/60 border border-[#EAE6DF]">
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, mediaType: 'all' }))}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterState.mediaType === 'all'
                  ? 'bg-white text-[#E94B35] shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, mediaType: 'image' }))}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterState.mediaType === 'image'
                  ? 'bg-white text-[#E94B35] shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              <FileImage className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Images</span>
            </button>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, mediaType: 'video' }))}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterState.mediaType === 'video'
                  ? 'bg-white text-[#E94B35] shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              <Video className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Videos</span>
            </button>
          </div>

        </div>

        {/* Secondary dropdown filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE6DF]">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Folder Dropdown */}
            <div className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111]">
              <Folder className="w-3.5 h-3.5 text-[#888888]" strokeWidth={2} />
              <select
                value={filterState.folder}
                onChange={(e) => setFilterState((prev) => ({ ...prev, folder: e.target.value }))}
                className="bg-transparent text-[#111111] focus:outline-none cursor-pointer"
              >
                <option value="all">All Folders</option>
                {folders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#888888]" strokeWidth={2} />
              <select
                value={filterState.sortBy}
                onChange={(e) => setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-transparent text-[#111111] focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Uploads</option>
                <option value="oldest">Oldest Uploads</option>
                <option value="name">Filename (A-Z)</option>
              </select>
            </div>

          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F7F3ED]/60 border border-[#EAE6DF]">
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, viewMode: 'grid' }))}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                filterState.viewMode === 'grid'
                  ? 'bg-white text-[#E94B35] shadow-xs'
                  : 'text-gray-400 hover:text-[#111111]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, viewMode: 'list' }))}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                filterState.viewMode === 'list'
                  ? 'bg-white text-[#E94B35] shadow-xs'
                  : 'text-gray-400 hover:text-[#111111]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

        </div>

      </div>

      {/* Smart Search Quick Sample Prompts */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-[#E94B35]" strokeWidth={2} />
          <span>Smart Search Prompts:</span>
        </span>
        {samplePills.map((pill) => (
          <button
            key={pill}
            onClick={() => onRunSmartSearch(pill)}
            disabled={isLoadingSmartSearch}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF1ED]/60 hover:bg-[#FFF1ED] text-[#E94B35] border border-[#FADCD5] transition-all-fast cursor-pointer disabled:opacity-50"
          >
            "{pill}"
          </button>
        ))}
      </div>

      {/* Smart Search Filter Banner */}
      {smartSearchFilter !== null && (
        <div className="p-4 rounded-xl bg-[#FFF1ED] border border-[#FADCD5] flex items-center justify-between text-xs text-[#E94B35]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold px-2 py-0.5 rounded bg-[#E94B35] text-white text-[9px] uppercase tracking-wider">AI FILTER ACTIVE</span>
            <span>Showing matched results for: <strong className="font-bold">"{smartSearchQueryText || 'Smart Search Prompt'}"</strong> ({filteredItems.length} matched).</span>
          </div>
          {onClearSmartSearch && (
            <button
              onClick={onClearSmartSearch}
              className="text-[#E94B35] hover:underline font-extrabold cursor-pointer border-none bg-transparent"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Media Grid or List Output */}
      {filteredItems.length > 0 ? (
        <div className={
          filterState.viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }>
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              viewMode={filterState.viewMode}
              onSelectMedia={onSelectMedia}
              onGenerateCaption={onGenerateCaption}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-[#EAE6DF] p-8 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F3ED] text-[#888888] flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-[#111111]">
            No media files match your filters
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query, switching folder selections, or importing new media from Google Drive.
          </p>
          <button
            onClick={() => setFilterState({ searchQuery: '', mediaType: 'all', folder: 'all', sortBy: 'newest', viewMode: 'grid' })}
            className="mt-2 px-5 h-10 rounded-full text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm cursor-pointer border-none"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
