"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "compressing" | "compressed" | "error";
  compressedFile?: File;
}

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
}

export default function ImageUploader({
  onImagesChange,
  maxImages = 3,
  maxSizeMB = 3,
  className,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [editorPasteEnabled, setEditorPasteEnabled] = useState(true);

  // Handle paste events (Ctrl+V) - including from TipTap editor
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if pasting in TipTap editor
      const isInEditor = target.closest('.ProseMirror') !== null || 
                         target.classList.contains('ProseMirror') ||
                         target.getAttribute('contenteditable') === 'true';
      
      // Allow paste in other text inputs
      if (!isInEditor && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault(); // Prevent image from going into editor
        await handleFiles(imageFiles);
        toast.success(isInEditor ? "Image captured from editor" : `Pasted ${imageFiles.length} image(s)`);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [images]);

  // Compress image
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      // Check if compressed file is under 1MB
      if (compressedFile.size > 1024 * 1024) {
        // Try more aggressive compression
        options.maxSizeMB = 0.8;
        options.initialQuality = 0.7;
        const moreCompressed = await imageCompression(file, options);
        
        if (moreCompressed.size > 1024 * 1024) {
          throw new Error("Could not compress image below 1MB");
        }
        return moreCompressed;
      }
      
      return compressedFile;
    } catch (error) {
      throw error;
    }
  };

  // Handle file selection
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check total count
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate and process files
    const validFiles: ImageFile[] = [];
    
    for (const file of fileArray) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      // Check file size (before compression)
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${maxSizeMB}MB`);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      const imageFile: ImageFile = {
        id: Math.random().toString(36).substring(7),
        file,
        preview,
        status: "idle",
      };
      
      validFiles.push(imageFile);
    }

    if (validFiles.length === 0) return;

    // Add to state
    setImages(prev => [...prev, ...validFiles]);

    // Compress each image
    for (const imageFile of validFiles) {
      await compressAndUpdate(imageFile);
    }
  };

  // Compress and update individual image
  const compressAndUpdate = async (imageFile: ImageFile) => {
    // Update status to compressing
    setImages(prev =>
      prev.map(img =>
        img.id === imageFile.id ? { ...img, status: "compressing" } : img
      )
    );

    try {
      const compressedFile = await compressImage(imageFile.file);
      
      // Update with compressed file
      setImages(prev => {
        const updated = prev.map(img =>
          img.id === imageFile.id
            ? { ...img, status: "compressed" as const, compressedFile }
            : img
        );
        
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          const allCompressed = updated
            .filter(img => img.status === "compressed" && img.compressedFile)
            .map(img => img.compressedFile!);
          onImagesChange(allCompressed);
        }, 0);
        
        return updated;
      });

      const originalSizeKB = (imageFile.file.size / 1024).toFixed(0);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);
      toast.success(
        `Compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`
      );
    } catch (error) {
      console.error("Compression failed:", error);
      
      // Update status to error
      setImages(prev =>
        prev.map(img =>
          img.id === imageFile.id ? { ...img, status: "error" } : img
        )
      );

      toast.error(
        `Could not compress ${imageFile.file.name} below 1MB. Try cropping or reducing quality.`
      );
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      
      // Clean up preview URL
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        const allCompressed = updated
          .filter(img => img.status === "compressed" && img.compressedFile)
          .map(img => img.compressedFile!);
        onImagesChange(allCompressed);
      }, 0);
      
      return updated;
    });
  };

  // Drag and drop handlers for individual slots
  const createSlotHandlers = (slotIndex: number) => {
    return {
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add("border-[hsl(var(--primary))]", "bg-[hsl(var(--primary))]/10");
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-[hsl(var(--primary))]", "bg-[hsl(var(--primary))]/10");
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDrop: async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-[hsl(var(--primary))]", "bg-[hsl(var(--primary))]/10");
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          await handleFiles(files);
        }
      },
    };
  };

  const openFileDialog = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  // Progressive slot revealing: only show slots up to current images + 1
  const visibleSlots = Math.min(images.length + 1, maxImages);
  const slots = Array.from({ length: visibleSlots }, (_, i) => images[i] || null);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Image Grid - Smaller size */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((image, index) => (
          <div key={index} className="w-full">
            {/* Hidden file input for each slot */}
            <input
              ref={el => {fileInputRefs.current[index] = el}}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {image ? (
              // Filled slot with image - smaller aspect ratio
              <div className="relative aspect-4/3 rounded-lg border-2 border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--muted))]">
                {/* Image Preview */}
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Status Overlay */}
                {image.status === "compressing" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1" />
                      <p className="text-[10px] font-medium">Compressing...</p>
                    </div>
                  </div>
                )}

                {image.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <p className="text-[10px] font-medium text-white px-2 text-center">
                      Failed
                    </p>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg z-10"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Size Badge */}
                {image.status === "compressed" && image.compressedFile && (
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {(image.compressedFile.size / 1024).toFixed(0)}KB
                  </div>
                )}

                {/* Order Badge */}
                <div className="absolute top-1 left-1 h-5 w-5 rounded-full bg-black/70 text-white text-[10px] font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ) : (
              // Empty slot - acts as upload zone - smaller
              <div
                onClick={() => openFileDialog(index)}
                {...createSlotHandlers(index)}
                className="aspect-[4/3] rounded-lg border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]/30 transition-all group"
              >
                <Upload className="h-6 w-6 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors mb-1" />
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">
                  Click or Drop
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper text - updates dynamically */}
      <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
        {images.length === 0 ? (
          <>PNG, JPG up to {maxSizeMB}MB • Paste (Ctrl+V) even in editor</>
        ) : images.length < maxImages ? (
          <>{images.length}/{maxImages} • Add {maxImages - images.length} more or paste (Ctrl+V)</>
        ) : (
          <>✓ All {maxImages} images added</>
        )}
      </p>
    </div>
  );
}