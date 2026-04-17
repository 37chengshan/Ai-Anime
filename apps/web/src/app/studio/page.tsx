/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Upload, X, Loader2, ImageIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UploadedImage {
  id: string;
  url: string;
  object_key: string;
}

type Visibility = "public" | "followers" | "private";

export default function StudioPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [isAiAssistedChecked, setIsAiAssistedChecked] = useState(false);

  // Upload state
  const [coverImage, setCoverImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);

  // Auth check - must be after all hooks
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (isLoaded && !isSignedIn) {
    router.push("/auth/sign-in");
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("请选择图片文件");
        return;
      }

      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("图片大小不能超过 20MB");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Step 1: Get signed URL
        const signResponse = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
            size_bytes: file.size,
          }),
        });

        if (!signResponse.ok) {
          throw new Error("获取上传签名失败");
        }

        const { signed_url: signedUrl, asset_id, object_key } = await signResponse.json();

        // Step 2: Upload to R2
        setUploadProgress(30);

        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("上传到云存储失败");
        }

        setUploadProgress(70);

        // Step 3: Complete upload
        const completeResponse = await fetch("/api/uploads/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset_id }),
        });

        if (!completeResponse.ok) {
          throw new Error("确认上传失败");
        }

        setUploadProgress(100);

        // Set cover image
        setCoverImage({
          id: asset_id,
          url: signedUrl.split("?")[0], // Use the URL without query params for display
          object_key,
        });

        toast.success("封面上传成功");
      } catch (error) {
        console.error("[Upload Error]", error);
        toast.error(error instanceof Error ? error.message : "上传失败");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    []
  );

  const handleRemoveCover = () => {
    setCoverImage(null);
  };

  const handlePublish = async () => {
    // Validate
    if (!title.trim()) {
      toast.error("请输入作品标题");
      return;
    }

    if (title.length > 200) {
      toast.error("标题不能超过 200 字符");
      return;
    }

    if (!coverImage) {
      toast.error("请上传封面图片");
      return;
    }

    setIsPublishing(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          visibility,
          cover_asset_id: coverImage.id,
          asset_ids: [],
          tag_ids: [],
          ai_assisted: isAiAssistedChecked,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "发布失败");
      }

      const post = await response.json();
      toast.success("作品发布成功");
      router.push(`/post/${post.id}`);
    } catch (error) {
      console.error("[Publish Error]", error);
      toast.error(error instanceof Error ? error.message : "发布失败");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-ink/15 bg-paper-light">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div>
            <h1 className="editorial-title text-2xl">发布作品</h1>
            <p className="editorial-caption text-xs">创建并发布您的 AI 创作</p>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Cover Image Upload */}
          <section className="mb-10">
            <label className="editorial-caption mb-3 block text-xs">封面图片 *</label>
            <div className="relative">
              {coverImage ? (
                <div className="relative aspect-[16/9] w-full border border-ink/15 bg-ink/5">
                  <img
                    src={coverImage.url}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={handleRemoveCover}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-ink/20 bg-paper/90 text-ink hover:bg-paper hover:text-[#c44d36]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-ink/20 bg-ink/5 transition-colors hover:border-ink/40",
                    isUploading && "pointer-events-none opacity-60"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-ink-light" />
                      <span className="mt-2 text-sm text-ink-light">
                        上传中... {uploadProgress}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-ink-light" />
                      <span className="mt-2 text-sm text-ink-light">
                        点击上传封面图片
                      </span>
                      <span className="mt-1 text-xs text-ink-light/60">
                        PNG, JPG, WEBP 最大 20MB
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </section>

          {/* Title */}
          <section className="mb-8">
            <label htmlFor="title" className="editorial-caption mb-3 block text-xs">
              标题 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="为您的作品起一个标题"
              maxLength={200}
              className="w-full border border-ink/30 bg-transparent px-4 py-3 text-lg text-ink placeholder:text-ink-light focus:border-ink focus:outline-none"
            />
            <div className="mt-1 flex justify-end">
              <span className="editorial-caption text-xs text-ink-light">
                {title.length}/200
              </span>
            </div>
          </section>

          {/* Content */}
          <section className="mb-8">
            <label htmlFor="content" className="editorial-caption mb-3 block text-xs">
              内容描述
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="描述您的创作过程、灵感来源等...（可选）"
              rows={6}
              className="w-full border border-ink/30 bg-transparent px-4 py-3 text-ink placeholder:text-ink-light focus:border-ink focus:outline-none resize-none"
            />
          </section>

          {/* Visibility */}
          <section className="mb-8">
            <label className="editorial-caption mb-3 block text-xs">可见性</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border px-4 py-3 text-sm transition-colors",
                  visibility === "public"
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/30 text-ink-light hover:border-ink/50"
                )}
              >
                <Eye className="h-4 w-4" />
                公开
              </button>
              <button
                type="button"
                onClick={() => setVisibility("followers")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border px-4 py-3 text-sm transition-colors",
                  visibility === "followers"
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/30 text-ink-light hover:border-ink/50"
                )}
              >
                <Eye className="h-4 w-4" />
                仅粉丝
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border px-4 py-3 text-sm transition-colors",
                  visibility === "private"
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/30 text-ink-light hover:border-ink/50"
                )}
              >
                <EyeOff className="h-4 w-4" />
                私密
              </button>
            </div>
          </section>

          {/* AI Assisted */}
          <section className="mb-10">
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAiAssistedChecked}
                  onChange={(e) => setIsAiAssistedChecked(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "h-5 w-9 border transition-colors",
                    isAiAssistedChecked
                      ? "border-[#c44d36] bg-[#c44d36]"
                      : "border-ink/30 bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-4 w-4 bg-paper transition-transform",
                      isAiAssistedChecked ? "left-3.5" : "left-0.5"
                    )}
                  />
                </div>
              </div>
              <div>
                <span className="text-sm text-ink">AI 辅助创作</span>
                <p className="editorial-caption text-xs text-ink-light">
                  标记此作品是否使用了 AI 辅助生成
                </p>
              </div>
            </label>
          </section>

          {/* Divider */}
          <div className="mb-10 border-t border-ink/10" />

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-ink/30 px-6 py-2.5 text-sm text-ink-light transition-colors hover:border-ink hover:text-ink"
            >
              取消
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !coverImage || !title.trim()}
              className="flex items-center gap-2 bg-[#c44d36] px-8 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-[#c44d36]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPublishing ? "发布中..." : "发布作品"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
