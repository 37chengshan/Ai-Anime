import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router';
import { Search, Plus, Bell } from 'lucide-react';
import { CURRENT_USER } from '../data/mock';
import { clsx } from 'clsx';

export function Header() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a1918]/20 bg-[#fdfaf6]/90 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Navigation */}
        <nav className="hidden md:flex items-center gap-8 w-1/3 editorial-caption font-semibold">
          <NavLink to="/" className={({isActive}) => clsx("transition-colors", isActive ? "text-[#1a1918] border-b border-[#1a1918]" : "text-[#4a4845] hover:text-[#1a1918]")}>
            Issues / 首页
          </NavLink>
          <NavLink to="/discover" className={({isActive}) => clsx("transition-colors", isActive ? "text-[#1a1918] border-b border-[#1a1918]" : "text-[#4a4845] hover:text-[#1a1918]")}>
            Curated / 发现
          </NavLink>
          <NavLink to="/pricing" className={({isActive}) => clsx("transition-colors flex items-center gap-1", isActive ? "text-[#c44d36] border-b border-[#c44d36]" : "text-[#4a4845] hover:text-[#c44d36]")}>
            Subscribe / 订阅
          </NavLink>
        </nav>

        {/* Center: Logo */}
        <div className="flex-1 md:w-1/3 flex justify-center">
          <NavLink to="/" className="flex flex-col items-center">
            <span className="font-serif font-black text-3xl tracking-[-0.05em] text-[#1a1918] uppercase leading-none">
              Figmake
            </span>
            <span className="editorial-caption text-[9px] mt-1 text-[#c44d36] font-bold">
              Art & Design Quarterly
            </span>
          </NavLink>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center justify-end gap-5 w-1/3">
          <form 
            onSubmit={handleSearch}
            className={clsx(
              "hidden sm:flex items-center border-b transition-colors relative overflow-hidden",
              isSearchFocused ? "border-[#1a1918]" : "border-[#1a1918]/30"
            )}
          >
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search..." 
              className="w-32 lg:w-48 bg-transparent text-sm h-8 px-2 border-none focus:ring-0 font-serif italic text-[#1a1918] placeholder:text-[#1a1918]/50"
            />
            <button type="submit" className="p-1">
              <Search className="w-4 h-4 text-[#1a1918]" />
            </button>
          </form>

          <button onClick={() => navigate('/upload')} className="hidden sm:flex items-center justify-center border border-[#1a1918] bg-transparent hover:bg-[#1a1918] hover:text-[#fdfaf6] text-[#1a1918] px-4 h-9 text-xs font-bold tracking-widest uppercase transition-colors gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Publish
          </button>
          
          <NavLink to={`/profile/${CURRENT_USER.id}`} className="relative block border border-transparent hover:border-[#1a1918] p-0.5 transition-colors">
            <img 
              src={CURRENT_USER.avatar} 
              alt={CURRENT_USER.nickname} 
              className="w-8 h-8 object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
            />
            {CURRENT_USER.isMember && (
              <div className="absolute -bottom-1 -right-1 bg-[#c44d36] text-[#fdfaf6] text-[8px] font-bold px-1 py-0.5 border border-[#fdfaf6]">
                PRO
              </div>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
