import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutGrid, TrendingUp, Users, Search } from "lucide-react";
import { ReactNode } from "react";

interface FeedLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: "/", label: "最新", icon: <LayoutGrid className="w-4 h-4" /> },
  { href: "/trending", label: "热门", icon: <TrendingUp className="w-4 h-4" /> },
  { href: "/following", label: "关注", icon: <Users className="w-4 h-4" /> },
];

export default function FeedLayout({ children }: FeedLayoutProps) {
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
            <Link
              href="/search"
              className="p-2 text-[#1a1918]/70 hover:text-[#1a1918] transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-[#1a1918]/10 bg-[#fdfaf6]">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-serif uppercase tracking-widest text-[#1a1918]/70 hover:text-[#1a1918] hover:bg-[#1a1918]/5 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
