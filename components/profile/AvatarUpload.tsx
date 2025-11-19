"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useUploadAvatar, useDeleteAvatar } from "@/lib/hooks/useProfile";
import { logger } from "@/lib/logger";

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentAvatarUrl: string | null;
  initials: string;
}

export default function AvatarUpload({
  open,
  onOpenChange,
  userId,
  currentAvatarUrl,
  initials,
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadAvatar();
  const deleteMutation = useDeleteAvatar();

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2,
      useWebWorker: true,
      fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);

      // Check if compressed file is still over 2MB
      if (compressedFile.size > 2 * 1024 * 1024) {
        throw new Error(
          "Image could not be compressed to under 2MB. Please use a smaller image."
        );
      }

      return compressedFile;
    } catch (error) {
      logger.error("Compression error:", error);
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check if file is under 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3MB");
      return;
    }

    setIsCompressing(true);

    try {
      // Compress the image
      const compressedFile = await compressImage(file);

      setSelectedFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      toast.success(
        `Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to compress image");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
   
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try{
    await uploadMutation.mutateAsync({ userId, file: selectedFile });
    } catch(error) {throw error}
    handleClose();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove your profile picture?")) {
      await deleteMutation.mutateAsync(userId);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Change Profile Picture
          </DialogTitle>
          <DialogDescription>
            Upload an image under 3MB. We'll compress it to under 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-[hsl(var(--primary))]">
              <AvatarImage
                src={preview || currentAvatarUrl || undefined}
                alt="Avatar preview"
              />
              <AvatarFallback className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              "hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]",
              "border-[hsl(var(--border))]"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {isCompressing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Compressing image...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    PNG, JPG up to 3MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {selectedFile && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--accent))]">
              <span className="text-sm font-medium truncate">
                {selectedFile.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {currentAvatarUrl && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}