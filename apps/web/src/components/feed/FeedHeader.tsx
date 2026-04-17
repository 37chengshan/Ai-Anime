"use client";

import React from "react";

interface FeedHeaderProps {
  title: string;
  subtitle?: string;
}

export function FeedHeader({ title, subtitle }: FeedHeaderProps) {
  return (
    <div className="mb-8 border-b border-[#1a1918]/10 pb-6">
      <h1 className="editorial-title text-3xl md:text-4xl">{title}</h1>
      {subtitle && (
        <p className="editorial-caption text-sm mt-2 text-[#4a4845]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
