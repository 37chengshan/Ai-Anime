import React, { useState, useEffect, useMemo } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useSearchParams } from 'react-router';
import { MOCK_WORKS } from '../data/mock';
import { WorkCard } from '../components/WorkCard';
import { Filter, ChevronDown, Flame, Sparkles, Clock, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

const CATEGORIES = ['All', 'Anime', 'Manga', 'Illustration', 'Concept Art'];
const SORTS = [
  { label: 'Latest', icon: Clock },
  { label: 'Trending', icon: Flame },
  { label: 'Curated', icon: Sparkles }
];

export function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('Latest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [works, setWorks] = useState(MOCK_WORKS);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setWorks(prev => [...prev, ...MOCK_WORKS.map(w => ({ ...w, id: w.id + Math.random() }))].slice(0, 30));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredWorks = useMemo(() => {
    let result = works;
    
    // Filter by Category
    if (activeCategory !== 'All') {
      const mapCat: Record<string, string> = {
        'Anime': 'Anime',
        'Manga': 'Manga',
        'Illustration': 'Illustration',
        'Concept Art': 'Concept Art'
      };
      result = result.filter(w => w.category === mapCat[activeCategory] || w.category === activeCategory);
    }
    
    // Filter by Search Query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.author.nickname.toLowerCase().includes(q) ||
        w.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [works, activeCategory, query]);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      
      {/* Page Header Editorial Style */}
      <div className="mb-20 text-center flex flex-col items-center">
        <span className="editorial-caption text-[#c44d36] mb-6">Vol. 4 / Spring 2026</span>
        <h1 className="editorial-title text-6xl md:text-8xl max-w-4xl leading-[0.9] tracking-[-0.04em] mb-8">
          The Art of Algorithms
        </h1>
        <p className="editorial-body text-xl max-w-2xl text-center font-serif italic mx-auto">
          Exploring the intersection of human imagination and artificial intelligence in contemporary visual storytelling.
        </p>
        <div className="w-16 h-px bg-[#1a1918] mt-10"></div>
      </div>

      {query && (
        <div className="mb-10 p-6 border-y border-[#1a1918]/20 bg-texture-light flex items-center justify-between">
          <span className="editorial-caption">Search Results For</span>
          <span className="font-serif italic text-2xl">"{query}"</span>
        </div>
      )}

      {/* Editorial Category Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[#1a1918] pb-4 mb-12 relative z-20">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={clsx(
                "editorial-caption font-bold pb-2 border-b-2 transition-all duration-300 uppercase whitespace-nowrap",
                activeCategory === category
                  ? "border-[#c44d36] text-[#c44d36]"
                  : "border-transparent text-[#1a1918] hover:text-[#c44d36]/70"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 shrink-0 relative">
          <div className="hidden sm:flex items-center gap-4 text-[#1a1918]">
            {SORTS.map(sort => {
              const Icon = sort.icon;
              return (
                <button
                  key={sort.label}
                  onClick={() => setActiveSort(sort.label)}
                  className={clsx(
                    "flex items-center gap-1.5 text-xs font-serif italic transition-all duration-300",
                    activeSort === sort.label
                      ? "text-[#c44d36] font-bold"
                      : "text-[#4a4845] hover:text-[#1a1918]"
                  )}
                >
                  {sort.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-6 bg-[#1a1918]/20 mx-2 hidden sm:block"></div>

          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 editorial-caption font-bold bg-[#1a1918] text-[#fdfaf6] px-4 py-2 border border-[#1a1918] hover:bg-transparent hover:text-[#1a1918] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            FILTERS
            <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-300", isFilterOpen && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-12 right-0 w-80 bg-[#fdfaf6] shadow-2xl border border-[#1a1918] p-8 z-30"
              >
                <div className="space-y-8">
                  <div>
                    <h4 className="editorial-caption text-[#1a1918] mb-4 border-b border-[#1a1918]/20 pb-2">Generation Tool</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Midjourney', 'Stable Diffusion', 'Niji', 'DALL-E 3'].map(t => (
                        <button key={t} className="px-3 py-1 bg-transparent border border-[#1a1918]/20 text-[#1a1918] font-serif italic text-xs hover:border-[#c44d36] hover:text-[#c44d36] transition-colors">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="editorial-caption text-[#1a1918] mb-4 border-b border-[#1a1918]/20 pb-2">Access Level</h4>
                    <div className="flex flex-col gap-2">
                      <button className="text-left py-1 text-sm font-serif italic text-[#c44d36]">All Works</button>
                      <button className="text-left py-1 text-sm font-serif italic text-[#4a4845] hover:text-[#1a1918]">Free Access</button>
                      <button className="text-left py-1 text-sm font-serif italic text-[#4a4845] hover:text-[#1a1918]">PRO Exclusive</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <div className="py-32 text-center flex flex-col items-center">
          <LayoutGrid className="w-12 h-12 text-[#1a1918]/20 mb-6" />
          <h2 className="editorial-title text-3xl mb-4">No results found</h2>
          <p className="editorial-body text-[#4a4845] italic max-w-md mx-auto">
            We couldn't find any works matching your current filters or search query. Try adjusting your criteria.
          </p>
          <button 
            onClick={() => { setActiveCategory('All'); window.history.replaceState({}, '', '/'); }}
            className="mt-8 border-b border-[#1a1918] editorial-caption font-bold pb-1 text-[#1a1918] hover:text-[#c44d36] transition-colors"
          >
            CLEAR ALL FILTERS
          </button>
        </div>
      ) : (
        <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 4}}>
          <Masonry gutter="32px">
            {filteredWorks.map((work, i) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 8) * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                key={work.id + '-' + i}
              >
                <WorkCard work={work} />
              </motion.div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      )}

      {filteredWorks.length > 0 && (
        <div className="py-24 flex justify-center">
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1a1918]/20 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-[#1a1918]/40 animate-pulse delay-75"></span>
            <span className="w-2 h-2 rounded-full bg-[#1a1918] animate-pulse delay-150"></span>
          </div>
        </div>
      )}
    </div>
  );
}
