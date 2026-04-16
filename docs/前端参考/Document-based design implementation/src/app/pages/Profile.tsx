import React, { useState } from 'react';
import { useParams } from 'react-router';
import { MOCK_WORKS, CURRENT_USER } from '../data/mock';
import { WorkCard } from '../components/WorkCard';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Settings, Plus, MapPin, Link as LinkIcon, Calendar, Twitter, Github, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export function Profile() {
  const { id } = useParams();
  const isCurrentUser = id === CURRENT_USER.id || !id;
  const user = isCurrentUser ? CURRENT_USER : MOCK_WORKS.find(w => w.author.id === id)?.author || CURRENT_USER;
  
  const [activeTab, setActiveTab] = useState('works');
  const userWorks = MOCK_WORKS.filter(w => w.author.id === user.id);

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Editorial Header */}
      <header className="border-b-[3px] border-[#1a1918] pt-24 pb-16 relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-24 relative">
            <div className="relative group shrink-0">
              <img 
                src={user.avatar} 
                alt={user.nickname} 
                className="w-48 h-48 md:w-64 md:h-64 object-cover filter grayscale border border-[#1a1918] p-1 bg-[#fdfaf6] group-hover:grayscale-0 transition-all duration-700"
              />
              {user.isMember && (
                <div className="absolute -bottom-3 -right-3 bg-[#c44d36] text-[#fdfaf6] text-xs font-black px-4 py-2 uppercase tracking-[0.2em] border border-[#fdfaf6] shadow-2xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> PRO
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-4">
              <span className="editorial-caption text-[#c44d36] mb-6 uppercase tracking-[0.2em] border-b border-[#1a1918]/20 pb-2 inline-block">
                ARTIST PROFILE / No. 00{user.id.replace('u_', '')}
              </span>
              <h1 className="editorial-title text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-0.03em] mb-8">
                {user.nickname}
              </h1>
              <p className="editorial-body text-xl md:text-2xl leading-relaxed max-w-3xl mb-8 italic text-[#1a1918]">
                {user.bio}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 editorial-caption text-[#4a4845] font-bold border-y border-[#1a1918]/20 py-4">
                <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> TOKYO, JP</span>
                <span className="w-px h-3 bg-[#1a1918]/40"></span>
                <span className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> <a href="#" className="hover:text-[#c44d36] transition-colors border-b border-transparent hover:border-[#c44d36]">PORTFOLIO</a></span>
                <span className="w-px h-3 bg-[#1a1918]/40"></span>
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> JOINED '23</span>
              </div>
            </div>

          </div>
        </div>

        {/* Absolute Actions */}
        <div className="absolute top-8 right-8 flex items-center gap-4">
          {isCurrentUser ? (
            <>
              <button className="hidden md:flex editorial-caption font-bold items-center gap-2 border border-[#1a1918] bg-[#1a1918] text-[#fdfaf6] px-6 py-2.5 hover:bg-transparent hover:text-[#1a1918] transition-colors">
                <Plus className="w-3.5 h-3.5" /> PUBLISH
              </button>
              <button className="border border-[#1a1918] bg-transparent text-[#1a1918] w-10 h-10 flex items-center justify-center hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => toast.success('Followed.')} className="editorial-caption font-bold border border-[#1a1918] bg-[#1a1918] text-[#fdfaf6] px-8 py-2.5 hover:bg-transparent hover:text-[#1a1918] transition-colors">
                FOLLOW
              </button>
              <button onClick={() => toast.info('Messaging unavailable.')} className="editorial-caption font-bold border border-[#1a1918] bg-transparent text-[#1a1918] px-6 py-2.5 hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors">
                MESSAGE
              </button>
            </>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl mt-16">
        
        {/* Editorial Stats Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#1a1918] mb-16 text-center">
          <div className="border-r border-b md:border-b-0 border-[#1a1918]/20 p-8 bg-texture-light">
            <p className="editorial-title text-4xl mb-2">{user.worksCount}</p>
            <p className="editorial-caption text-[#c44d36] font-bold">ISSUES</p>
          </div>
          <div className="md:border-r border-b md:border-b-0 border-[#1a1918]/20 p-8 bg-transparent">
            <p className="editorial-title text-4xl mb-2">{(user.followersCount / 1000).toFixed(1)}k</p>
            <p className="editorial-caption text-[#4a4845] font-bold">READERS</p>
          </div>
          <div className="border-r border-[#1a1918]/20 p-8 bg-texture-light">
            <p className="editorial-title text-4xl mb-2">{user.followingCount}</p>
            <p className="editorial-caption text-[#c44d36] font-bold">FOLLOWING</p>
          </div>
          <div className="p-8 bg-transparent">
            <p className="editorial-title text-4xl mb-2">{(user.likesReceived / 1000).toFixed(1)}k</p>
            <p className="editorial-caption text-[#4a4845] font-bold">APPRECIATIONS</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-12 border-b border-[#1a1918]/20 mb-16 justify-center">
          {[
            { id: 'works', label: 'PORTFOLIO', count: user.worksCount },
            { id: 'collections', label: 'ARCHIVE', count: 12 },
            { id: 'likes', label: 'MOODBOARD', count: 340 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "relative pb-6 editorial-caption font-bold tracking-[0.15em] transition-colors whitespace-nowrap",
                activeTab === tab.id ? "text-[#1a1918]" : "text-[#1a1918]/40 hover:text-[#c44d36]"
              )}
            >
              {tab.label} <span className="ml-2 font-serif italic text-xs">{tab.count}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="profileTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1918]"
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'works' && (
          <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}>
            <Masonry gutter="32px">
              {userWorks.map((work, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  key={work.id}
                >
                  <WorkCard work={work} />
                </motion.div>
              ))}
              {userWorks.length === 0 && (
                <div className="col-span-full py-32 text-center border-y border-[#1a1918]/10 bg-texture-light">
                  <h3 className="editorial-title text-2xl mb-4 italic text-[#1a1918]/50">Blank Canvas</h3>
                  <p className="editorial-caption text-[#1a1918]/40">NO WORKS PUBLISHED YET.</p>
                </div>
              )}
            </Masonry>
          </ResponsiveMasonry>
        )}

        {activeTab !== 'works' && (
          <div className="py-32 text-center border-y border-[#1a1918]/10 bg-texture-light">
            <h3 className="editorial-title text-2xl mb-4 italic text-[#1a1918]/50">Restricted Access</h3>
            <p className="editorial-caption text-[#1a1918]/40">CONTENT UNAVAILABLE IN THIS EDITION.</p>
          </div>
        )}
      </div>
    </div>
  );
}
