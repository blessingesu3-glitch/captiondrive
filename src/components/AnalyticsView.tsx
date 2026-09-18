import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Sparkles, Instagram, AlertCircle } from 'lucide-react';
import { authedFetch } from '../lib/api';
import { ActiveTab } from '../types';

interface AnalyticsViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

interface AnalyticsData {
  connected: boolean;
  igUsername?: string;
  followersCount?: number;
  mediaCount?: number;
  reach7d?: number;
  reachPrev7d?: number;
  reachGrowthPct?: number | null;
  totalInteractions7d?: number;
  engagementRate?: number | null;
  capsCreated: number;
  postsPublished: number;
  tonePerformance?: { tone: string; count: number; avgEngagementRate: number }[];
  recentPosts?: {
    id: string;
    mediaFilename: string;
    mediaThumbnail: string;
    postUrl?: string;
    tone?: string;
    reach: number;
    totalInteractions: number;
    publishedAt?: string;
  }[];
}

function formatNumber(n: number | undefined): string {
  if (n === undefined) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onSelectTab }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authedFetch('/api/analytics/instagram')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load analytics.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">

      <div className="border-b border-[#E2E6EC] pb-4">
        <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
          Content Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Real performance data from your connected Instagram account — not estimates.
        </p>
      </div>

      {loading && (
        <div className="py-24 text-center text-xs text-gray-400">Loading real Instagram data…</div>
      )}

      {!loading && error && (
        <div className="p-4 rounded-xl bg-[#EDEDF8] border border-[#C9C8E8] flex items-start gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-[#14137B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#14137B] leading-relaxed">{error}</p>
        </div>
      )}

      {!loading && !error && data && !data.connected && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-[#E2E6EC] rounded-2xl">
          <div className="p-4 rounded-full bg-[#EDEDF8] text-[#14137B]">
            <Instagram className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#111111]">Connect Instagram to see real analytics</p>
            <p className="text-xs text-gray-500 max-w-sm">
              Reach, engagement, and tone performance all come directly from your Instagram account's own data — nothing shows here until it's connected.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('social')}
            className="px-5 h-10 rounded-xl text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white shadow-sm transition-all cursor-pointer border-none"
          >
            Go to Publish → Connect Instagram
          </button>
          {(data.capsCreated > 0 || data.postsPublished > 0) && (
            <div className="flex items-center gap-6 pt-4 border-t border-[#E2E6EC] text-xs text-gray-500">
              <span><strong className="text-[#111111]">{data.capsCreated}</strong> captions created</span>
              <span><strong className="text-[#111111]">{data.postsPublished}</strong> posts published</span>
            </div>
          )}
        </div>
      )}

      {!loading && !error && data && data.connected && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs space-y-2">
              <span className="text-xs font-semibold text-gray-500">Reach (7 days)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#111111] tracking-tight">{formatNumber(data.reach7d)}</span>
                {data.reachGrowthPct !== null && data.reachGrowthPct !== undefined && (
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${data.reachGrowthPct >= 0 ? 'text-[#66D100]' : 'text-rose-500'}`}>
                    {data.reachGrowthPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {data.reachGrowthPct >= 0 ? '+' : ''}{data.reachGrowthPct.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs space-y-2">
              <span className="text-xs font-semibold text-gray-500">Engagement Rate</span>
              <span className="text-2xl font-extrabold text-[#111111] tracking-tight block">
                {data.engagementRate !== null && data.engagementRate !== undefined ? `${data.engagementRate.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs space-y-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Followers</span>
              <span className="text-2xl font-extrabold text-[#111111] tracking-tight block">{formatNumber(data.followersCount)}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs space-y-2">
              <span className="text-xs font-semibold text-gray-500">Posts Published</span>
              <span className="text-2xl font-extrabold text-[#111111] tracking-tight block">{data.postsPublished}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Recent posts */}
            <div className="lg:col-span-8 p-6 bg-white border border-[#E2E6EC] rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Recent Published Posts — @{data.igUsername}
              </h3>
              {(!data.recentPosts || data.recentPosts.length === 0) ? (
                <p className="text-xs text-gray-400 py-8 text-center">No published posts with insights yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.recentPosts.map((p) => (
                    <a
                      key={p.id}
                      href={p.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F7FA]/50 transition-colors"
                    >
                      <img src={p.mediaThumbnail} alt="" className="w-11 h-11 rounded-lg object-cover border border-[#E2E6EC] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#111111] truncate">{p.mediaFilename}</p>
                        <p className="text-[10px] text-gray-400">{p.tone || 'No tone recorded'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-[#111111]">{formatNumber(p.reach)} reach</p>
                        <p className="text-[10px] text-gray-400">{p.totalInteractions} interactions</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Tone performance */}
            <div className="lg:col-span-4 p-6 bg-white border border-[#E2E6EC] rounded-2xl shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Engagement by Tone
                </h3>
                {(!data.tonePerformance || data.tonePerformance.length === 0) ? (
                  <p className="text-xs text-gray-400">Not enough published posts yet to compare tones.</p>
                ) : (
                  <div className="space-y-4">
                    {data.tonePerformance.map((t, idx) => {
                      const maxRate = Math.max(...data.tonePerformance!.map((x) => x.avgEngagementRate), 1);
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-700">{t.tone}</span>
                            <span className="font-extrabold text-[#111111]">{t.avgEngagementRate}% eng.</span>
                          </div>
                          <div className="w-full bg-[#F5F7FA] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#14137B] h-1.5 rounded-full"
                              style={{ width: `${Math.min((t.avgEngagementRate / maxRate) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 leading-snug">
                            Based on {t.count} post{t.count === 1 ? '' : 's'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E6EC] flex gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  This data comes directly from Instagram's own Insights API — captions created and platforms not yet connected (LinkedIn, X, Facebook) aren't included here.
                </p>
              </div>
            </div>

          </div>

          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {data.capsCreated} total captions created across all platforms
          </div>
        </>
      )}

    </div>
  );
};
