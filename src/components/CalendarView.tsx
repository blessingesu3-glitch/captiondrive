import React from 'react';
import { Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Video, FileImage, ExternalLink, Send } from 'lucide-react';
import { SocialPost, SocialPlatform } from '../types';

interface CalendarViewProps {
  socialPosts: SocialPost[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ socialPosts }) => {
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // Create a simulated 35-day grid for August 2026
  const augustDays = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true,
    dateString: `2026-08-${String(i + 1).padStart(2, '0')}`
  }));

  // Add a few padding days from July/September to complete a 5-week block
  const calendarGrid = [
    ...Array.from({ length: 5 }, (_, i) => ({ day: 27 + i, isCurrentMonth: false, dateString: '' })), // July
    ...augustDays,
    ...Array.from({ length: 6 }, (_, i) => ({ day: i + 1, isCurrentMonth: false, dateString: '' })) // September
  ];

  const getPostsForDate = (dateStr: string) => {
    if (!dateStr) return [];
    return socialPosts.filter(p => {
      const postDate = p.scheduled_for || p.published_at;
      if (!postDate) return false;
      return postDate.startsWith(dateStr);
    });
  };

  const getPlatformIcon = (plat: SocialPlatform) => {
    switch (plat) {
      case 'Instagram': return '📸';
      case 'LinkedIn': return '💼';
      case 'X': return '🐦';
      case 'Facebook': return '📘';
      default: return '🔗';
    }
  };

  const upcomingPosts = socialPosts.filter(p => p.scheduled_for || p.status === 'pending_approval');

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
        <div>
          <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
            Content Calendar
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Plan, organize and manage your upcoming content.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#EAE6DF] self-start sm:self-center">
          <button className="p-1.5 rounded-full text-gray-500 hover:bg-[#F7F3ED] cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-gray-650" />
          </button>
          <span className="text-xs font-bold px-3 text-[#111111]">August 2026</span>
          <button className="p-1.5 rounded-full text-gray-500 hover:bg-[#F7F3ED] cursor-pointer">
            <ChevronRight className="w-4 h-4 text-gray-650" />
          </button>
        </div>
      </div>

      {/* Grid Layout: Calendar Workspace (8 cols) & Scheduled Queue (4 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Calendar Grid (8 Columns) */}
        <div className="lg:col-span-8 p-6 bg-white border border-[#EAE6DF] rounded-2xl shadow-xs flex flex-col">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center pb-2.5 border-b border-[#EAE6DF] text-[10px] font-bold text-gray-400 tracking-wider">
            {daysOfWeek.map(day => <span key={day}>{day}</span>)}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 pt-3 flex-1 min-h-[460px]">
            {calendarGrid.map((dayObj, idx) => {
              const postsOnDay = getPostsForDate(dayObj.dateString);
              const isToday = dayObj.day === 11 && dayObj.isCurrentMonth; // simulated today is Aug 11, 2026
              
              return (
                <div 
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col justify-between min-h-[82px] transition-all bg-white ${
                    dayObj.isCurrentMonth
                      ? 'hover:border-gray-300'
                      : 'border-transparent text-gray-300 pointer-events-none opacity-30'
                  } ${
                    isToday 
                      ? 'border-[#E94B35] ring-1 ring-[#E94B35]/20 bg-[#FFF1ED]/10' 
                      : 'border-[#EAE6DF]'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? 'text-[#E94B35] font-extrabold' : 'text-gray-400'}`}>
                    {dayObj.day}
                  </span>

                  {/* Scheduled items visual blocks */}
                  <div className="space-y-1 mt-1 flex-1 flex flex-col justify-end">
                    {postsOnDay.slice(0, 2).map(p => (
                      <div 
                        key={p.id}
                        className={`p-1 rounded-lg text-[9px] font-bold truncate flex items-center gap-1 bg-[#F7F3ED]/80 text-[#111111] border border-[#EAE6DF] hover:border-[#E94B35] transition-all-fast`}
                        title={`${p.platform}: ${p.caption_text}`}
                      >
                        {p.media_thumbnail ? (
                          <img src={p.media_thumbnail} alt="" className="w-3.5 h-3.5 rounded-md object-cover shrink-0" />
                        ) : (
                          <span className="shrink-0">{getPlatformIcon(p.platform)}</span>
                        )}
                        <span className="truncate">{p.media_filename}</span>
                      </div>
                    ))}
                    {postsOnDay.length > 2 && (
                      <span className="text-[8px] font-bold text-[#E94B35] block text-right">
                        +{postsOnDay.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Upcoming Posts Sidebar Queue (4 Columns) */}
        <div className="lg:col-span-4 p-6 bg-white border border-[#EAE6DF] rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-[#EAE6DF] pb-3">
              Upcoming Posts
            </h3>

            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {upcomingPosts.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
                  <div className="p-3.5 rounded-full bg-[#F7F3ED] text-gray-400 border border-dashed border-[#EAE6DF]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span>No posts scheduled currently.</span>
                </div>
              ) : (
                upcomingPosts.map(p => (
                  <div 
                    key={p.id}
                    className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#E94B35] transition-all-fast space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="text-[#E94B35] font-extrabold uppercase tracking-wide">{p.platform}</span>
                      <span className="flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#E94B35]" />
                        {p.scheduled_for ? new Date(p.scheduled_for).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img src={p.media_thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#EAE6DF] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#111111] truncate">{p.media_filename}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{p.caption_text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE6DF] space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total Scheduled Slots:</span>
              <span className="font-bold text-[#111111]">{upcomingPosts.length} posts</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Auto-Publish Engine:</span>
              <span className="font-bold text-[#10B981] flex items-center gap-1 text-[9px] uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                Online
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
