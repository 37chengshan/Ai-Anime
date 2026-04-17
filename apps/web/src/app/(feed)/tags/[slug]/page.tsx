import { Suspense } from "react";
import { FeedClient } from "@/components/feed/FeedClient";
import { FeedHeader } from "@/components/feed/FeedHeader";
import { getPosts, getTags } from "@/lib/api/client";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  let tagName = slug;
  let initialData;
  try {
    // Try to get tag name from tags list
    const tags = await getTags();
    const matchedTag = tags.find((t) => t.slug === slug);
    if (matchedTag) {
      tagName = matchedTag.name;
    }
    initialData = await getPosts({ tag: slug, limit: 20 });
  } catch (error) {
    console.error("Failed to fetch tag posts:", error);
    initialData = undefined;
  }

  return (
    <div>
      <FeedHeader
        title={`#${tagName}`}
        subtitle={`标签 ${tagName} 下的作品`}
      />

      <Suspense fallback={<div className="flex justify-center py-20">加载中...</div>}>
        <FeedClient
          initialPosts={initialData}
          tag={slug}
          showCategoryFilter={false}
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  return {
    title: `#${slug} - Ai-Anim`,
    description: `浏览标签 ${slug} 下的 AI 动漫与漫画作品`,
  };
}
