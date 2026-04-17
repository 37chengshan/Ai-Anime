"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Search, LayoutGrid, TrendingUp, Users } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";

const NAV_ITEMS = [
  { href: "/", label: "最新", icon: <LayoutGrid className="w-4 h-4" /> },
  { href: "/trending", label: "热门", icon: <TrendingUp className="w-4 h-4" /> },
  { href: "/following", label: "关注", icon: <Users className="w-4 h-4" /> },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    // Update URL without refresh
    const url = new URL(window.location.href);
    if (newQuery) {
      url.searchParams.set("q", newQuery);
    } else {
      url.searchParams.delete("q");
    }
    window.history.pushState({}, "", url.toString());
  }, []);

  return (
    <div className="min-h-screen bg-[#f4efeb]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1a1918]/10 bg-[#fdfaf6]/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold italic text-[#1a1918]">
              Ai-Anim
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-xs font-serif uppercase tracking-widest text-[#1a1918]/70 hover:text-[#1a1918] hover:bg-[#1a1918]/5 transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Search Area */}
      <div className="border-b border-[#1a1918]/10 bg-[#fdfaf6]">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#4a4845]" />
              <h1 className="editorial-title text-xl">搜索</h1>
            </div>
            <SearchInput defaultValue={initialQuery} onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-8 lg:px-8">
        <Suspense fallback={<div className="flex justify-center py-20">加载中...</div>}>
          <SearchResults query={query} />
        </Suspense>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4efeb] flex items-center justify-center">
      <div className="text-center">
        <Search className="w-8 h-8 animate-spin text-[#c44d36] mx-auto" />
        <p className="mt-2 editorial-caption text-sm">加载中...</p>
      </div>
    </div>}>
      <SearchContent />
    </Suspense>
  );
}
