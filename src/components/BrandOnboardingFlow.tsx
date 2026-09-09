import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, HardDrive } from 'lucide-react';
import { BrandVoiceProfile } from '../types';

interface BrandOnboardingFlowProps {
  initialBrandName?: string;
  onCompleteOnboarding: (data: {
    brandName: string;
    description: string;
    voiceTraits: string[];
    writingSample?: string;
  }) => Promise<void>;
  onConnectDrive: () => void;
  onSkipDrive: () => void;
}

const VOICE_OPTIONS = [
  { id: 'Friendly', label: 'Friendly', desc: 'Warm, welcoming & approachable' },
  { id: 'Professional', label: 'Professional', desc: 'Polished, authoritative & clear' },
  { id: 'Bold', label: 'Bold', desc: 'Confident, direct & high-energy' },
  { id: 'Playful', label: 'Playful', desc: 'Fun, witty & casual' },
  { id: 'Educational', label: 'Educational', desc: 'Informative, insightful & helpful' },
  { id: 'Luxury', label: 'Luxury', desc: 'Elevated, refined & exclusive' },
  { id: 'Conversational', label: 'Conversational', desc: 'Relatable like talking to a friend' },
  { id: 'Inspirational', label: 'Inspirational', desc: 'Uplifting, encouraging & motivating' }
];

