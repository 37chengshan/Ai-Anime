"use client";

import React from "react";
import { clsx } from "clsx";
import { SortOption } from "@/lib/api/client";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "最新", value: "latest" },
  { label: "热门", value: "popular" },
  { label: "趋势", value: "trending" },
];

interface SortTabsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortTabs({ value, onChange }: SortTabsProps) {
  return (
    <div className="flex border border-[#1a1918]/30">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-4 py-2 text-xs font-serif uppercase tracking-widest transition-all duration-200",
            value === opt.value
              ? "bg-[#1a1918] text-[#fdfaf6]"
              : "bg-transparent text-[#1a1918]/70 hover:bg-[#1a1918]/5"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
