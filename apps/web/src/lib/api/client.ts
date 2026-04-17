/**
 * API 客户端工具
 * 提供与后端 API 通信的基础函数
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  next_cursor: string | null;
}

export interface PostAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  creator_badge: boolean;
}

export interface PostAsset {
  id: string;
  kind: string;
  url: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostListItem {
  id: string;
  author: PostAuthor;
  title: string;
  slug: string | null;
  excerpt: string | null;
  cover_url: string | null;
  tags: Tag[];
  like_count: number;
  favorite_count: number;
  comment_count: number;
  published_at: string | null;
  created_at: string;
}

export interface PostDetail extends PostListItem {
  content: string | null;
  visibility: string;
  status: string;
  cover_asset: PostAsset | null;
  assets: PostAsset[];
  ai_assisted: boolean;
  is_liked: boolean;
  is_favorited: boolean;
  updated_at: string;
}

export interface CreatorInfo {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  creator_badge: boolean;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export interface CreatorPageData {
  user: CreatorInfo;
  stats: {
    follower_count: number;
    following_count: number;
  };
  posts: PostListItem[];
}

export type SortOption = "latest" | "popular" | "trending";

export interface FeedFilters {
  tag?: string;
  authorId?: string;
  sort?: SortOption;
  search?: string;
}

/**
 * 获取作品列表
 */
export async function getPosts(params: {
  cursor?: string;
  limit?: number;
  status?: string;
  tag?: string;
  authorId?: string;
  sort?: SortOption;
  search?: string;
  following?: boolean;
}): Promise<PaginatedResponse<PostListItem>> {
  const searchParams = new URLSearchParams();
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.authorId) searchParams.set("author_id", params.authorId);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.search) searchParams.set("search", params.search);
  if (params.following) searchParams.set("following", "true");

  const response = await fetch(`${API_URL}/api/v1/posts?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取作品详情
 */
export async function getPost(postId: string): Promise<PostDetail> {
  const response = await fetch(`${API_URL}/api/v1/posts/${postId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Post not found");
    }
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取标签列表
 */
export async function getTags(): Promise<Tag[]> {
  const response = await fetch(`${API_URL}/api/v1/tags`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取创作者主页数据
 */
export async function getCreatorByHandle(handle: string): Promise<CreatorPageData> {
  const response = await fetch(`${API_URL}/api/v1/creators/${handle}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Creator not found");
    }
    throw new Error(`Failed to fetch creator: ${response.statusText}`);
  }

  return response.json();
}
