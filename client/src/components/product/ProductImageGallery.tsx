"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export function ProductImageGallery({
  images,
  name,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);

  // Fallback image if no images are provided
  const displayImages =
    images?.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000",
        ];

  const handleImageChange = (index: number) => {
    if (index === activeIndex) return;
    setFading(true);
    setTimeout(() => {
      setActiveIndex(index);
      setFading(false);
    }, 200);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Display Area */}
      <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.5)] transition-all duration-500">
        {/* Dynamic Background Effects */}
        <div className="absolute -inset-[50%] bg-linear-to-tr from-emerald-500/15 via-teal-500/5 to-transparent blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        {/* Main Image Container */}
        <div
          className={cn(
            "relative w-full h-full p-8 md:p-16 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            fading
              ? "opacity-0 scale-95 blur-md"
              : "opacity-100 scale-100 blur-0",
          )}
        >
          <Image
            src={displayImages[activeIndex]}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8 md:p-16 drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)] transition-transform duration-1000 group-hover:scale-105"
          />
        </div>

        {/* Floating Image Label */}
        <div className="absolute bottom-8 right-8 backdrop-blur-2xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-200 shadow-2xl pointer-events-none z-20 transition-all duration-500 group-hover:translate-y-[-4px]">
          {activeIndex + 1} <span className="mx-2 text-emerald-500/50">/</span>{" "}
          {displayImages.length}
        </div>

        {/* High-end Inner Glow */}
        <div className="absolute inset-0 rounded-[3rem] border border-white/40 dark:border-white/5 pointer-events-none z-10" />
      </div>

      {/* Thumbnails Selection - Now Below Image */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 custom-scrollbar">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={cn(
                "relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 group/thumb",
                activeIndex === index
                  ? "border-emerald-500 ring-4 ring-emerald-500/10 scale-105 shadow-xl"
                  : "border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 shadow-sm",
              )}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-500 group-hover/thumb:scale-110"
              />
              {activeIndex !== index && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 group-hover/thumb:bg-transparent transition-colors duration-300" />
              )}
              {activeIndex === index && (
                <div className="absolute inset-0 border-2 border-emerald-500 rounded-2xl animate-pulse pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
      `}</style>
    </div>
  );
}
