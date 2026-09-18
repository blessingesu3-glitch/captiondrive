import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { UsageStats, SubscriptionPlan } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage?: UsageStats;
  onUpgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  onNavigateToPricing?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUsage,
  onUpgradePlan,
  onNavigateToPricing
}) => {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setLoadingPlan(plan);
    try {
      await onUpgradePlan(plan);
      onClose();
    } catch (err) {
      console.error('Failed to upgrade plan:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const captionsUsed = currentUsage?.captionsGenerated || 0;
  const limit = currentUsage?.limit || 20;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans select-none animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E2E6EC] max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-premium text-left my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-[#111111] hover:bg-[#F5F7FA] transition-colors cursor-pointer border-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Alert */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDEDF8] text-[#14137B] text-xs font-extrabold border border-[#C9C8E8]">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Monthly Caption Limit Reached ({captionsUsed} / {limit})</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            You've used all your caption generations for this month.
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Upgrade your plan to keep creating. Choose a plan below to instantly unlock more monthly generations and advanced brand voice tools.
          </p>
        </div>

        {/* Plan Upgrade Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* CREATOR PLAN */}
          <div className="p-5 rounded-2xl border-2 border-[#14137B] bg-[#EDEDF8]/30 space-y-4 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#14137B] text-white text-[9px] font-black uppercase tracking-wider">
              RECOMMENDED
            </span>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#111111]">Creator</h3>
                <span className="text-xs font-black text-[#111111]">₦5,000 / mo</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal">
                For creators who post consistently.
              </p>

              <ul className="space-y-1.5 pt-2 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14137B] shrink-0" />
                  <span><strong>200 AI caption generations</strong> / mo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14137B] shrink-0" />
                  <span>AI Brand Voice & Smart Search</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14137B] shrink-0" />
                  <span>Unlimited caption history</span>
                </li>
              </ul>
            </div>

            <button
              disabled={loadingPlan !== null}
              onClick={() => handleSelectPlan('creator')}
              className="w-full h-10 rounded-xl text-xs font-extrabold bg-[#14137B] hover:bg-[#0E0D57] text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all disabled:opacity-50 mt-2"
            >
              <span>{loadingPlan === 'creator' ? 'Upgrading...' : 'Upgrade to Creator →'}</span>
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="p-5 rounded-2xl border border-[#E2E6EC] bg-white space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#111111]">Pro</h3>
                <span className="text-xs font-black text-[#111111]">₦10,000 / mo</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal">
                For power creators and professionals.
              </p>

              <ul className="space-y-1.5 pt-2 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#66D100] shrink-0" />
                  <span><strong>500 AI caption generations</strong> / mo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#66D100] shrink-0" />
                  <span>Priority AI generation speed</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#66D100] shrink-0" />
                  <span>Multiple content libraries</span>
                </li>
              </ul>
            </div>

            <button
              disabled={loadingPlan !== null}
              onClick={() => handleSelectPlan('pro')}
              className="w-full h-10 rounded-xl text-xs font-extrabold bg-[#111111] hover:bg-black text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all disabled:opacity-50 mt-2"
            >
              <span>{loadingPlan === 'pro' ? 'Upgrading...' : 'Upgrade to Pro →'}</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between border-t border-[#E2E6EC] text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#66D100]" />
            <span>Instant activation. Cancel anytime.</span>
          </div>

          <button
            onClick={onClose}
            className="font-bold text-gray-500 hover:text-[#111111] bg-transparent border-none cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
