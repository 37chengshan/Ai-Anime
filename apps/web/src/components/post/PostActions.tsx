"use client";

import React, { useState } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  initialLiked?: boolean;
  initialFavorited?: boolean;
  likeCount?: number;
  favoriteCount?: number;
}

export function PostActions({
  postId,
  initialLiked = false,
  initialFavorited = false,
  likeCount: initialLikeCount = 0,
  favoriteCount: initialFavoriteCount = 0,
}: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));

    try {
      const response = await fetch(`/api/v1/posts/${postId}/${isLiked ? "like" : "unlike"}`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      toast.success(isLiked ? "取消点赞" : "已点赞");
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(initialLikeCount);
      toast.error("操作失败");
    }
  };

  const handleFavorite = async () => {
    // Optimistic update
    setIsFavorited(!isFavorited);
    setFavoriteCount((prev) => prev + (isFavorited ? -1 : 1));

    try {
      const response = await fetch(`/api/v1/posts/${postId}/${isFavorited ? "favorite" : "unfavorite"}`, {
        method: isFavorited ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }

      toast.success(isFavorited ? "取消收藏" : "已收藏");
    } catch (error) {
      // Revert on error
      setIsFavorited(isFavorited);
      setFavoriteCount(initialFavoriteCount);
      toast.error("操作失败");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("链接已复制");
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleLike}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 border transition-colors",
          isLiked
            ? "border-[#c44d36] bg-[#c44d36]/10 text-[#c44d36]"
            : "border-[#1a1918]/30 text-[#1a1918]/70 hover:border-[#1a1918]"
        )}
      >
        <Heart className={clsx("w-4 h-4", isLiked && "fill-current")} />
        <span className="text-sm font-serif">{likeCount}</span>
      </button>

      <button
        onClick={handleFavorite}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 border transition-colors",
          isFavorited
            ? "border-[#c44d36] bg-[#c44d36]/10 text-[#c44d36]"
            : "border-[#1a1918]/30 text-[#1a1918]/70 hover:border-[#1a1918]"
        )}
      >
        <Bookmark className={clsx("w-4 h-4", isFavorited && "fill-current")} />
        <span className="text-sm font-serif">{favoriteCount}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 border border-[#1a1918]/30 text-[#1a1918]/70 hover:border-[#1a1918] transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-serif">分享</span>
      </button>
    </div>
  );
}
