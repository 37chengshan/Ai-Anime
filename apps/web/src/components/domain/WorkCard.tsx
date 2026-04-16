"use client";

import React from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { toast } from "sonner";

// Types - should be moved to @/types when available
interface Author {
  id: string;
  nickname: string;
  avatar: string;
  isMember?: boolean;
}

interface Work {
  id: string;
  title: string;
  images: string[];
  category: string;
  author: Author;
  likes: number;
  comments: number;
  isPremium?: boolean;
  createdAt: string;
}

export function WorkCard({ work }: { work: Work }) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from your moodboard." : "Added to your moodboard.");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Unsaved." : "Archived to your library.");
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300 border border-[#1a1918]/10 hover:border-[#1a1918]/30"
    >
      <Link href={`/work/${work.id}`} className="relative aspect-auto overflow-hidden bg-[#1a1918]/5">
        <img
          src={work.images[0]}
          alt={work.title}
          className="w-full h-auto object-cover filter contrast-[0.95] sepia-[0.1] group-hover:scale-105 group-hover:contrast-100 group-hover:sepia-0 transition-all duration-700 ease-out min-h-[200px]"
          loading="lazy"
        />
        {work.isPremium && (
          <div className="absolute top-0 left-0 bg-[#c44d36] text-[#fdfaf6] text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest flex items-center shadow-sm">
            PRO Exclusive
          </div>
        )}
        <div className="absolute inset-0 bg-[#1a1918]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-4 right-4 flex flex-col gap-3">
            <button
              onClick={handleSave}
              className="w-9 h-9 border border-[#fdfaf6]/50 bg-[#fdfaf6]/10 backdrop-blur-sm flex items-center justify-center text-[#fdfaf6] hover:bg-[#fdfaf6] hover:text-[#1a1918] transition-colors"
            >
              <Bookmark className={clsx("w-4 h-4", isSaved && "fill-[#c44d36] text-[#c44d36]")} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                toast.success("Link copied to clipboard.");
              }}
              className="w-9 h-9 border border-[#fdfaf6]/50 bg-[#fdfaf6]/10 backdrop-blur-sm flex items-center justify-center text-[#fdfaf6] hover:bg-[#fdfaf6] hover:text-[#1a1918] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col gap-4 bg-[#fdfaf6]/80 backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="editorial-caption text-[10px] text-[#c44d36] font-bold tracking-widest uppercase">
              {work.category}
            </span>
            <span className="editorial-caption text-[9px] text-[#4a4845]">
              {new Date(work.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <h3 className="editorial-title text-xl leading-tight truncate">
            <Link
              href={`/work/${work.id}`}
              className="hover:text-[#c44d36] transition-colors decoration-1 underline-offset-4 group-hover:underline"
            >
              {work.title}
            </Link>
          </h3>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#1a1918]/10">
          <Link href={`/profile/${work.author.id}`} className="flex items-center gap-3 group/author">
            <img
              src={work.author.avatar}
              alt={work.author.nickname}
              className="w-7 h-7 object-cover filter grayscale group-hover/author:grayscale-0 transition-all border border-[#1a1918]/10 p-0.5 bg-[#fdfaf6]"
            />
            <div className="flex flex-col">
              <span className="font-serif text-[13px] font-bold italic text-[#1a1918] group-hover/author:text-[#c44d36] transition-colors leading-none mb-1">
                by {work.author.nickname}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-[#1a1918] font-serif italic text-xs">
            <button
              onClick={handleLike}
              className={clsx(
                "flex items-center gap-1.5 transition-colors",
                isLiked ? "text-[#c44d36]" : "hover:text-[#c44d36]"
              )}
            >
              <Heart className={clsx("w-3.5 h-3.5", isLiked && "fill-current")} />
              <span>{work.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <span className="flex items-center gap-1.5 opacity-60">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{work.comments}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
