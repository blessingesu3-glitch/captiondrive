import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, AlertCircle, Zap } from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: "Hi! I am your CaptionDrive Creative Partner. I can help you brainstorm content ideas, design hooks, write scripts, or review your publishing strategy. What are we building today?",
      time: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    "Brainstorm 5 ideas for a tech newsletter launch",
    "Write a high-converting hook for an AI product reel",
    "What is the best time to post on LinkedIn for founders?",
    "How can I optimize my Instagram caption for SEO?"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text, time }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate response
    setTimeout(() => {
      let reply = "That's an excellent angle! Let's structure this to capture attention immediately. I recommend breaking it down into: 1) A scroll-stopping contrarian hook, 2) A value-driven narrative point, and 3) A clear call-to-action (CTA). Would you like me to draft a mock version of this based on your brand voice?";
      if (text.toLowerCase().includes('hook')) {
        reply = "Here's a premium hook variation: 'Most creators spend 80% of their time editing. The top 1% spend 80% of their time structuring leverage. Here is the exact checklist we used to scale CaptionDrive...' Feel free to adapt this to your media asset!";
      } else if (text.toLowerCase().includes('idea') || text.toLowerCase().includes('launch')) {
        reply = "Here is a quick campaign outline for your launch:\n1. The Teaser (Day 1): Focus on the problem. Show the friction creators face.\n2. The Reveal (Day 3): Introduce the tool. Highlight the key benefit (time saved).\n3. The Proof (Day 5): Share testimonials or a live build-in-public walkthrough.";
      }
      
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* Header Banner */}
      <div className="border-b border-[#E2E6EC] pb-4">
        <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">
          AI Creative Assistant
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Brainstorm viral campaigns, generate copy variants, and receive real-time copywriting feedback trained on high-performance frameworks.
        </p>
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Chat Window (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-[520px] bg-white border border-[#E2E6EC] rounded-2xl shadow-xs overflow-hidden">
          
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-[#E2E6EC] flex items-center gap-3 bg-[#F5F7FA]/30">
            <div className="w-9 h-9 rounded-xl bg-[#EDEDF8] text-[#14137B] flex items-center justify-center border border-[#C9C8E8]">
              <Bot className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111111]">CaptionDrive Creative Partner</h3>
              <p className="text-[9px] font-bold text-[#14137B] uppercase tracking-wider mt-0.5">Gemini-2.5-Flash Active</p>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[#F5F7FA]/10">
            {messages.map((msg, idx) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div key={idx} className={`flex items-start gap-3 ${!isAssistant ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isAssistant 
                      ? 'bg-[#111111] border-none text-white' 
                      : 'bg-[#EDEDF8] border-[#C9C8E8] text-[#14137B]'
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                    isAssistant 
                      ? 'bg-white border border-[#E2E6EC] text-gray-700' 
                      : 'bg-[#14137B] text-white font-semibold shadow-xs border-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[9px] mt-1.5 text-right font-semibold ${isAssistant ? 'text-gray-400' : 'text-white/70'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111111] border-none text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E2E6EC] text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#14137B]">
                    <Zap className="w-3.5 h-3.5 text-[#14137B] animate-bounce" />
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Footer */}
          <div className="p-4 border-t border-[#E2E6EC] bg-white">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your assistant anything about content growth..."
                className="w-full h-11 pl-4 pr-12 text-xs rounded-xl bg-[#F5F7FA]/60 border border-[#E2E6EC] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#14137B] focus:ring-1 focus:ring-[#14137B]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#14137B] hover:bg-[#0E0D57] text-white flex items-center justify-center transition-all cursor-pointer border-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Info Panel (4 Columns) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#E2E6EC] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-[#E2E6EC] pb-3">
              Suggestions
            </h3>
            
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Click any sample prompt below to instantly kick off a strategy discussion with your AI creative partner:
            </p>

            <div className="space-y-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#F5F7FA]/30 border border-[#E2E6EC] text-xs text-gray-750 hover:border-[#14137B] hover:bg-[#EDEDF8] transition-all-fast cursor-pointer"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EDEDF8] border border-[#C9C8E8] flex gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-[#14137B] shrink-0" strokeWidth={2} />
            <p className="text-[11px] text-[#14137B] leading-relaxed">
              <strong className="font-extrabold">Interactive Beta:</strong> This chat assistant utilizes your visual content summaries as context when giving strategy advice.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
