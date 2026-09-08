import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HardDrive, 
  Folder, 
  Calendar, 
  BarChart2, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  Menu,
  X,
  Play,
  Copy,
  Sliders,
  Clock,
  Heart,
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onStartCreating: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCreating, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'Instagram' | 'LinkedIn' | 'X'>('Instagram');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#111111] font-sans antialiased selection:bg-[#E94B35] selection:text-white">
      
      {/* 1. PUBLIC NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#F7F3ED]/90 backdrop-blur-md border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-[#E94B35] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-[#111111]">
              CaptionDrive
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#E94B35] transition-colors cursor-pointer bg-transparent border-none">
              How It Works
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#E94B35] transition-colors cursor-pointer bg-transparent border-none">
              Features
            </button>
            <button onClick={() => scrollToSection('brand-voice')} className="hover:text-[#E94B35] transition-colors cursor-pointer bg-transparent border-none">
              Brand Voice
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-[#E94B35] transition-colors cursor-pointer bg-transparent border-none">
              Pricing
            </button>
            <button onClick={onLogin} className="hover:text-[#E94B35] transition-colors cursor-pointer bg-transparent border-none text-[#111111] font-bold">
              Log In
            </button>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onStartCreating}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-full text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer border-none"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#111111] cursor-pointer bg-transparent border-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#EAE6DF] px-6 py-6 space-y-4 animate-fadeIn">
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-sm font-bold text-gray-700 bg-transparent border-none">
              How It Works
            </button>
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-sm font-bold text-gray-700 bg-transparent border-none">
              Features
            </button>
            <button onClick={() => scrollToSection('brand-voice')} className="block w-full text-left py-2 text-sm font-bold text-gray-700 bg-transparent border-none">
              Brand Voice
            </button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-sm font-bold text-gray-700 bg-transparent border-none">
              Pricing
            </button>
            <div className="pt-4 border-t border-[#EAE6DF] flex flex-col gap-3">
              <button
                onClick={onLogin}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-800 bg-[#F7F3ED] border border-[#EAE6DF]"
              >
                Log In
              </button>
              <button
                onClick={onStartCreating}
                className="w-full py-3 rounded-xl text-xs font-extrabold bg-[#E94B35] text-white shadow-sm flex items-center justify-center gap-2 border-none"
              >
                <span>Start Creating</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1ED] border border-[#FADCD5] text-[#E94B35] text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>AI-Powered Brand Voice Copywriter</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-[#111111] leading-[1.08] tracking-tight">
              Turn your content into captions <br className="hidden sm:block" />
              <span className="text-[#E94B35] italic font-display">worth posting.</span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              CaptionDrive helps you turn the photos and videos you already have into captions that actually sound like your brand.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onStartCreating}
                className="h-13 px-8 rounded-full text-sm font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-md flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer border-none"
              >
                <span>Start Creating</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className="h-13 px-7 rounded-full text-sm font-bold bg-white hover:bg-[#F7F3ED] text-[#111111] border border-[#EAE6DF] flex items-center justify-center transition-colors cursor-pointer"
              >
                See How It Works
              </button>
            </div>

            {/* Micro social proof / features pill */}
            <div className="flex items-center gap-6 pt-4 border-t border-[#EAE6DF] text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Google Drive Integration</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Custom Brand Voice</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Multi-Platform Formatting</span>
              </span>
            </div>
          </div>

          {/* Right Column Hero Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-premium space-y-5">
              
              {/* Fake Workspace Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E94B35]" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-extrabold text-[#111111]">Caption Studio Workspace</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF1ED] text-[#E94B35] text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Glow Beauty Voice Active</span>
                </div>
              </div>

              {/* Composition Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Media Image */}
                <div className="sm:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-[#F7F3ED] border border-[#EAE6DF]">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
                    alt="Creative Team Content"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold uppercase">
                    Google Drive
                  </span>
                </div>

                {/* Generated Caption Output Box */}
                <div className="sm:col-span-7 space-y-3 p-4 rounded-2xl bg-[#F7F3ED]/60 border border-[#EAE6DF] text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-[#E94B35]">
                      Generated Caption (LinkedIn)
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Just now</span>
                  </div>

                  <p className="text-xs font-medium text-[#111111] leading-relaxed">
                    "The biggest breakthrough in tech isn't code—it's how fast you empower people to build. 🚀 Here's how our team turned raw ideas into a launched product in 48 hours..."
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DF]/60 text-[10px] text-gray-500 font-bold">
                    <span>#BuildInPublic #Creativity</span>
                    <span className="text-emerald-600">Ready to post →</span>
                  </div>
                </div>
              </div>

              {/* Platform Selector Mock */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F3ED] text-xs">
                <span className="text-gray-500 font-semibold">Target Platform:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE6DF] font-bold text-[#111111]">Instagram</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#E94B35] text-white font-bold">LinkedIn</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE6DF] font-bold text-[#111111]">X</span>
                </div>
              </div>

            </div>

            {/* Floating sticky note badge */}
            <div className="absolute -bottom-6 -left-4 hidden sm:block bg-[#FFFBEA] border border-[#F6E3B4] p-4 rounded-2xl max-w-[210px] shadow-md transform -rotate-2">
              <p className="text-xs font-bold text-[#8C6D23] leading-snug">
                "Saved our team 10+ hours every single week."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PRODUCT STORY STEPS */}
      <section className="py-12 bg-white border-y border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">01 — CONTENT</span>
              <p className="text-sm font-bold text-[#111111]">Google Drive Assets</p>
            </div>

            <div className="p-4 space-y-1 border-l border-[#EAE6DF]">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">02 — ENGINE</span>
              <p className="text-sm font-bold text-[#111111]">CaptionDrive AI</p>
            </div>

            <div className="p-4 space-y-1 border-l border-[#EAE6DF]">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">03 — VOICE</span>
              <p className="text-sm font-bold text-[#111111]">On-Brand Copy</p>
            </div>

            <div className="p-4 space-y-1 border-l border-[#EAE6DF]">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">04 — PUBLISH</span>
              <p className="text-sm font-bold text-[#111111]">Ready To Post</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PROBLEM SECTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">The Pain Point</span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[#111111] leading-tight tracking-tight">
            Your content is ready. <br />
            Your captions shouldn't slow you down.
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Creators already have great photos and videos sitting in folders. The difficult part is turning that media into captions that feel natural, consistent, and worth posting.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 text-left">
          
          <div className="p-6 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center font-bold">
              💬
            </div>
            <h3 className="text-sm font-extrabold text-[#111111]">"I know what I want to post. I just don't know what to say."</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Staring at a blank text box wastes creative energy every time you want to share an update.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center font-bold">
              📁
            </div>
            <h3 className="text-sm font-extrabold text-[#111111]">"My content is sitting in Google Drive."</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Downloading photos and videos to your phone just to upload them somewhere else is tedious.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center font-bold">
              🔄
            </div>
            <h3 className="text-sm font-extrabold text-[#111111]">"I keep writing captions that sound the same."</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Without a defined brand voice, your posts fall back on repetitive hooks and generic emojis.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1ED] text-[#E94B35] flex items-center justify-center font-bold">
              ⏳
            </div>
            <h3 className="text-sm font-extrabold text-[#111111]">"Starting from a blank screen takes too long."</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Drafting copy from scratch for multiple platforms delays your entire posting workflow.</p>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">Simple 3-Step Process</span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
              How CaptionDrive Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-[#F7F3ED]/60 border border-[#EAE6DF] space-y-4 text-left">
              <span className="text-xs font-extrabold tracking-wider text-[#E94B35] uppercase">01 — CONNECT</span>
              <h3 className="text-xl font-bold text-[#111111]">Bring your content in.</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connect Google Drive to access all your photos and videos inside CaptionDrive workspace instantly.
              </p>
              <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[#E94B35]">
                <HardDrive className="w-4 h-4" />
                <span>Google Drive Sync</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-[#F7F3ED]/60 border border-[#EAE6DF] space-y-4 text-left">
              <span className="text-xs font-extrabold tracking-wider text-[#E94B35] uppercase">02 — CREATE</span>
              <h3 className="text-xl font-bold text-[#111111]">Give your content a voice.</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Select your media asset and let Gemini AI generate tailored captions matching your brand voice profile.
              </p>
              <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[#E94B35]">
                <Sparkles className="w-4 h-4" />
                <span>Multimodal Gemini AI</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-[#F7F3ED]/60 border border-[#EAE6DF] space-y-4 text-left">
              <span className="text-xs font-extrabold tracking-wider text-[#E94B35] uppercase">03 — PLAN</span>
              <h3 className="text-xl font-bold text-[#111111]">Keep your content moving.</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Save your favorite variations, organize content into your calendar, and stay ready to post across platforms.
              </p>
              <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[#E94B35]">
                <Calendar className="w-4 h-4" />
                <span>Content Calendar</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. BRAND VOICE DIFFERENTIATOR SECTION */}
      <section id="brand-voice" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">Core Differentiator</span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-[#111111] leading-tight tracking-tight">
              AI can write a caption. <br />
              <span className="text-[#E94B35] italic font-display">CaptionDrive learns how YOUR brand talks.</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              During a quick onboarding, CaptionDrive learns your brand name, core mission, desired tone traits, and writing style. Every generated caption uses this profile so your content always sounds authentically like you.
            </p>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE6DF] space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[#EAE6DF] pb-2">
                <span className="font-extrabold text-[#111111]">Sample Profile: Glow Beauty</span>
                <span className="text-[#E94B35] font-bold">Active Voice</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-md bg-[#FFF1ED] text-[#E94B35] text-xs font-bold">Friendly</span>
                <span className="px-2.5 py-1 rounded-md bg-[#FFF1ED] text-[#E94B35] text-xs font-bold">Educational</span>
                <span className="px-2.5 py-1 rounded-md bg-[#FFF1ED] text-[#E94B35] text-xs font-bold">Conversational</span>
              </div>
            </div>

            <button
              onClick={onStartCreating}
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer border-none"
            >
              <span>Build Your Brand Voice Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-6 p-8 rounded-3xl bg-white border border-[#EAE6DF] shadow-premium space-y-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-gray-400">INPUT CONTENT</span>
              <span className="text-xs font-bold text-[#E94B35]">Skincare Photo</span>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-[#F7F3ED] relative border border-[#EAE6DF]">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" 
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-[#F7F3ED]/70 border border-[#EAE6DF]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E94B35]">
                GLOW BEAUTY CAPTION OUTPUT
              </span>
              <p className="text-xs text-[#111111] leading-relaxed font-medium">
                "Healthy skin isn't about 10 complicated steps—it's about finding what your skin actually loves! ✨ Here are 3 gentle ingredients we formulated for sensitive skin..."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FEATURE SHOWCASE */}
      <section id="features" className="py-24 bg-white border-y border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">Built For Creators</span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Everything you need in one workspace
            </h2>
          </div>

          {/* Feature 01 */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-extrabold text-[#E94B35] uppercase">FEATURE 01</span>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-[#111111]">
                Your content, in one place.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Bring your existing photos and videos into one workspace instead of searching through folders every time you want to post.
              </p>
            </div>
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#F7F3ED] border border-[#EAE6DF]">
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-[#EAE6DF]">
                  <img src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80" alt="Keynote" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-[#EAE6DF]">
                  <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80" alt="Teaser" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-[#EAE6DF]">
                  <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" alt="Workstation" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 02 */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 p-6 rounded-3xl bg-[#F7F3ED] border border-[#EAE6DF] text-left space-y-3">
              <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-2">
                <span className="text-[10px] font-bold text-[#E94B35] uppercase">Option 1 — High-Impact Hook</span>
                <p className="text-xs text-[#111111] font-semibold">"Stop scrolling if you care about building products fast! 🚀 Here is the key takeaway..."</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Option 2 — Personal Storytelling</span>
                <p className="text-xs text-gray-700">"Behind every product update, there's a story worth sharing..."</p>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
              <span className="text-xs font-extrabold text-[#E94B35] uppercase">FEATURE 02</span>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-[#111111]">
                Captions that sound like you.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                CaptionDrive uses your brand voice profile and media context to generate multiple high-converting copywriting hooks.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. GOOGLE DRIVE SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBFDF5] text-[#10B981] flex items-center justify-center mx-auto border border-[#A7F3D0]">
            <HardDrive className="w-6 h-6" strokeWidth={2} />
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Your content is already there. <br />
            Let's put it to work.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Connect Google Drive and bring the photos and videos you already have into CaptionDrive.
          </p>
          <div className="pt-4">
            <button
              onClick={onStartCreating}
              className="inline-flex items-center gap-2 px-8 h-13 rounded-full text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm cursor-pointer border-none"
            >
              <span>Start Creating Now →</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-16">
        
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E94B35]">
            Simple & Transparent Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Create more. Caption less.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Start free and turn the content already sitting in your Google Drive into ready-to-post captions in seconds.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
          
          {/* PLAN 1 — FREE */}
          <div className="p-8 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-extrabold text-[#111111]">Free</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[#F7F3ED] px-2.5 py-1 rounded-full border border-[#EAE6DF]">
                  Starter
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                For creators trying CaptionDrive for the first time.
              </p>
              <div className="pt-2">
                <span className="font-display text-4xl font-black text-[#111111]">₦0</span>
                <span className="text-xs font-bold text-gray-500"> / month</span>
              </div>

              <div className="pt-4 border-t border-[#EAE6DF] space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">WHAT'S INCLUDED</p>
                <ul className="space-y-2.5 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span><strong>20 AI caption generations</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Google Drive connection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Basic caption styles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>3 caption options per generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Caption history</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={onStartCreating}
              className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#F7F3ED] hover:bg-[#EAE6DF] text-[#111111] border border-[#EAE6DF] transition-all cursor-pointer"
            >
              Start for Free
            </button>
          </div>

          {/* PLAN 2 — CREATOR (MOST POPULAR / HIGHLIGHTED) */}
          <div className="relative p-8 rounded-3xl bg-white border-2 border-[#E94B35] shadow-premium flex flex-col justify-between space-y-6 transform md:-translate-y-2">
            
            {/* MOST POPULAR BADGE */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E94B35] text-white text-[10px] font-black uppercase tracking-widest shadow-xs">
              MOST POPULAR
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-extrabold text-[#111111]">Creator</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E94B35] bg-[#FFF1ED] px-2.5 py-1 rounded-full border border-[#FADCD5]">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                For creators who post consistently.
              </p>
              <div className="pt-2">
                <span className="font-display text-4xl font-black text-[#111111]">₦5,000</span>
                <span className="text-xs font-bold text-gray-500"> / month</span>
              </div>

              <div className="pt-4 border-t border-[#EAE6DF] space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#E94B35]">EVERYTHING IN FREE, PLUS</p>
                <ul className="space-y-2.5 text-xs text-gray-800 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E94B35] shrink-0" />
                    <span><strong>200 AI caption generations</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E94B35] shrink-0" />
                    <span>All caption copywriting styles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E94B35] shrink-0" />
                    <span>Platform-specific formatting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E94B35] shrink-0" />
                    <span>AI Brand Voice Profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E94B35] shrink-0" />
                    <span>Smart natural language search</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E94B35] shrink-0" />
                    <span>Unlimited caption history</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={onStartCreating}
              className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* PLAN 3 — PRO */}
          <div className="p-8 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-extrabold text-[#111111]">Pro</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[#F7F3ED] px-2.5 py-1 rounded-full border border-[#EAE6DF]">
                  Power User
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                For power creators and professionals.
              </p>
              <div className="pt-2">
                <span className="font-display text-4xl font-black text-[#111111]">₦10,000</span>
                <span className="text-xs font-bold text-gray-500"> / month</span>
              </div>

              <div className="pt-4 border-t border-[#EAE6DF] space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">EVERYTHING IN CREATOR, PLUS</p>
                <ul className="space-y-2.5 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span><strong>500 AI caption generations</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Priority AI generation speed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Advanced AI Brand Voice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Multiple content libraries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Advanced content search</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={onStartCreating}
              className="w-full h-12 rounded-xl text-xs font-extrabold bg-[#111111] hover:bg-black text-white shadow-sm transition-all cursor-pointer border-none"
            >
              Go Pro
            </button>
          </div>

        </div>

      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-24 bg-[#111111] text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E94B35] text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Your next post is already sitting <br /> in your content library.
          </h2>

          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
            CaptionDrive helps you turn it into something worth sharing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto h-13 px-8 rounded-full text-xs font-extrabold bg-[#E94B35] hover:bg-[#D13E29] text-white shadow-sm cursor-pointer border-none"
            >
              Start Creating →
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto h-13 px-8 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-12 bg-[#F7F3ED] border-t border-[#EAE6DF] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#E94B35] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-display font-black text-lg text-[#111111]">CaptionDrive</span>
            <span className="text-gray-400">| Create more. Caption less.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#111111] bg-transparent border-none cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#111111] bg-transparent border-none cursor-pointer">Features</button>
            <button onClick={onLogin} className="hover:text-[#111111] bg-transparent border-none cursor-pointer">Log In</button>
            <button onClick={onStartCreating} className="hover:text-[#111111] bg-transparent border-none cursor-pointer text-[#E94B35]">Sign Up</button>
          </div>

          <div>
            © {new Date().getFullYear()} CaptionDrive. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};
