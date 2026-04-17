"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Loader2, ImageOff } from "lucide-react";
import { getPosts, PostListItem, PaginatedResponse } from "@/lib/api/client";
import { WorkCard } from "@/components/domain/WorkCard";

// Mock data adapter
function adaptPostToWork(post: PostListItem) {
  return {
    id: post.id,
    title: post.title,
    images: post.cover_url ? [post.cover_url] : [],
    category: post.tags?.[0]?.name || "Uncategorized",
    author: {
      id: post.author.id,
      nickname: post.author.display_name || post.author.username,
      avatar: post.author.avatar_url || "",
      isMember: post.author.creator_badge,
    },
    likes: post.like_count,
    comments: post.comment_count,
    createdAt: post.published_at || post.created_at,
  };
}

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["search", query],
    queryFn: async ({ pageParam }) => {
      return getPosts({
        cursor: pageParam,
        limit: 20,
        search: query,
      });
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: query.length > 0,
  });

  const handleObserverCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserverCallback, {
      threshold: 0.1,
    });
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserverCallback]);

  if (!query) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#c44d36]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-[#c44d36]">搜索失败，请稍后重试</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ImageOff className="w-12 h-12 text-[#4a4845] mb-4" />
        <p className="editorial-body text-lg">未找到相关作品</p>
        <p className="editorial-caption text-sm mt-2 text-[#4a4845]">
          尝试其他关键词
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="editorial-caption text-sm text-[#4a4845]">
        找到 {total} 个结果
      </p>

      {/* Masonry Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.3) }}
          >
            <WorkCard work={adaptPostToWork(post)} />
          </motion.div>
        ))}
      </motion.div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-[#c44d36]" />
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="editorial-caption text-sm text-[#4a4845]">
            已加载全部结果
          </p>
        )}
      </div>
    </div>
  );
}
