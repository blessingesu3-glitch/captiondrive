import React, { useEffect, useRef, useState } from 'react';

interface MockItem {
  photo: string;
  photoAlt: string;
  platform: string;
  caption: string;
  hashtags: string;
}

const ITEMS: MockItem[] = [
  {
    photo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    photoAlt: 'Creative team working together',
    platform: 'LinkedIn',
    caption: '"The biggest breakthrough in tech isn\'t code—it\'s how fast you empower people to build. Here\'s how our team turned raw ideas into a launched product in 48 hours."',
    hashtags: '#BuildInPublic #Creativity',
  },
  {
    photo: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
    photoAlt: 'Coffee at a work desk',
    platform: 'Instagram',
    caption: '"We don\'t do standing meetings before 10am. This is why."',
    hashtags: '#FounderLife #SmallTeamBigWork',
  },
  {
    photo: 'https://images.unsplash.com/photo-1655110788012-7b509ed12194?auto=format&fit=crop&w=800&q=80',
    photoAlt: 'New product flatlay',
    platform: 'Instagram',
    caption: '"New drop, same obsession with getting the details right. Here\'s how it started."',
    hashtags: '#BehindTheBrand #NewDrop',
  },
];

type Phase = 'generating' | 'typing' | 'ready';

export const HeroWorkspaceMockup: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('generating');
  const [typedLength, setTypedLength] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const item = ITEMS[idx];

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('generating');
    setTypedLength(0);

    const genTimer = setTimeout(() => {
      setPhase('typing');
      let i = 0;
      const typeInterval = setInterval(() => {
        i++;
        setTypedLength(i);
        if (i >= item.caption.length) {
          clearInterval(typeInterval);
          setPhase('ready');
          const holdTimer = setTimeout(() => {
            setIdx((prev) => (prev + 1) % ITEMS.length);
          }, 3600);
          timers.current.push(holdTimer);
        }
      }, 14);
      timers.current.push(typeInterval as unknown as ReturnType<typeof setTimeout>);
    }, 900);
    timers.current.push(genTimer);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDEDF8] text-[#14137B] text-[10px] font-bold">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-[#14137B] ${phase === 'generating' ? 'animate-pulse' : ''}`}
          />
          <span>{phase === 'generating' ? 'Generating...' : 'Voice Active'}</span>
        </div>
      </div>

      {/* Composition Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">

        {/* Media Image (crossfades between source photos) */}
        <div className="sm:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-[#F5F7FA] border border-[#E2E6EC]">
          {ITEMS.map((it, i) => (
            <img
              key={it.photo}
              src={it.photo}
              alt={it.photoAlt}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: i === idx ? 1 : 0 }}
            />
          ))}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold uppercase z-10">
            Google Drive
          </span>
        </div>

        {/* Generated Caption Output Box */}
        <div className="sm:col-span-7 space-y-3 p-4 rounded-2xl bg-[#F5F7FA]/60 border border-[#E2E6EC] text-left min-h-[132px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase text-[#14137B]">
                Generated Caption ({item.platform})
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Just now</span>
            </div>

            {phase === 'generating' ? (
              <div className="space-y-1.5">
                <div className="h-3 rounded-full w-full animate-pulse bg-gradient-to-r from-[#EAEAF0] via-[#F5F5F8] to-[#EAEAF0]" />
                <div className="h-3 rounded-full w-5/6 animate-pulse bg-gradient-to-r from-[#EAEAF0] via-[#F5F5F8] to-[#EAEAF0]" />
                <div className="h-3 rounded-full w-2/3 animate-pulse bg-gradient-to-r from-[#EAEAF0] via-[#F5F5F8] to-[#EAEAF0]" />
              </div>
            ) : (
              <p className="text-xs font-medium text-[#111111] leading-relaxed">
                {item.caption.slice(0, typedLength)}
                {phase === 'typing' && <span className="text-[#14137B]">|</span>}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E6EC]/60 text-[10px] text-gray-500 font-bold">
            <span>{phase === 'ready' ? item.hashtags : ''}</span>
            <span className={`text-emerald-600 transition-opacity duration-300 ${phase === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
              Ready to post →
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
