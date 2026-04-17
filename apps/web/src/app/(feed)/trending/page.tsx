import { Suspense } from "react";
import { FeedClient } from "@/components/feed/FeedClient";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { getPosts } from "@/lib/api/client";

export default async function TrendingPage() {
  let initialData;
  try {
    initialData = await getPosts({ limit: 20, sort: "trending" });
  } catch (error) {
    console.error("Failed to fetch trending posts:", error);
    initialData = undefined;
  }

  return (
    <div>
      <FeedHeader
        title="热门作品"
        subtitle="最受欢迎的 AI 创作"
      />

      <Suspense fallback={<div className="flex justify-center py-20">加载中...</div>}>
        <FeedClient
          initialPosts={initialData}
          showCategoryFilter={true}
        />
      </Suspense>
    </div>
  );
}