export const BrandOnboardingFlow: React.FC<BrandOnboardingFlowProps> = ({
  initialBrandName = '',
  onCompleteOnboarding,
  onConnectDrive,
  onSkipDrive
}) => {
  const [step, setStep] = useState<number>(1);
  const [brandName, setBrandName] = useState(initialBrandName);
  const [description, setDescription] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Friendly', 'Conversational']);
  const [writingSample, setWritingSample] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDrivePrompt, setShowDrivePrompt] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== traitId));
    } else {
      if (selectedTraits.length < 3) {
        setSelectedTraits([...selectedTraits, traitId]);
      }
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      await onCompleteOnboarding({
        brandName: brandName.trim() || 'My Brand',
        description: description.trim(),
        voiceTraits: selectedTraits.length > 0 ? selectedTraits : ['Conversational'],
        writingSample: writingSample.trim()
      });
      setShowReview(false);
      setShowDrivePrompt(true);
    } catch (err: any) {
      console.error('Failed to save brand onboarding:', err);
      setSaveError(err?.message || 'Something went wrong saving your brand profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showDrivePrompt) {
    return (
      <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE6DF] shadow-premium p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EBFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0]">
            <HardDrive className="w-7 h-7" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-black text-[#111111] tracking-tight">
              Your workspace is ready.
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Now let's bring your content in. Connect Google Drive to access your photos and videos inside CaptionDrive.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onConnectDrive}
              className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
            >
              <HardDrive className="w-4 h-4" />
              <span>Connect Google Drive →</span>
            </button>

            <button
              onClick={onSkipDrive}
              className="w-full h-10 rounded-xl text-xs font-bold text-gray-500 hover:bg-[#F7F3ED] transition-colors cursor-pointer border-none bg-transparent"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3ED] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans select-none">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E94B35] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4.5 h-4.5 fill-current" />
          </div>
          <span className="font-display text-xl font-black tracking-tight text-[#111111]">
            CaptionDrive
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 text-xs font-extrabold text-gray-400">
          <span className={step >= 1 ? 'text-[#E94B35]' : ''}>01 Brand</span>
          <span>•</span>
          <span className={step >= 2 ? 'text-[#E94B35]' : ''}>02 About</span>
          <span>•</span>
          <span className={step >= 3 ? 'text-[#E94B35]' : ''}>03 Voice</span>
          <span>•</span>
          <span className={step >= 4 ? 'text-[#E94B35]' : ''}>04 Example</span>
        </div>
      </div>

      {/* Onboarding Wizard Card */}
      <div className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-premium p-8 sm:p-10 space-y-8 text-left">
          
          {/* Step 1: Brand Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E94B35]">
                  STEP 01 OF 04
                </span>
                <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
                  What should we call your brand?
                </h1>
                <p className="text-xs text-gray-500">
                  Enter your business or personal brand name.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Glow Beauty / Blessing Esu Studio"
                  className="w-full px-4 h-12 rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-sm font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35]"
                />
              </div>

              <button
                disabled={!brandName.trim()}
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: About Brand */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E94B35]">
                  STEP 02 OF 04
                </span>
                <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
                  Tell us about your brand.
                </h1>
                <p className="text-xs text-gray-500">
                  What do you do and who do you serve?
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. I run a skincare brand helping women with sensitive skin build simple, effective routines."
                  className="w-full p-4 rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 h-12 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F7F3ED] border border-[#EAE6DF] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!description.trim()}
                  onClick={() => setStep(3)}
                  className="flex-1 h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Brand Voice Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E94B35]">
                    STEP 03 OF 04
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    Selected ({selectedTraits.length}/3)
                  </span>
                </div>
                <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
                  How should your captions sound?
                </h1>
                <p className="text-xs text-gray-500">
                  Choose up to 3 brand voice traits.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {VOICE_OPTIONS.map((trait) => {
                  const isSelected = selectedTraits.includes(trait.id);
                  return (
                    <button
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFF1ED] border-[#E94B35] text-[#111111] shadow-xs' 
                          : 'bg-[#F7F3ED]/40 border-[#EAE6DF] hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">{trait.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#E94B35]" />}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">{trait.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 h-12 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F7F3ED] border border-[#EAE6DF] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={selectedTraits.length === 0}
                  onClick={() => setStep(4)}
                  className="flex-1 h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Optional Writing Sample */}
          {step === 4 && !showReview && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E94B35]">
                  STEP 04 OF 04 (OPTIONAL)
                </span>
                <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
                  Show us your style.
                </h1>
                <p className="text-xs text-gray-500">
                  Paste a caption you've written that sounds like your brand.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={writingSample}
                  onChange={(e) => setWritingSample(e.target.value)}
                  placeholder="Paste one of your favorite captions here..."
                  className="w-full p-4 rounded-xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-xs font-semibold text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#E94B35] leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowReview(true)}
                  className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
                >
                  <span>Generate Brand Voice Profile →</span>
                </button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-gray-500 hover:text-[#111111] bg-transparent border-none cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => { setWritingSample(''); setShowReview(true); }}
                    className="text-xs font-bold text-[#E94B35] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review Modal Screen */}
          {showReview && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center border border-[#FADCD5]">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <h1 className="font-display text-2xl font-black text-[#111111] tracking-tight">
                  Here's what we'll use for your captions.
                </h1>
                <p className="text-xs text-gray-500">
                  CaptionDrive will use this profile whenever creating copy for your content.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F3ED]/60 border border-[#EAE6DF] space-y-4">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-gray-400">YOUR BRAND</span>
                  <p className="text-sm font-extrabold text-[#111111]">{brandName}</p>
                </div>

                <div>
                  <span className="text-[9px] font-extrabold uppercase text-gray-400">ABOUT</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
                </div>

                <div>
                  <span className="text-[9px] font-extrabold uppercase text-gray-400">VOICE TRAITS</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedTraits.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-md bg-white border border-[#EAE6DF] text-xs font-bold text-[#E94B35]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {writingSample && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-gray-400">SAMPLE REFERENCE</span>
                    <p className="text-xs text-gray-600 italic line-clamp-2 mt-0.5">"{writingSample}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-5 h-12 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F7F3ED] border border-[#EAE6DF] cursor-pointer"
                >
                  Edit
                </button>
                <button
                  disabled={loading}
                  onClick={handleFinishOnboarding}
                  className="flex-1 h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50"
                >
                  <span>{loading ? 'Saving Profile...' : 'Looks Good →'}</span>
                </button>
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-[#FFF1ED] border border-[#FADCD5] text-xs font-semibold text-[#E94B35]">
                  {saveError}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400">
        CaptionDrive Brand Voice Engine • Powered by Gemini AI
      </div>

    </div>
  );
};
