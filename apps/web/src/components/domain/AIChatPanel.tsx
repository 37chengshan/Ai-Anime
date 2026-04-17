"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, MessageSquare, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";

export function AIChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
    {
      role: "ai",
      content:
        "Welcome to the Editorial Desk. I can assist you with metadata generation, critique your compositions, or refine your synopsis. How may I assist your publication today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");

    // Mock response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content:
            "I understand your vision. Let me search the archives for related thematic references. Might I suggest emphasizing the high-contrast elements in your prompt for a more dramatic impact?",
        },
      ]);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a1918]/40 z-40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#fdfaf6] border-l-[3px] border-[#1a1918] shadow-2xl z-50 flex flex-col font-serif"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a1918]/20 bg-texture-light">
              <div className="flex items-center gap-4">
                <span className="editorial-title text-2xl tracking-tighter italic">
                  AI Assistant
                </span>
                <span className="editorial-caption text-[#c44d36] font-bold border-l border-[#1a1918]/20 pl-4">
                  ONLINE
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 border border-[#1a1918]/20 text-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="p-6 border-b border-[#1a1918]/10 bg-transparent flex flex-wrap gap-2">
              <button className="editorial-caption text-[9px] px-3 py-1.5 border border-[#1a1918] text-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                DRAFT SYNOPSIS
              </button>
              <button className="editorial-caption text-[9px] px-3 py-1.5 border border-[#1a1918] text-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                ANALYZE STYLE
              </button>
              <button className="editorial-caption text-[9px] px-3 py-1.5 border border-[#1a1918] text-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" />
                REFINE CRITIQUE
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-transparent">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={clsx(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <span className="editorial-caption text-[10px] text-[#4a4845] mb-2 px-1">
                    {msg.role === "user" ? "YOU" : "EDITORIAL AI"}
                  </span>
                  <div
                    className={clsx(
                      "p-5 text-base leading-relaxed border",
                      msg.role === "user"
                        ? "bg-[#1a1918] text-[#fdfaf6] border-[#1a1918]"
                        : "bg-texture-light text-[#1a1918] border-[#1a1918]/20 font-serif italic"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-texture-light border-t-[3px] border-[#1a1918]">
              <div className="relative flex items-end gap-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your inquiry here..."
                  className="w-full bg-transparent border-b border-[#1a1918] focus:border-[#c44d36] focus:ring-0 text-lg font-serif italic py-3 resize-none min-h-[50px] placeholder:text-[#1a1918]/40"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-4 border border-[#1a1918] bg-[#1a1918] disabled:bg-transparent disabled:text-[#1a1918]/30 disabled:border-[#1a1918]/30 hover:bg-[#c44d36] hover:border-[#c44d36] text-[#fdfaf6] flex-shrink-0 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="editorial-caption text-[9px] text-[#4a4845] mt-4 tracking-widest uppercase">
                Notice: AI-generated responses may require editorial review.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
