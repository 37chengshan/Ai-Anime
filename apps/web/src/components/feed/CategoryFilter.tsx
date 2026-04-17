"use client";

import React from "react";
import { clsx } from "clsx";

const CATEGORIES = [
  { label: "全部", value: "All" },
  { label: "插画", value: "Illustration" },
  { label: "漫画", value: "Manga" },
  { label: "数字绘画", value: "Digital Painting" },
  { label: "概念艺术", value: "Concept Art" },
  { label: "动漫", value: "Anime" },
];

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:pb-0">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={clsx(
            "flex-shrink-0 px-4 py-2 border text-xs font-serif uppercase tracking-widest transition-all duration-200",
            value === cat.value
              ? "border-[#1a1918] bg-[#1a1918] text-[#fdfaf6]"
              : "border-[#1a1918]/30 text-[#1a1918]/70 hover:border-[#1a1918]/60 hover:text-[#1a1918]"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
