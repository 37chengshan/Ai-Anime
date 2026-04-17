"use client";

import { Suspense } from "react";
import { FeedClient } from "@/components/feed/FeedClient";
import { FeedHeader } from "@/components/feed/FeedHeader";

export default function FollowingPage() {
  return (
    <div>
      <FeedHeader
        title="关注动态"
        subtitle="查看你关注的创作者最新作品"
      />

      <Suspense fallback={<div className="flex justify-center py-20">加载中...</div>}>
        <FeedClient
          following={true}
          showCategoryFilter={true}
        />
      </Suspense>
    </div>
  );
}
