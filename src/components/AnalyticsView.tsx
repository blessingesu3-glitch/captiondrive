import React from 'react';
import { BarChart2, TrendingUp, Users, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const channelData = [
    { platform: 'Instagram', reach: '24.2K', engagement: '6.4%', growth: '+12.5%', color: '#E94B35' },
    { platform: 'LinkedIn', reach: '18.5K', engagement: '8.2%', growth: '+24.1%', color: '#0077B5' },
    { platform: 'X / Twitter', reach: '42.1K', engagement: '3.1%', growth: '-2.4%', color: '#111111' },
    { platform: 'Facebook', reach: '8.4K', engagement: '4.5%', growth: '+1.8%', color: '#1877F2' }
  ];

  const topPerformingTones = [
    { tone: 'Storytelling', rate: 92, count: 12, label: 'Highest retention & comment density' },
    { tone: 'Educational', rate: 78, count: 15, label: 'Highest save rate' },
    { tone: 'Inspirational', rate: 65, count: 8, label: 'Highest sharing velocity' },
    { tone: 'Promotional', rate: 42, count: 6, label: 'Highest link clicks' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* Title Header */}
      <div className="border-b border-[#EAE6DF] pb-4">
        <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
          Content Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Understand what's performing and which content deserves more attention.
        </p>
      </div>

      {/* Lightweight Performance Summaries (4 metrics rows) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reach', val: '93.2K', change: '+14.2%', color: 'text-[#E94B35]' },
          { label: 'Engagement', val: '5.8%', change: '+0.9%', color: 'text-[#E94B35]' },
          { label: 'Captions Created', val: '42', change: '+12%', color: 'text-[#E94B35]' },
          { label: 'Posts Published', val: '18', change: '+6%', color: 'text-[#E94B35]' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs space-y-2"
          >
            <span className="text-xs font-semibold text-gray-500">{item.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#111111] tracking-tight">{item.val}</span>
              <span className="text-xs font-bold text-[#10B981]">{item.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Split visual columns: Channel stats & Tone conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Channel Breakdown Card */}
        <div className="lg:col-span-8 p-6 bg-white border border-[#EAE6DF] rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Platform Performance
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EAE6DF] text-gray-400 font-bold uppercase tracking-wider text-[9px] pb-2">
                  <th className="py-2.5">Platform</th>
                  <th className="py-2.5 text-right">Reach</th>
                  <th className="py-2.5 text-right">Avg. Engagement</th>
                  <th className="py-2.5 text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]">
                {channelData.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F7F3ED]/30 transition-colors">
                    <td className="py-3.5 font-bold text-[#111111] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.platform}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-[#111111]">{c.reach}</td>
                    <td className="py-3.5 text-right font-extrabold text-[#E94B35]">{c.engagement}</td>
                    <td className={`py-3.5 text-right font-extrabold ${c.growth.startsWith('+') ? 'text-[#10B981]' : 'text-rose-500'}`}>
                      {c.growth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Style Conversions Card */}
        <div className="lg:col-span-4 p-6 bg-white border border-[#EAE6DF] rounded-2xl shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Caption Performance
            </h3>

            <div className="space-y-4">
              {topPerformingTones.map((t, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">{t.tone}</span>
                    <span className="font-extrabold text-[#111111]">{t.rate}% Efficiency</span>
                  </div>
                  <div className="w-full bg-[#F7F3ED] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#E94B35] h-1.5 rounded-full" 
                      style={{ width: `${t.rate}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-snug">{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Tip Box */}
          <div className="p-4 rounded-xl bg-[#FFF1ED] border border-[#FADCD5] flex gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-[#E94B35] shrink-0" />
            <p className="text-[11px] text-[#E94B35] leading-relaxed">
              <strong className="font-extrabold">Optimization Tip:</strong> Your Storytelling tone is converting 15% better than educational posts this week. Try rewriting product descriptions into personal narratives.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
