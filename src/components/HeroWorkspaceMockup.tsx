import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

type Phase = 'idle' | 'selected' | 'analyzing' | 'generating' | 'platform' | 'success' | 'returning';

// Durations in ms, matching the requested 10-12s loop.
const DURATIONS: Record<Phase, number> = {
  idle: 2000,
  selected: 1500,
  analyzing: 1500,
  generating: 2000,
  platform: 1500,
  success: 1500,
  returning: 2000,
};

const PHASE_ORDER: Phase[] = ['idle', 'selected', 'analyzing', 'generating', 'platform', 'success', 'returning'];

const EASE = [0.16, 1, 0.3, 1] as const; // matches the site's existing fadeIn easing

const FINAL_CAPTION = "The biggest breakthrough isn't always about working harder. Sometimes it's about creating the space to think, build and grow.";
const ANALYSIS_TAGS = ['Lifestyle', 'People', 'Workspace', 'Professional'];

export const HeroWorkspaceMockup: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? 'success' : 'idle');
  const [analyzeStep, setAnalyzeStep] = useState(0); // 0: "Analyzing content...", 1: tags, 2: "Writing caption..."
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reduceMotion) return; // static final state only, no cycling

    function scheduleNext(current: Phase) {
      const t = setTimeout(() => {
        const idx = PHASE_ORDER.indexOf(current);
        const next = PHASE_ORDER[(idx + 1) % PHASE_ORDER.length];
        setPhase(next);
        scheduleNext(next);
      }, DURATIONS[current]);
      timers.current.push(t);
    }
    scheduleNext('idle');

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  // Sub-choreography inside the "analyzing" phase.
  useEffect(() => {
    if (phase !== 'analyzing') {
      setAnalyzeStep(0);
      return;
    }
    const t1 = setTimeout(() => setAnalyzeStep(1), 550);
    const t2 = setTimeout(() => setAnalyzeStep(2), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const isSelected = phase === 'selected' || phase === 'analyzing' || phase === 'generating' || phase === 'platform' || phase === 'success';
  const showAnalyzing = phase === 'analyzing';
  const showFinalCaption = phase === 'generating' || phase === 'platform' || phase === 'success';
  const showReady = phase === 'generating' || phase === 'platform' || phase === 'success';
  const platformPulsing = phase === 'platform';
  const showSuccessCheck = phase === 'success';

  return (
    <>
      {/* Fake Workspace Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E6EC]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#14137B]" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-extrabold text-[#111111]">Caption Studio Workspace</span>
        </div>
        <motion.div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDEDF8] text-[#14137B] text-[10px] font-bold"
          animate={{ opacity: [1, 0.75, 1] }}
          transition={{ duration: 2.4, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#14137B]" />
          <span>Voice Active</span>
        </motion.div>
      </div>

      {/* Composition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">

        {/* Media Image */}
        <motion.div
          className="sm:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-[#F5F7FA] border"
          animate={{ borderColor: isSelected ? '#66D100' : '#E2E6EC' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
            alt="Creative team content"
            className="w-full h-full object-cover"
          />
          <motion.span
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold uppercase"
            animate={{ scale: isSelected ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            Google Drive
          </motion.span>
          <AnimatePresence>
            {isSelected && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-[#66D100] text-[#14137B] text-[9px] font-extrabold"
              >
                Content selected
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Generated Caption Output Box */}
        <div className="sm:col-span-7 space-y-3 p-4 rounded-2xl bg-[#F5F7FA]/60 border border-[#E2E6EC] text-left min-h-[132px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={showAnalyzing ? (analyzeStep < 2 ? 'analyzing' : 'writing') : 'label'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] font-extrabold uppercase text-[#14137B]"
                >
                  {showAnalyzing
                    ? (analyzeStep < 2 ? 'Analyzing content...' : 'Writing caption...')
                    : 'Generated Caption (LinkedIn)'}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] text-gray-400 font-mono">Just now</span>
            </div>

            <AnimatePresence mode="wait">
              {showAnalyzing && analyzeStep === 1 ? (
                <motion.div
                  key="tags"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-1.5"
                >
                  {ANALYSIS_TAGS.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="px-2 py-0.5 rounded-full bg-[#EDEDF8] text-[#14137B] text-[9px] font-bold"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              ) : showFinalCaption ? (
                <motion.p
                  key="final-caption"
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="text-xs font-medium text-[#111111] leading-relaxed whitespace-pre-line"
                >
                  "{FINAL_CAPTION}"
                </motion.p>
              ) : (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1.5"
                >
                  <div className="h-3 rounded-full w-full bg-[#EAEAF0]" />
                  <div className="h-3 rounded-full w-5/6 bg-[#EAEAF0]" />
                  <div className="h-3 rounded-full w-2/3 bg-[#EAEAF0]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E6EC]/60 text-[10px] text-gray-500 font-bold">
            <span>{showFinalCaption ? '#BuildInPublic #Creativity' : ''}</span>
            <motion.span
              animate={{ opacity: showReady ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-1"
            >
              {showSuccessCheck ? (
                <span className="text-[#66D100]">Ready to post ✓</span>
              ) : (
                <span className="text-emerald-600">Ready to post →</span>
              )}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Platform Selector Mock */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] text-xs">
        <span className="text-gray-500 font-semibold">Target Platform:</span>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E6EC] font-bold text-[#111111]">Instagram</span>
          <motion.span
            className="px-2.5 py-1 rounded-lg bg-[#14137B] text-white font-bold"
            animate={platformPulsing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            LinkedIn
          </motion.span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E6EC] font-bold text-[#111111]">X</span>
        </div>
      </div>
    </>
  );
};
