import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Award, Calendar, MessageCircle } from "lucide-react";
import { getPost, getCreatorByHandle } from "@/lib/api/client";
import { PostActions } from "@/components/post/PostActions";
import { PostGallery } from "@/components/post/PostGallery";
import { CommentSection } from "@/components/domain/CommentSection";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  let post;
  try {
    post = await getPost(postId);
  } catch (error) {
    notFound();
  }

  // Format date
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Build images array
  const images = post.assets?.length > 0
    ? post.assets.map((a) => ({ id: a.id, url: a.url, width: a.width, height: a.height }))
    : post.cover_url
    ? [{ id: post.id, url: post.cover_url }]
    : [];

  return (
    <div className="min-h-screen bg-[#f4efeb]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1a1918]/10 bg-[#fdfaf6]/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#1a1918]/70 hover:text-[#1a1918] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-serif">返回</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-xs font-serif uppercase tracking-widest text-[#4a4845]">
            <Link href="/" className="hover:text-[#c44d36] transition-colors">
              首页
            </Link>
            <span>/</span>
            <Link
              href={`/creator/${post.author.username}`}
              className="hover:text-[#c44d36] transition-colors"
            >
              {post.author.display_name || post.author.username}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              {images.length > 0 && <PostGallery images={images} />}

              {/* Title & Meta */}
              <div className="space-y-4">
                <h1 className="editorial-title text-3xl md:text-4xl leading-tight">
                  {post.title}
                </h1>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="px-3 py-1 border border-[#1a1918]/20 text-xs font-serif uppercase tracking-widest hover:border-[#c44d36] hover:text-[#c44d36] transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Stats & Date */}
                <div className="flex items-center gap-6 text-sm text-[#4a4845]">
                  {publishedDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {publishedDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {post.comment_count} 评论
                  </span>
                  {post.ai_assisted && (
                    <span className="px-2 py-0.5 bg-[#c44d36]/10 text-[#c44d36] text-xs font-serif uppercase">
                      AI 辅助
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              {post.content && (
                <div className="prose prose-lg max-w-none editorial-body text-[#1a1918]/80">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-[#1a1918]/10">
                <PostActions
                  postId={post.id}
                  initialLiked={post.is_liked}
                  initialFavorited={post.is_favorited}
                  likeCount={post.like_count}
                  favoriteCount={post.favorite_count}
                />
              </div>

              {/* Comments */}
              <div className="pt-6 border-t border-[#1a1918]/10">
                <h2 className="editorial-title text-xl mb-6">评论</h2>
                <CommentSection postId={post.id} />
              </div>
            </div>

            {/* Sidebar - Author Info */}
            <div className="space-y-6">
              <div className="border border-[#1a1918]/10 bg-[#fdfaf6] p-6 space-y-4">
                <Link
                  href={`/creator/${post.author.username}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative">
                    <img
                      src={post.author.avatar_url || "/default-avatar.png"}
                      alt={post.author.display_name || post.author.username}
                      className="w-14 h-14 object-cover filter grayscale group-hover:grayscale-0 transition-all border border-[#1a1918]/10"
                    />
                    {post.author.creator_badge && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#c44d36] flex items-center justify-center">
                        <Award className="w-3 h-3 text-[#fdfaf6]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold italic text-[#1a1918] group-hover:text-[#c44d36] transition-colors">
                      {post.author.display_name || post.author.username}
                    </h3>
                    <p className="text-xs text-[#4a4845]">@{post.author.username}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PostPageProps) {
  const { postId } = await params;

  try {
    const post = await getPost(postId);
    return {
      title: `${post.title} - Ai-Anim`,
      description: post.excerpt || `${post.title} - AI 动漫作品`,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.cover_url ? [post.cover_url] : [],
      },
    };
  } catch {
    return {
      title: "作品详情 - Ai-Anim",
    };
  }
}
