"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MoreHorizontal, Heart, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { clsx } from "clsx";
import { toast } from "sonner";

// Types based on API response
interface CommentAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  post_id: string;
  author: CommentAuthor;
  parent_comment_id: string | null;
  content: string;
  status: string;
  ai_assisted: boolean;
  like_count: number;
  is_liked: boolean;
  is_own: boolean;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [input, setInput] = useState("");
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialComments);

  // Fetch comments from API
  useEffect(() => {
    if (!initialComments) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/posts/${postId}/comments?limit=100`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data.items || []);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          post_id: postId,
          ai_assisted: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to create comment");

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setInput("");
      toast.success("Critique submitted for review.");
    } catch (error) {
      toast.error("Failed to submit critique");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/v1/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete comment");

      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("Critique removed.");
    } catch (error) {
      toast.error("Failed to remove critique");
    }
  };

  const handleLike = async (comment: Comment) => {
    if (!user) return;

    const isLiked = comment.is_liked;
    const newCount = isLiked ? comment.like_count - 1 : comment.like_count + 1;

    // Optimistic update
    setComments(
      comments.map((c) =>
        c.id === comment.id ? { ...c, is_liked: !isLiked, like_count: newCount } : c
      )
    );

    try {
      const response = await fetch(`/api/v1/comments/${comment.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error("Failed to update like");
    } catch (error) {
      // Revert on error
      setComments(
        comments.map((c) =>
          c.id === comment.id ? { ...c, is_liked: isLiked, like_count: comment.like_count } : c
        )
      );
      toast.error("Failed to update like");
    }
  };

  const aiSuggestions = [
    "The juxtaposition of light and shadow here is masterful. Exceptional piece.",
    "A fascinating application of the algorithm, particularly in the fine detailing.",
    "This composition perfectly captures the essence of contemporary digital surrealism.",
  ];

  return (
    <div className="mt-20 border-t-[3px] border-[#1a1918] pt-12">
      <div className="flex items-end justify-between mb-12">
        <h3 className="editorial-title text-4xl text-[#1a1918]">Critical Discourse</h3>
        <span className="editorial-caption text-[#4a4845] font-bold pb-2">
          {comments.length} RESPONSES
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-16 border-b border-[#1a1918]/20 pb-16">
        {isUserLoaded && user ? (
          <img
            src={user.imageUrl || "/avatars/default.jpg"}
            alt="Avatar"
            className="w-12 h-12 object-cover shrink-0 filter grayscale border border-[#1a1918] p-0.5 bg-[#fdfaf6] hidden md:block"
          />
        ) : (
          <div className="w-12 h-12 shrink-0 border border-[#1a1918]/20 bg-[#1a1918]/5 hidden md:block" />
        )}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contribute to the discussion..."
              className="w-full bg-texture-light border border-[#1a1918]/20 focus:border-[#1a1918] rounded-none px-6 py-5 text-lg font-serif italic transition-colors resize-none min-h-[120px] focus:ring-0 placeholder:text-[#1a1918]/30"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <button
                type="button"
                onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                className={clsx(
                  "editorial-caption font-bold flex items-center gap-2 px-4 py-2 border transition-colors",
                  isAIAssistantOpen
                    ? "bg-[#c44d36] border-[#c44d36] text-[#fdfaf6]"
                    : "bg-transparent border-[#1a1918]/20 text-[#1a1918] hover:border-[#1a1918]"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                EDITORIAL AI
              </button>

              <button
                type="submit"
                disabled={!input.trim() || !user}
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
                <span className="editorial-caption text-[10px] font-bold text-[#c44d36]">
                  SUGGESTED DISCOURSE
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {aiSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(sug);
                      setIsAIAssistantOpen(false);
                    }}
                    className="text-left font-serif italic text-lg text-[#1a1918] hover:text-[#c44d36] bg-transparent border border-[#1a1918]/10 hover:border-[#c44d36] p-4 transition-colors"
                  >
                    &ldquo;{sug}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <span className="editorial-caption text-[#4a4845]">Loading discourse...</span>
        </div>
      ) : (
        <div className="space-y-12">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col md:flex-row gap-6">
              <img
                src={comment.author.avatar_url || "/avatars/default.jpg"}
                alt={comment.author.display_name || comment.author.username}
                className="w-12 h-12 object-cover shrink-0 filter grayscale border border-[#1a1918]/20 p-0.5 bg-[#fdfaf6] hidden md:block"
              />
              <div className="flex-1 border-l-2 border-[#1a1918]/10 pl-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="editorial-title text-xl text-[#1a1918]">
                        {comment.author.display_name || comment.author.username}
                      </span>
                    </div>
                    <span className="editorial-caption text-[10px] text-[#4a4845]">
                      {new Date(comment.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {comment.is_own && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-[#1a1918]/40 hover:text-[#1a1918] transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="font-serif text-lg leading-relaxed text-[#1a1918] mb-6">
                  {comment.content}
                </p>
                <div className="flex items-center gap-6 editorial-caption font-bold">
                  <button
                    onClick={() => handleLike(comment)}
                    className={clsx(
                      "flex items-center gap-2 transition-colors",
                      comment.is_liked ? "text-[#c44d36]" : "text-[#4a4845] hover:text-[#c44d36]"
                    )}
                  >
                    <Heart className={clsx("w-3.5 h-3.5", comment.is_liked && "fill-current")} />
                    {comment.like_count}
                  </button>
                  <button className="text-[#4a4845] hover:text-[#1a1918] transition-colors border-b border-transparent hover:border-[#1a1918]">
                    REPLY
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
