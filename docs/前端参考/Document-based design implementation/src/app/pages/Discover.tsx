import React, { useState, useRef, useEffect } from 'react';
import { MOCK_WORKS, Work } from '../data/mock';
import { WorkCard } from '../components/WorkCard';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Send, Sparkles, Terminal, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

type Message = {
  id: string;
  role: 'ai' | 'user';
  content: string;
  results?: Work[];
};

const INITIAL_MESSAGE: Message = {
  id: 'msg_0',
  role: 'ai',
  content: 'Welcome to the Curator\'s Desk. I am your algorithmic archivist. Describe the aesthetic, mood, or thematic elements you seek today, and I shall assemble a bespoke exhibition from our collection.',
  results: MOCK_WORKS.slice(0, 4) // Show some initial curated works
};

export function Discover() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    setInput('');
    
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userQuery,
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI thinking and curating
    setTimeout(() => {
      const queryLower = userQuery.toLowerCase();
      
      // Filter mock works based on query
      let filtered = MOCK_WORKS.filter(w => 
        w.title.toLowerCase().includes(queryLower) ||
        w.description.toLowerCase().includes(queryLower) ||
        w.tags.some(t => t.toLowerCase().includes(queryLower)) ||
        w.category.toLowerCase().includes(queryLower)
      );

      // If no exact match, just return some random or fallback works
      if (filtered.length === 0) {
        filtered = [...MOCK_WORKS].sort(() => 0.5 - Math.random()).slice(0, 3);
      }

      const aiResponses = [
        `Fascinating inquiry. I have retrieved these artifacts from the archives that resonate with your prompt.`,
        `Ah, a distinct taste. Analyzing the metadata... I present a curated selection exploring the intersection of those precise motifs.`,
        `The algorithm has cross-referenced your thematic keywords. Consider this visual synthesis of your request.`,
        `An intriguing juxtaposition. Allow me to guide your attention to these particular manifestations.`
      ];
      
      const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'ai',
        content: aiResponse,
        results: filtered
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  const activeResults = messages[messages.length - 1]?.results || messages.filter(m => m.results).pop()?.results || [];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-transparent border-t border-[#1a1918]/20">
      
      {/* Left Column: Chat Interface */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col border-b lg:border-b-0 lg:border-r border-[#1a1918]/20 bg-texture-light h-[65vh] lg:h-[calc(100vh-80px)] lg:sticky lg:top-20 z-10 shrink-0 shadow-[20px_0_40px_rgba(26,25,24,0.03)]">
        
        {/* Header */}
        <header className="p-8 border-b-[3px] border-[#1a1918] bg-[#fdfaf6]">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5 text-[#c44d36]" strokeWidth={1.5} />
            <span className="editorial-caption text-[10px] font-bold text-[#c44d36] tracking-[0.2em]">CURATORIAL AI ALGORITHM</span>
          </div>
          <h1 className="editorial-title text-3xl md:text-4xl mb-2 tracking-tight">Curation Terminal</h1>
          <p className="font-serif italic text-sm text-[#4a4845] leading-relaxed">
            Engage with our intelligence to uncover bespoke collections buried within the digital archive.
          </p>
        </header>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth pb-32 lg:pb-8"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={clsx(
                  "flex flex-col max-w-[90%]", 
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="editorial-caption text-[9px] font-bold text-[#4a4845] tracking-[0.15em]">
                    {msg.role === 'user' ? 'GUEST INQUIRY' : 'THE CURATOR'}
                  </span>
                  {msg.role === 'ai' && idx === messages.length - 1 && (
                    <span className="w-1.5 h-1.5 bg-[#c44d36] rounded-full animate-pulse" />
                  )}
                </div>
                
                <div className={clsx(
                  "p-5 text-[15px] leading-relaxed border relative", 
                  msg.role === 'user' 
                    ? "bg-[#1a1918] text-[#fdfaf6] border-[#1a1918] font-serif" 
                    : "bg-[#fdfaf6] text-[#1a1918] border-[#1a1918]/20 font-serif italic shadow-sm"
                )}>
                  {msg.role === 'ai' && (
                    <div className="absolute -left-[5px] top-[20px] w-[5px] h-4 bg-[#c44d36]" />
                  )}
                  {msg.content}
                </div>

                {msg.role === 'ai' && msg.results && idx !== 0 && (
                  <span className="editorial-caption text-[9px] text-[#1a1918]/40 mt-3 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {msg.results.length} EXHIBITS LOCATED
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col mr-auto items-start max-w-[90%]"
            >
              <span className="editorial-caption text-[9px] font-bold text-[#4a4845] tracking-[0.15em] mb-2">
                THE CURATOR
              </span>
              <div className="p-5 border border-[#1a1918]/20 bg-[#fdfaf6] flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#1a1918]/40 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#1a1918]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#1a1918] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#fdfaf6] border-t-[3px] border-[#1a1918] mt-auto sticky bottom-0 z-20">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col gap-3">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="e.g. Neo-Tokyo cyberpunk landscapes..." 
                className="w-full bg-transparent border border-[#1a1918]/20 focus:border-[#1a1918] focus:ring-0 text-base font-serif italic py-4 px-4 resize-none h-[80px] placeholder:text-[#1a1918]/30 transition-colors shadow-inner"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setInput('Cyberpunk')} className="editorial-caption text-[9px] border border-[#1a1918]/20 px-2 py-1 text-[#4a4845] hover:border-[#1a1918] hover:text-[#1a1918] transition-colors">Cyberpunk</button>
                  <button type="button" onClick={() => setInput('Surreal Illustration')} className="editorial-caption text-[9px] border border-[#1a1918]/20 px-2 py-1 text-[#4a4845] hover:border-[#1a1918] hover:text-[#1a1918] transition-colors">Surreal</button>
                </div>
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="px-6 py-3 border border-[#1a1918] bg-[#1a1918] disabled:bg-transparent disabled:text-[#1a1918]/30 disabled:border-[#1a1918]/30 hover:bg-[#c44d36] hover:border-[#c44d36] text-[#fdfaf6] flex items-center justify-center gap-2 transition-colors editorial-caption font-bold tracking-widest shrink-0"
                >
                  <span className="hidden sm:inline">TRANSMIT</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>

      {/* Right Column: Visual Gallery (Results) */}
      <div className="flex-1 bg-paper min-h-[50vh] p-4 lg:p-10 xl:p-16">
        <header className="mb-12 pb-6 border-b border-[#1a1918]/20 flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="editorial-caption text-[#4a4845] mb-2 block">EXHIBIT VIEW</span>
            <h2 className="editorial-title text-4xl lg:text-5xl text-[#1a1918]">Curated Findings</h2>
          </div>
          <div className="editorial-caption font-bold text-[#1a1918] flex items-center gap-2 bg-texture-light px-4 py-2 border border-[#1a1918]/10">
            <Sparkles className="w-3.5 h-3.5 text-[#c44d36]" />
            {activeResults.length} PIECES ON DISPLAY
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={messages.length} // Force re-render of layout on new messages to animate entries
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6 }}
          >
            {activeResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] border border-[#1a1918]/10 bg-texture-light p-10 text-center">
                <Terminal className="w-8 h-8 text-[#1a1918]/20 mb-6" />
                <p className="editorial-title text-2xl mb-2">No Matching Records</p>
                <p className="font-serif italic text-[#4a4845]">The archive yielded no artifacts for this specific configuration.</p>
              </div>
            ) : (
              <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 1100: 3}}>
                <Masonry gutter="32px">
                  {activeResults.map((work, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                      key={`${work.id}-${i}`}
                    >
                      <WorkCard work={work} />
                    </motion.div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
