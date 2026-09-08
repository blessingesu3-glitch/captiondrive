import React, { useState } from 'react';
import { Sparkles, HardDrive, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onConnectDrive: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onConnectDrive }) => {
  const [step, setStep] = useState<number>(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EAE6DF] shadow-premium overflow-hidden p-6 sm:p-8 space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-[#111111] hover:bg-[#F7F3ED] transition-colors cursor-pointer border-none bg-transparent"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center mx-auto shadow-xs border border-[#FADCD5]">
              <Sparkles className="w-7 h-7" strokeWidth={2} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-[#111111]">
                Welcome to CaptionDrive
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Turn your Google Drive media into platform-specific social media captions using Gemini AI.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F3ED]/40 border border-[#EAE6DF] text-left space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" strokeWidth={2} />
                <span>Seamless integration with Google Drive media folders</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" strokeWidth={2} />
                <span>Multimodal AI analyzes visual subjects, context & speech</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" strokeWidth={2} />
                <span>Generates optimized variations for Instagram, LinkedIn, X & Facebook</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-10.5 px-4 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Step 2: Connect Drive or Try Sample */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#EBFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0]">
              <HardDrive className="w-7 h-7" strokeWidth={2} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-[#111111]">
                Connect Google Drive
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Securely grant access to scan your media files and folders.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onConnectDrive();
                  onClose();
                }}
                className="w-full h-10.5 px-4 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
              >
                <HardDrive className="w-4 h-4" strokeWidth={2} />
                <span>Connect Google Drive Account</span>
              </button>

              <button
                onClick={onClose}
                className="w-full h-10 px-4 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F7F3ED] transition-colors cursor-pointer border-none bg-transparent"
              >
                Explore Sample Drive Library
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
