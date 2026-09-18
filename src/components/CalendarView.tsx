import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Video, FileImage, ExternalLink, Send } from 'lucide-react';
import { SocialPost, SocialPlatform } from '../types';

interface CalendarViewProps {
  socialPosts: SocialPost[];
  onSelectDate: (dateString: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ socialPosts, onSelectDate }) => {
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Build a real calendar grid for the viewed month, padded with the
  // trailing days of the previous month and leading days of the next so the
  // grid always starts on a Monday and fills complete weeks.
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // getDay(): 0=Sun..6=Sat -> convert to 0=Mon..6=Sun
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const toDateString = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const calendarGrid: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];
  for (let i = leadingBlanks - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarGrid.push({ day: d, isCurrentMonth: false, dateString: '' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarGrid.push({ day: d, isCurrentMonth: true, dateString: toDateString(viewYear, viewMonth, d) });
  }
  while (calendarGrid.length % 7 !== 0) {
    const d = calendarGrid.length - (leadingBlanks + daysInMonth) + 1;
    calendarGrid.push({ day: d, isCurrentMonth: false, dateString: '' });
  }

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#E2E6EC] pb-4">
        <div>
          <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
            Content Calendar
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Plan, organize and manage your upcoming content.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#E2E6EC] self-start sm:self-center">
          <button onClick={goToPrevMonth} className="p-1.5 rounded-full text-gray-500 hover:bg-[#F5F7FA] cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-gray-650" />
          </button>
          <span className="text-xs font-bold px-3 text-[#111111]">{monthLabel}</span>
          <button onClick={goToNextMonth} className="p-1.5 rounded-full text-gray-500 hover:bg-[#F5F7FA] cursor-pointer">
            <ChevronRight className="w-4 h-4 text-gray-650" />
          </button>
        </div>
      </div>

      {/* Grid Layout: Calendar Workspace (8 cols) & Scheduled Queue (4 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Calendar Grid (8 Columns) */}
        <div className="lg:col-span-8 p-6 bg-white border border-[#E2E6EC] rounded-2xl shadow-xs flex flex-col">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center pb-2.5 border-b border-[#E2E6EC] text-[10px] font-bold text-gray-400 tracking-wider">
            {daysOfWeek.map(day => <span key={day}>{day}</span>)}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 pt-3 flex-1 min-h-[460px]">
            {calendarGrid.map((dayObj, idx) => {
              const postsOnDay = getPostsForDate(dayObj.dateString);
              const isToday = dayObj.isCurrentMonth
                && dayObj.day === today.getDate()
                && viewMonth === today.getMonth()
                && viewYear === today.getFullYear();
              
              return (
                <div 
                  key={idx}
                  onClick={() => dayObj.isCurrentMonth && onSelectDate(dayObj.dateString)}
                  className={`p-2 rounded-xl border flex flex-col justify-between min-h-[82px] transition-all bg-white ${
                    dayObj.isCurrentMonth
                      ? 'hover:border-[#14137B] cursor-pointer'
                      : 'border-transparent text-gray-300 pointer-events-none opacity-30'
                  } ${
                    isToday 
                      ? 'border-[#14137B] ring-1 ring-[#14137B]/20 bg-[#EDEDF8]/10' 
                      : 'border-[#E2E6EC]'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? 'text-[#14137B] font-extrabold' : 'text-gray-400'}`}>
                    {dayObj.day}
                  </span>

                  {/* Scheduled items visual blocks */}
                  <div className="space-y-1 mt-1 flex-1 flex flex-col justify-end">
                    {postsOnDay.slice(0, 2).map(p => (
                      <div 
                        key={p.id}
                        className={`p-1 rounded-lg text-[9px] font-bold truncate flex items-center gap-1 bg-[#F5F7FA]/80 text-[#111111] border border-[#E2E6EC] hover:border-[#14137B] transition-all-fast`}
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
                      <span className="text-[8px] font-bold text-[#14137B] block text-right">
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
        <div className="lg:col-span-4 p-6 bg-white border border-[#E2E6EC] rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-[#E2E6EC] pb-3">
              Upcoming Posts
            </h3>

            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {upcomingPosts.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
                  <div className="p-3.5 rounded-full bg-[#F5F7FA] text-gray-400 border border-dashed border-[#E2E6EC]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span>No posts scheduled currently.</span>
                </div>
              ) : (
                upcomingPosts.map(p => (
                  <div 
                    key={p.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E2E6EC] hover:border-[#14137B] transition-all-fast space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="text-[#14137B] font-extrabold uppercase tracking-wide">{p.platform}</span>
                      <span className="flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#14137B]" />
                        {p.scheduled_for ? new Date(p.scheduled_for).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img src={p.media_thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#E2E6EC] shrink-0" />
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

          <div className="pt-4 border-t border-[#E2E6EC] space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total Scheduled Slots:</span>
              <span className="font-bold text-[#111111]">{upcomingPosts.length} posts</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Auto-Publish Engine:</span>
              <span className="font-bold text-[#66D100] flex items-center gap-1 text-[9px] uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66D100]" />
                Online
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
