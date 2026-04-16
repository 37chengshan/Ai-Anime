import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { MOCK_WORKS, MOCK_COMMENTS, CURRENT_USER } from '../data/mock';
import { CommentSection } from '../components/CommentSection';
import { ArrowLeft, Heart, Share2, Bookmark, Eye, Image as ImageIcon, Sparkles, MoreHorizontal, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export function WorkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const work = MOCK_WORKS.find(w => w.id === id) || MOCK_WORKS[0];
  const comments = MOCK_COMMENTS[work.id] || [];

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case 'like':
        setIsLiked(!isLiked);
        toast.success(isLiked ? 'Removed from your moodboard.' : 'Added to your moodboard.');
        break;
      case 'save':
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Unsaved.' : 'Archived to your library.');
        break;
      case 'share':
        toast.success('Link copied to clipboard.');
        break;
      case 'download':
        if (work.isPremium && !CURRENT_USER.isMember) {
          toast.error('This feature is for PRO members only. Please upgrade.');
          navigate('/pricing');
        } else {
          toast.success('Downloading high-res image...');
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Editorial Top Bar */}
      <div className="sticky top-[80px] z-30 bg-[#fdfaf6]/90 backdrop-blur-md border-b border-[#1a1918]/10 hidden md:block">
        <div className="container mx-auto px-4 lg:px-8 h-12 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 editorial-caption font-bold text-[#1a1918] hover:text-[#c44d36] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> 
            BACK TO GALLERY
          </button>
          <div className="flex items-center gap-6">
            <button onClick={() => handleAction('like')} className={clsx("flex items-center gap-1.5 transition-colors font-serif italic text-sm", isLiked ? "text-[#c44d36]" : "text-[#4a4845] hover:text-[#1a1918]")}>
              <Heart className={clsx("w-4 h-4", isLiked && "fill-current")} />
              {isLiked ? 'Liked' : 'Like'}
            </button>
            <button onClick={() => handleAction('save')} className={clsx("flex items-center gap-1.5 transition-colors font-serif italic text-sm", isSaved ? "text-[#c44d36]" : "text-[#4a4845] hover:text-[#1a1918]")}>
              <Bookmark className={clsx("w-4 h-4", isSaved && "fill-current")} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => handleAction('share')} className="flex items-center gap-1.5 font-serif italic text-[#4a4845] hover:text-[#1a1918] transition-colors text-sm">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-4 lg:px-8 mt-12 lg:mt-24 max-w-7xl">
        
        {/* Editorial Header */}
        <header className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <span className="editorial-caption text-[#c44d36] mb-8 uppercase tracking-[0.2em] border-b border-[#c44d36] pb-1">
            {work.category} / FEATURED
          </span>
          <h1 className="editorial-title text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-0.03em] max-w-5xl mx-auto mb-10">
            {work.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 editorial-caption border-y border-[#1a1918]/20 py-4 w-full max-w-2xl mx-auto text-[#4a4845]">
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> {(work.views / 1000).toFixed(1)}k VIEWS
            </span>
            <span className="w-1 h-1 bg-[#1a1918]/40 rounded-full"></span>
            <span className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" /> {work.likes} LIKES
            </span>
            <span className="w-1 h-1 bg-[#1a1918]/40 rounded-full"></span>
            <span>{new Date(work.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="relative mb-20 group mx-auto max-w-6xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full bg-[#1a1918] overflow-hidden"
          >
            <img 
              src={work.images[0]} 
              alt={work.title} 
              className="w-full h-auto max-h-[85vh] object-contain mx-auto filter contrast-[0.98] sepia-[0.05]"
            />
          </motion.div>
          {work.isPremium && (
            <div className="absolute top-6 left-6 md:-left-4 md:-top-4 bg-[#c44d36] text-[#fdfaf6] text-xs font-bold px-4 py-2 uppercase tracking-widest flex items-center gap-2 border border-[#fdfaf6] shadow-2xl">
              <Sparkles className="w-4 h-4" /> PRO EXCLUSIVE
            </div>
          )}
          <figcaption className="text-right mt-4 editorial-caption text-[#4a4845]">
            Fig. 1 — Generated with {work.toolUsed || 'AI Model'}
          </figcaption>
        </figure>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative max-w-6xl mx-auto w-full">
          
          {/* Main Article Content */}
          <div className="flex-1 lg:w-2/3">
            
            <div className="editorial-body text-lg md:text-xl lg:text-2xl leading-[1.9] mb-16 drop-cap text-[#1a1918]">
              {/* Fake drop cap logic */}
              {work.description && work.description.length > 0 ? (
                <>
                  <span className="float-left text-7xl leading-none font-serif text-[#1a1918] pr-4 pt-2">
                    {work.description.charAt(0)}
                  </span>
                  {work.description.slice(1)}
                </>
              ) : (
                <p className="italic text-[#4a4845]">No author commentary provided for this piece.</p>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-16 md:hidden border-y border-[#1a1918]/20 py-6">
              <button onClick={() => handleAction('like')} className={clsx("flex items-center justify-center gap-2 px-6 py-3 border transition-colors font-bold editorial-caption flex-1", isLiked ? "border-[#c44d36] text-[#c44d36] bg-[#c44d36]/5" : "border-[#1a1918] text-[#1a1918]")}>
                <Heart className={clsx("w-4 h-4", isLiked && "fill-current")} /> {work.likes + (isLiked ? 1 : 0)}
              </button>
              <button onClick={() => handleAction('save')} className={clsx("flex items-center justify-center gap-2 px-6 py-3 border transition-colors font-bold editorial-caption flex-1", isSaved ? "border-[#c44d36] text-[#c44d36] bg-[#c44d36]/5" : "border-[#1a1918] text-[#1a1918]")}>
                <Bookmark className={clsx("w-4 h-4", isSaved && "fill-current")} /> SAVE
              </button>
              <button onClick={() => handleAction('download')} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-[#1a1918] text-[#fdfaf6] border border-[#1a1918] text-sm font-bold editorial-caption transition-colors hover:bg-transparent hover:text-[#1a1918]">
                <Download className="w-4 h-4" /> DOWNLOAD HI-RES
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-16 border-t border-[#1a1918]/20 pt-8">
              <span className="editorial-caption mr-4 leading-8 text-[#1a1918]">INDEX TERMS:</span>
              {work.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-transparent text-[#4a4845] hover:text-[#1a1918] hover:border-[#1a1918] border border-[#1a1918]/20 text-xs font-serif italic transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>

            {/* Comments */}
            <div className="border-t-[3px] border-[#1a1918] pt-16">
              <CommentSection comments={comments} />
            </div>

          </div>

          {/* Sidebar Column */}
          <aside className="w-full lg:w-1/3 shrink-0 relative">
            <div className="sticky top-32 space-y-12">
              
              {/* Download Action Desktop */}
              <div className="hidden md:block border border-[#1a1918] p-6 bg-texture-light">
                <button onClick={() => handleAction('download')} className="w-full py-4 bg-[#1a1918] text-[#fdfaf6] hover:bg-[#c44d36] hover:border-[#c44d36] border border-[#1a1918] transition-colors flex flex-col items-center justify-center gap-2">
                  <span className="editorial-caption font-bold tracking-[0.2em]">ACQUIRE PRINT FILE</span>
                  <span className="font-serif italic text-xs opacity-70">
                    {work.isPremium ? "PRO Exclusive Download" : "High-Resolution TIF / PNG"}
                  </span>
                </button>
              </div>

              {/* Author Profile Block */}
              <div className="border-y border-[#1a1918]/20 py-8">
                <span className="editorial-caption mb-6 block tracking-widest text-[#4a4845]">ABOUT THE ARTIST</span>
                
                <Link to={`/profile/${work.author.id}`} className="block mb-6 relative w-24 h-24 group">
                  <img src={work.author.avatar} alt={work.author.nickname} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                  {work.author.isMember && (
                    <span className="absolute -bottom-2 -right-2 bg-[#c44d36] text-[#fdfaf6] text-[9px] font-black px-2 py-1 uppercase tracking-widest shadow-md">
                      PRO
                    </span>
                  )}
                </Link>
                
                <h3 className="editorial-title text-2xl mb-2 hover:text-[#c44d36] transition-colors">
                  <Link to={`/profile/${work.author.id}`}>{work.author.nickname}</Link>
                </h3>
                
                <p className="editorial-body text-base mb-6 line-clamp-4">
                  {work.author.bio}
                </p>

                <div className="flex gap-4 border-t border-[#1a1918]/10 pt-6">
                  <button className="flex-1 py-2.5 bg-transparent border border-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6] text-[#1a1918] editorial-caption font-bold transition-colors">
                    FOLLOW
                  </button>
                  <button className="w-12 border border-[#1a1918] hover:bg-[#1a1918] hover:text-[#fdfaf6] text-[#1a1918] flex items-center justify-center transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Specs */}
              {work.toolUsed && (
                <div className="border border-[#1a1918]/20 p-6 bg-texture-light">
                  <span className="editorial-caption block mb-4 text-[#4a4845]">TECHNICAL SPECIFICATIONS</span>
                  <div className="flex items-start gap-4">
                    <ImageIcon className="w-5 h-5 text-[#1a1918] shrink-0 mt-1" />
                    <div>
                      <p className="font-serif italic text-lg text-[#1a1918]">{work.toolUsed}</p>
                      <p className="text-sm editorial-caption text-[#4a4845] mt-2 leading-relaxed">
                        Algorithm / Generation Tool
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </aside>

        </div>
      </article>

      {/* Similar Works Mock - Full Bleed Grid */}
      <section className="mt-32 border-t-[3px] border-[#1a1918] pt-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="editorial-title text-4xl text-center mb-12">More from the Archive</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1918]/20">
            {MOCK_WORKS.slice(1, 5).map(w => (
              <Link to={`/work/${w.id}`} key={w.id} className="relative aspect-[3/4] bg-[#fdfaf6] group block overflow-hidden">
                <img src={w.images[0]} alt={w.title} className="w-full h-full object-cover filter contrast-100 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-[#1a1918]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="editorial-caption text-[#fdfaf6] font-bold">{w.category}</span>
                  <h3 className="editorial-title text-2xl text-[#fdfaf6] mt-2 leading-tight">{w.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
