"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { clsx } from "clsx";

interface SearchInputProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
}

export function SearchInput({ defaultValue = "", onSearch }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim()) {
        onSearch(value.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4a4845]" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索作品、创作者..."
        className={clsx(
          "w-full border border-[#1a1918]/30 bg-[#fdfaf6] pl-12 pr-12 py-4",
          "text-lg text-[#1a1918] placeholder:text-[#4a4845]",
          "focus:outline-none focus:border-[#1a1918]",
          "transition-colors"
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#4a4845] hover:text-[#1a1918] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
