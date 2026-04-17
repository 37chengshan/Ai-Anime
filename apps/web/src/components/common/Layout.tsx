'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { AIChatPanel } from '@/components/domain/AIChatPanel';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans selection:bg-[#c44d36]/20">
      <Header />

      <main className="w-full bg-paper">
        {children}
      </main>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-[#1a1918] text-[#fdfaf6] border-2 border-[#1a1918] shadow-2xl flex items-center justify-center z-40 hover:bg-transparent hover:text-[#1a1918] transition-colors group rounded-full"
      >
        <Sparkles className="w-6 h-6 group-hover:text-[#c44d36] transition-colors" strokeWidth={1.5} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c44d36] rounded-full shadow-sm border-2 border-[#fdfaf6]" />
      </motion.button>

      <AIChatPanel isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      <Toaster position="bottom-center" toastOptions={{
        className: 'bg-[#1a1918] text-[#fdfaf6] border border-[#1a1918] rounded-none font-serif italic text-lg shadow-2xl'
      }} />
    </div>
  );
}