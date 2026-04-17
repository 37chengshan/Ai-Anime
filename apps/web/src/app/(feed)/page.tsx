import { Suspense } from "react";
import { FeedClient } from "@/components/feed/FeedClient";
import { getPosts } from "@/lib/api/client";

export default async function FeedPage() {
  // Server Component - fetch initial data
  let initialData;
  try {
    initialData = await getPosts({ limit: 20, sort: "latest" });
  } catch (error) {
    console.error("Failed to fetch initial posts:", error);
    initialData = undefined;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="editorial-title text-3xl md:text-4xl mb-2">最新作品</h1>
        <p className="editorial-caption text-sm text-[#4a4845]">
          发现来自全球创作者的 AI 动漫与漫画作品
        </p>
      </div>

      {/* Feed with infinite scroll */}
      <Suspense fallback={<div className="flex justify-center py-20">加载中...</div>}>
        <FeedClient
          initialPosts={initialData}
          showCategoryFilter={true}
        />
      </Suspense>
    </div>
  );
}
