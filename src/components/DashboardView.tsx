import React, { useState } from 'react';
import { 
  Sparkles, 
  FolderOpen, 
  Plus, 
  ArrowRight, 
  Zap, 
  FileImage, 
  Video, 
  HardDrive,
  Calendar,
  BarChart2,
  Bookmark,
  FileText
} from 'lucide-react';
import { MediaItem, CaptionHistoryItem, User, ActiveTab } from '../types';

interface DashboardViewProps {
  mediaItems: MediaItem[];
  captionHistory: CaptionHistoryItem[];
  user: User;
  onConnectDrive: () => void;
  onOpenMediaLibrary: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onGenerateCaption: (item: MediaItem) => void;
  onOpenImportModal: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  mediaItems,
  captionHistory,
  user,
  onConnectDrive,
  onOpenMediaLibrary,
  onSelectMedia,
  onGenerateCaption,
  onOpenImportModal,
  onSelectTab
}) => {
  const [gridFilter, setGridFilter] = useState<'all' | 'images' | 'videos' | 'drafts' | 'scheduled'>('all');

  const heroAsset = mediaItems[0] || {
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    filename: 'Cover Creative'
  };

  const filteredItems = mediaItems.filter(item => {
    if (gridFilter === 'all') return true;
    if (gridFilter === 'images') return item.file_type === 'image';
    if (gridFilter === 'videos') return item.file_type === 'video';
    if (gridFilter === 'drafts') return !item.is_favorite; // Mock drafts as non-favorites for visual distinction
    if (gridFilter === 'scheduled') return item.is_favorite; // Mock scheduled as favorites
    return true;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'draft') return 'bg-[#FAF8F5] text-gray-500 border border-[#EAE6DF]';
    return 'bg-[#EBFDF5] text-[#10B981] border border-[#A7F3D0]'; // Ready for caption
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* 1. MAIN HERO SEGMENT */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left 7 Columns: Editorial Greeting */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 rounded-3xl bg-white border border-[#EAE6DF] space-y-6">
          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-6xl font-black text-[#111111] leading-[1.08] tracking-tight">
              {getGreeting()}, <br />
              <span className="text-[#E94B35] font-display italic">
                {user.name ? user.name.split(' ')[0] : 'Creator'}.
              </span>
            </h1>

            <p className="text-[#555555] text-sm sm:text-base leading-relaxed max-w-md">
              You have <strong className="font-bold text-[#111111]">{mediaItems.length} pieces</strong> of content ready to turn into captions and scheduled posts.
            </p>
          </div>

          <div>
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full text-sm font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Create Content</span>
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Large Visual Content Preview */}
        <div className="lg:col-span-5 rounded-3xl overflow-hidden relative group min-h-[260px] border border-[#EAE6DF] bg-white">
          <img 
            src={heroAsset.thumbnail} 
            alt={heroAsset.filename}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Yellow sticky note style badge */}
          <div className="absolute bottom-5 left-5 bg-[#FFFBEA] border border-[#F6E3B4] p-4 rounded-2xl max-w-[200px] shadow-sm transform -rotate-1">
            <p className="text-xs font-bold text-[#8C6D23] leading-snug">
              Turn your ideas into engaging posts. →
            </p>
          </div>
        </div>

      </div>

      {/* 2. BODY METRICS & GRID SECTION */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Content Gallery & Library Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
            <h2 className="font-display text-2xl font-black text-[#111111] tracking-tight">
              Your Content
            </h2>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'images', 'videos', 'drafts', 'scheduled'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGridFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all-fast cursor-pointer whitespace-nowrap ${
                    gridFilter === filter
                      ? 'bg-[#111111] text-white'
                      : 'text-[#555555] hover:bg-white/60 hover:text-[#111111]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Media grid list */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectMedia(item)}
                  className="group bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-xs hover:border-[#E94B35] transition-all-fast cursor-pointer"
                >
                  {/* Image container */}
                  <div className="aspect-video w-full relative overflow-hidden bg-[#FAF8F5]">
                    <img 
                      src={item.thumbnail} 
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    
                    {/* Media Type Tag */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[#111111] text-[9px] font-bold uppercase tracking-wider shadow-sm border border-[#EAE6DF]">
                      {item.file_type}
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-extrabold text-[#111111] truncate">
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${getStatusBadgeClass(item.is_favorite ? 'scheduled' : 'draft')}`}>
                        {item.is_favorite ? 'Ready' : 'Draft'}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        {item.folder}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-[#EAE6DF] bg-white text-center text-xs text-gray-400">
              No content items matching this filter.
            </div>
          )}

          {/* View All link */}
          <div className="pt-2 text-right">
            <button
              onClick={onOpenMediaLibrary}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E94B35] hover:underline cursor-pointer"
            >
              <span>View all content</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right Column: Sidebar Indexes & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Your Content summary list card */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <h3 className="text-xs font-bold tracking-tight text-[#111111] uppercase">
                Your Content
              </h3>
              <button 
                onClick={onOpenMediaLibrary}
                className="text-xs font-bold text-[#E94B35] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-4">
              {/* Media assets */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F4F0FF] flex items-center justify-center text-[#9061F9]">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">Media Assets</span>
                </div>
                <span className="text-xs font-extrabold text-[#111111]">{mediaItems.length}</span>
              </div>

              {/* AI Captions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF1ED] flex items-center justify-center text-[#E94B35]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">AI Captions</span>
                </div>
                <span className="text-xs font-extrabold text-[#111111]">{captionHistory.length}</span>
              </div>

              {/* Scheduled Posts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EBFDF5] flex items-center justify-center text-[#10B981]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">Scheduled Posts</span>
                </div>
                <span className="text-xs font-extrabold text-[#111111]">2</span>
              </div>
            </div>
          </div>

          {/* Quick Actions List card */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-4">
            <h3 className="text-xs font-bold tracking-tight text-[#111111] uppercase border-b border-[#EAE6DF] pb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E94B35]" />
              <span>Quick Actions</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={onConnectDrive}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs font-bold hover:bg-[#FAF8F5] transition-all-fast cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#EBFDF5] flex items-center justify-center text-[#10B981]">
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#111111]">Connect Google Drive</span>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab('generator')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs font-bold hover:bg-[#FAF8F5] transition-all-fast cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFF1ED] flex items-center justify-center text-[#E94B35]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#111111]">Generate Captions</span>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab('calendar')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs font-bold hover:bg-[#FAF8F5] transition-all-fast cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#F4F0FF] flex items-center justify-center text-[#9061F9]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#111111]">View Calendar</span>
              </button>

              <button
                onClick={() => onSelectTab && onSelectTab('analytics')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs font-bold hover:bg-[#FAF8F5] transition-all-fast cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFFBEA] flex items-center justify-center text-[#F59E0B]">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[#111111]">Check Analytics</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
