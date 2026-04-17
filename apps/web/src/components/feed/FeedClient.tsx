"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { getPosts, PostListItem, SortOption, PaginatedResponse } from "@/lib/api/client";
import { WorkCard } from "@/components/domain/WorkCard";
import { CategoryFilter } from "./CategoryFilter";
import { SortTabs } from "./SortTabs";

// Mock data adapter - converts API response to WorkCard format
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

interface FeedClientProps {
  initialPosts?: PaginatedResponse<PostListItem>;
  tag?: string;
  authorId?: string;
  following?: boolean;
  showCategoryFilter?: boolean;
}

export function FeedClient({
  initialPosts,
  tag,
  authorId,
  following = false,
  showCategoryFilter = true,
}: FeedClientProps) {
  const [sort, setSort] = useState<SortOption>("latest");
  const [category, setCategory] = useState<string>("All");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Map category to tag slug
  const getTagSlug = (cat: string): string | undefined => {
    if (cat === "All") return undefined;
    const mapping: Record<string, string> = {
      Illustration: "illustration",
      Manga: "manga",
      "Digital Painting": "digital-painting",
      "Concept Art": "concept-art",
      Anime: "anime",
    };
    return mapping[cat];
  };

  const effectiveTag = tag || getTagSlug(category);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts", effectiveTag, authorId, sort, following],
    queryFn: async ({ pageParam }) => {
      return getPosts({
        cursor: pageParam,
        limit: 20,
        tag: effectiveTag,
        authorId,
        sort,
        following,
      });
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    initialData: initialPosts
      ? { pages: [initialPosts], pageParams: [undefined] }
      : undefined,
  });

  // Reset query when sort or tag changes
  useEffect(() => {
    refetch();
  }, [sort, effectiveTag, refetch]);

  // Infinite scroll with IntersectionObserver
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

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

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
        <p className="text-[#c44d36]">加载失败，请稍后重试</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="editorial-body text-lg">暂无作品</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCategoryFilter && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CategoryFilter value={category} onChange={setCategory} />
          <SortTabs value={sort} onChange={setSort} />
        </div>
      )}

      {/* Masonry Grid using CSS columns */}
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
            已加载全部作品
          </p>
        )}
      </div>
    </div>
  );
}
