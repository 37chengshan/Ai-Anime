"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface PostGalleryProps {
  images: Array<{
    id: string;
    url: string;
    width?: number | null;
    height?: number | null;
  }>;
}

export function PostGallery({ images }: PostGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[selectedIndex];

  const goNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-auto overflow-hidden bg-[#1a1918]/5 cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={currentImage.url}
            alt=""
            className="w-full h-auto object-contain"
          />

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-[#fdfaf6]/50 bg-[#1a1918]/30 backdrop-blur-sm flex items-center justify-center text-[#fdfaf6] hover:bg-[#1a1918]/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-[#fdfaf6]/50 bg-[#1a1918]/30 backdrop-blur-sm flex items-center justify-center text-[#fdfaf6] hover:bg-[#1a1918]/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(index)}
                className={clsx(
                  "flex-shrink-0 w-16 h-16 border-2 overflow-hidden transition-colors",
                  index === selectedIndex
                    ? "border-[#c44d36]"
                    : "border-transparent hover:border-[#1a1918]/30"
                )}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1a1918]/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 border border-[#fdfaf6]/50 flex items-center justify-center text-[#fdfaf6] hover:bg-[#fdfaf6]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-[#fdfaf6]/50 flex items-center justify-center text-[#fdfaf6] hover:bg-[#fdfaf6]/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-[#fdfaf6]/50 flex items-center justify-center text-[#fdfaf6] hover:bg-[#fdfaf6]/10 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={currentImage.url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#fdfaf6]/70 text-sm font-serif">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
