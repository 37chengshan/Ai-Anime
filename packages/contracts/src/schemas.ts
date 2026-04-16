import { z } from "zod";

export const CreateUserSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3).max(64),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
});

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000).optional(),
  excerpt: z.string().max(500).optional(),
  visibility: z.enum(["public", "followers", "private"]).default("public"),
  publish: z.boolean().default(false),
  assetIds: z.array(z.string().uuid()).min(0).max(20),
  tagIds: z.array(z.string().uuid()).min(0).max(10),
});

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentCommentId: z.string().uuid().optional(),
});

export const UploadSignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\//),
  size: z.number().min(1).max(20 * 1024 * 1024), // 20MB max
});
