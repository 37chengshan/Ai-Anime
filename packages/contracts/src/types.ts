export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  username: string;
  status: "active" | "banned" | "deleted";
  role: "user" | "creator" | "admin";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  socialLinks: Record<string, string>;
  creatorBadge: boolean;
}

export interface Post {
  id: string;
  authorUserId: string;
  title: string;
  slug: string | null;
  content: string | null;
  excerpt: string | null;
  visibility: "public" | "followers" | "private";
  status: "draft" | "processing" | "published" | "flagged" | "archived";
  coverAssetId: string | null;
  aiAssisted: boolean;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorUserId: string;
  parentCommentId: string | null;
  content: string;
  status: "visible" | "hidden" | "flagged";
  aiAssisted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
  };
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}
