"use client";

import { useState } from "react";
import { Download, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface IssueImage {
  id: string;
  storage_path: string;
  display_order: number;
}

interface IssueImagesDisplayProps {
  images: IssueImage[];
  className?: string;
}

export default function IssueImagesDisplay({
  images,
  className,
}: IssueImagesDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleDownload = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `issue-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error("Failed to download image:", error);
    }
  };

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Attachments ({images.length})
        </h4>

        <div className={cn(
          "grid gap-3",
          images.length === 1 && "grid-cols-1",
          images.length === 2 && "grid-cols-2",
          images.length >= 3 && "grid-cols-3"
        )}>
          {images
            .sort((a, b) => a.display_order - b.display_order)
            .map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image.storage_path)}
                className="relative aspect-video rounded-lg border-2 border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--muted))] cursor-pointer group hover:border-[hsl(var(--primary))] transition-all"
              >
                {/* Image */}
                <img
                  src={image.storage_path}
                  alt={`Issue attachment ${image.display_order + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image.storage_path);
                    }}
                    className="h-10 w-10 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white transition-colors"
                    title="View full size"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>

                  <button
                    onClick={(e) => handleDownload(image.storage_path, e)}
                    className="h-10 w-10 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/70 text-white text-xs font-bold flex items-center justify-center">
                  {image.display_order + 1}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Simple Fullscreen Modal - No Dialog Component */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-9999 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Action buttons */}
          <div className="absolute top-6 right-6 flex gap-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedImage, e);
              }}
              className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm text-black flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm text-black flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Image - centered and properly sized */}
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </>
  );
}