import React, { useState } from 'react';
import { UploadCloud, X, ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function Upload() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('Illustration');
  const [tool, setTool] = useState('Midjourney');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImages(['https://images.unsplash.com/photo-1744686909443-eb72a54de998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzc1NDU5NDcxfDA&ixlib=rb-4.1.0&q=80&w=1080']);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || images.length === 0) {
      toast.error('Title and artwork are required for publication.');
      return;
    }
    
    toast.success('Your work has been published to the archive.', { duration: 3000 });
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent py-16 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-b-[3px] border-[#1a1918] pb-12">
          <span className="editorial-caption text-[#c44d36] mb-6 block">CONTRIBUTE TO THE ARCHIVE</span>
          <h1 className="editorial-title text-5xl md:text-7xl mb-6 tracking-[-0.03em]">Manuscript Submission</h1>
          <p className="editorial-body text-xl max-w-2xl italic">
            Publish your latest AI-generated pieces to the Figmake quarterly collection. Ensure your metadata is accurate for proper indexing.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Visual Assets */}
          <div className="space-y-12">
            <div className="border border-[#1a1918] p-6 bg-texture-light">
              <span className="editorial-caption block mb-4 border-b border-[#1a1918]/20 pb-2">FIGURE 1 — PRIMARY ARTWORK</span>
              
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => {
                  if (images.length === 0) {
                    setImages(['https://images.unsplash.com/photo-1744686909443-eb72a54de998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzc1NDU5NDcxfDA&ixlib=rb-4.1.0&q=80&w=1080']);
                  }
                }}
                className={clsx(
                  "relative border border-[#1a1918] border-dashed overflow-hidden transition-all duration-300 cursor-pointer aspect-[3/4] flex flex-col items-center justify-center group bg-[#fdfaf6]",
                  images.length > 0 ? "border-solid" : "hover:border-[#c44d36] hover:bg-[#c44d36]/5"
                )}
              >
                {images.length > 0 ? (
                  <>
                    <img src={images[0]} alt="Preview" className="w-full h-full object-cover filter contrast-[0.98] sepia-[0.05] group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-[#1a1918]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                      <span className="editorial-caption text-[#fdfaf6] border-b border-[#fdfaf6] pb-1">CURRENTLY SELECTED</span>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImages([]); }}
                        className="px-6 py-2 bg-transparent border border-[#fdfaf6] text-[#fdfaf6] editorial-caption font-bold hover:bg-[#fdfaf6] hover:text-[#1a1918] transition-colors"
                      >
                        REPLACE IMAGE
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <UploadCloud className="w-8 h-8 text-[#1a1918] mx-auto mb-6 opacity-50 group-hover:opacity-100 group-hover:text-[#c44d36] transition-colors" />
                    <p className="editorial-caption font-bold mb-4">DRAG & DROP OR CLICK TO BROWSE</p>
                    <p className="font-serif italic text-[#4a4845] text-sm">JPG, PNG, or WEBP / Max 20MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-[#c44d36] p-8 bg-[#c44d36]/5">
              <div className="flex items-start gap-4">
                <Sparkles className="w-5 h-5 text-[#c44d36] shrink-0 mt-1" />
                <div>
                  <h4 className="editorial-caption font-bold text-[#c44d36] mb-3">AI COPYWRITER (PRO)</h4>
                  <p className="font-serif italic text-[#c44d36]/80 text-sm mb-6 leading-relaxed">
                    Struggling with the synopsis? Let our editorial AI draft a compelling description and generate relevant index tags for your artwork.
                  </p>
                  <button type="button" className="editorial-caption font-bold bg-transparent border border-[#c44d36] text-[#c44d36] px-6 py-2 hover:bg-[#c44d36] hover:text-[#fdfaf6] transition-colors">
                    AUTO-GENERATE DRAFT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-10">
            <div>
              <label className="editorial-caption block mb-4 border-b border-[#1a1918]/20 pb-2">TITLE OF WORK <span className="text-[#c44d36]">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Neon Nights in Neo-Tokyo"
                className="w-full bg-transparent border-0 border-b border-[#1a1918] focus:border-[#c44d36] rounded-none px-0 py-4 text-2xl font-serif italic text-[#1a1918] transition-colors focus:ring-0 placeholder:text-[#1a1918]/30"
              />
            </div>

            <div>
              <label className="editorial-caption block mb-4 border-b border-[#1a1918]/20 pb-2">AUTHOR'S COMMENTARY</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Share your prompt, workflow, or inspiration behind this piece..."
                className="w-full bg-texture-light border border-[#1a1918]/20 focus:border-[#1a1918] rounded-none p-6 text-lg editorial-body transition-colors focus:ring-0 resize-y min-h-[200px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="editorial-caption block mb-4 border-b border-[#1a1918]/20 pb-2">CATEGORY</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-transparent border border-[#1a1918]/20 focus:border-[#1a1918] rounded-none px-4 py-3 text-sm editorial-caption font-bold transition-colors focus:ring-0 appearance-none text-[#1a1918]"
                  >
                    <option>Illustration</option>
                    <option>Anime</option>
                    <option>Manga</option>
                    <option>Concept Art</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1a1918]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="editorial-caption block mb-4 border-b border-[#1a1918]/20 pb-2">ALGORITHM / TOOL</label>
                <div className="relative">
                  <select 
                    value={tool}
                    onChange={e => setTool(e.target.value)}
                    className="w-full bg-transparent border border-[#1a1918]/20 focus:border-[#1a1918] rounded-none px-4 py-3 text-sm editorial-caption font-bold transition-colors focus:ring-0 appearance-none text-[#1a1918]"
                  >
                    <option>Midjourney</option>
                    <option>Stable Diffusion</option>
                    <option>Niji</option>
                    <option>DALL-E 3</option>
                    <option>Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1a1918]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="editorial-caption block mb-4 border-b border-[#1a1918]/20 pb-2">INDEX TAGS</label>
              <div className="bg-transparent border border-[#1a1918]/20 focus-within:border-[#1a1918] p-4 transition-colors flex flex-wrap gap-2 items-center min-h-[64px]">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 border border-[#1a1918] text-[#1a1918] editorial-caption px-3 py-1.5 bg-[#1a1918]/5">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="text-[#1a1918]/50 hover:text-[#c44d36] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "Type and press enter..." : "Add tag..."}
                  className="bg-transparent border-none focus:ring-0 font-serif italic text-sm w-48 min-w-[120px] outline-none placeholder:text-[#1a1918]/40"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between border-y border-[#1a1918]/20 py-6">
              <div>
                <span className="editorial-caption block font-bold text-[#1a1918] mb-1">PRO EXCLUSIVE</span>
                <span className="font-serif italic text-sm text-[#4a4845]">Restrict access to subscribers only</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-12 h-6 bg-[#1a1918]/10 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#fdfaf6] after:border-[#1a1918]/30 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c44d36] peer-checked:after:border-transparent border border-[#1a1918]/20"></div>
              </label>
            </div>

            <div className="flex gap-6 pt-8 border-t-[3px] border-[#1a1918]">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-4 bg-transparent border border-[#1a1918] text-[#1a1918] editorial-caption font-bold hover:bg-[#1a1918] hover:text-[#fdfaf6] transition-colors"
              >
                DISCARD
              </button>
              <button 
                type="submit"
                className="w-2/3 py-4 bg-[#1a1918] text-[#fdfaf6] editorial-caption font-bold hover:bg-[#c44d36] border border-[#1a1918] hover:border-[#c44d36] transition-colors"
              >
                SUBMIT FOR PUBLICATION
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
