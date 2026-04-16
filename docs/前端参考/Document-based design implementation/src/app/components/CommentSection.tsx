import React, { useState } from 'react';
import { Comment, CURRENT_USER } from '../data/mock';
import { MoreHorizontal, Heart, Sparkles, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export function CommentSection({ comments: initialComments }: { comments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [input, setInput] = useState('');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      workId: 'w_1',
      author: CURRENT_USER,
      content: input,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments([newComment, ...comments]);
    setInput('');
    toast.success('Critique submitted for review.');
  };

  const aiSuggestions = [
    'The juxtaposition of light and shadow here is masterful. Exceptional piece.',
    'A fascinating application of the algorithm, particularly in the fine detailing.',
    'This composition perfectly captures the essence of contemporary digital surrealism.'
  ];

  return (
    <div className="mt-20 border-t-[3px] border-[#1a1918] pt-12">
      <div className="flex items-end justify-between mb-12">
        <h3 className="editorial-title text-4xl text-[#1a1918]">Critical Discourse</h3>
        <span className="editorial-caption text-[#4a4845] font-bold pb-2">{comments.length} RESPONSES</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-16 border-b border-[#1a1918]/20 pb-16">
        <img src={CURRENT_USER.avatar} alt="Avatar" className="w-12 h-12 object-cover shrink-0 filter grayscale border border-[#1a1918] p-0.5 bg-[#fdfaf6] hidden md:block" />
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Contribute to the discussion..."
              className="w-full bg-texture-light border border-[#1a1918]/20 focus:border-[#1a1918] rounded-none px-6 py-5 text-lg font-serif italic transition-colors resize-none min-h-[120px] focus:ring-0 placeholder:text-[#1a1918]/30"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <button 
                type="button"
                onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                className={clsx("editorial-caption font-bold flex items-center gap-2 px-4 py-2 border transition-colors", isAIAssistantOpen ? "bg-[#c44d36] border-[#c44d36] text-[#fdfaf6]" : "bg-transparent border-[#1a1918]/20 text-[#1a1918] hover:border-[#1a1918]")}
              >
                <Sparkles className="w-3.5 h-3.5" />
                EDITORIAL AI
              </button>
              
              <button 
                type="submit"
                disabled={!input.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#1a1918] text-[#fdfaf6] disabled:bg-[#1a1918]/10 disabled:text-[#1a1918]/30 editorial-caption font-bold tracking-[0.1em] border border-transparent disabled:border-[#1a1918]/10 transition-colors hover:bg-[#c44d36]"
              >
                SUBMIT CRITIQUE
              </button>
            </div>
          </form>

          {isAIAssistantOpen && (
            <div className="mt-6 p-6 border border-[#c44d36] bg-[#c44d36]/5">
              <div className="flex items-center gap-2 mb-4 border-b border-[#c44d36]/20 pb-3">
                <Sparkles className="w-4 h-4 text-[#c44d36]" />
                <span className="editorial-caption text-[10px] font-bold text-[#c44d36]">SUGGESTED DISCOURSE</span>
              </div>
              <div className="flex flex-col gap-3">
                {aiSuggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => { setInput(sug); setIsAIAssistantOpen(false); }}
                    className="text-left font-serif italic text-lg text-[#1a1918] hover:text-[#c44d36] bg-transparent border border-[#1a1918]/10 hover:border-[#c44d36] p-4 transition-colors"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-12">
        {comments.map(comment => (
          <div key={comment.id} className="flex flex-col md:flex-row gap-6">
            <img src={comment.author.avatar} alt={comment.author.nickname} className="w-12 h-12 object-cover shrink-0 filter grayscale border border-[#1a1918]/20 p-0.5 bg-[#fdfaf6] hidden md:block" />
            <div className="flex-1 border-l-2 border-[#1a1918]/10 pl-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="editorial-title text-xl text-[#1a1918]">{comment.author.nickname}</span>
                    {comment.author.isMember && (
                      <span className="bg-[#c44d36] text-[#fdfaf6] text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                        PRO
                      </span>
                    )}
                  </div>
                  <span className="editorial-caption text-[10px] text-[#4a4845]">VOL. 4 / RECENT</span>
                </div>
                <button className="text-[#1a1918]/40 hover:text-[#1a1918] transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <p className="font-serif text-lg leading-relaxed text-[#1a1918] mb-6">
                {comment.content}
              </p>
              <div className="flex items-center gap-6 editorial-caption font-bold">
                <button className="flex items-center gap-2 text-[#4a4845] hover:text-[#c44d36] transition-colors group">
                  <Heart className="w-3.5 h-3.5 group-hover:fill-current" />
                  {comment.likes}
                </button>
                <button className="text-[#4a4845] hover:text-[#1a1918] transition-colors border-b border-transparent hover:border-[#1a1918]">
                  REPLY
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
