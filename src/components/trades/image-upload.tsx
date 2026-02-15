"use client";

import { useState, useCallback } from "react";
import { ImagePlus, X, Loader2, ZoomIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 4,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File) => {
      const supabase = createClient();

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please upload an image file",
        });
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Maximum file size is 5MB",
        });
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("trade_log_bucket")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Upload failed", {
          description: uploadError.message,
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("trade_log_bucket")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    []
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const remainingSlots = maxImages - value.length;
      if (files.length > remainingSlots) {
        toast.error(`You can only upload ${remainingSlots} more image(s)`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = files.map(uploadImage);
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);

        if (validUrls.length > 0) {
          onChange([...value, ...validUrls]);
          toast.success(`Uploaded ${validUrls.length} image(s)`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images");
      } finally {
        setUploading(false);
        // Reset input
        e.target.value = "";
      }
    },
    [value, onChange, maxImages, uploadImage]
  );

  const removeImage = useCallback(
    async (urlToRemove: string) => {
      const supabase = createClient();

      // Extract file path from URL
      const urlParts = urlToRemove.split("/trade_log_bucket/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("trade_log_bucket").remove([filePath]);
      }

      onChange(value.filter((url) => url !== urlToRemove));
      toast.success("Image removed");
    },
    [value, onChange]
  );

  return (
    <div className="space-y-2">
      {/* Image grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
            >
              <Image
                src={url}
                alt={`Trade screenshot ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 25vw"
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0">
                    <DialogTitle className="sr-only">
                      Trade screenshot {index + 1}
                    </DialogTitle>
                    <div className="relative aspect-video w-full">
                      <Image
                        src={url}
                        alt={`Trade screenshot ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="90vw"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  onClick={() => removeImage(url)}
                  disabled={disabled}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxImages && (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-4 transition-colors",
            "hover:border-primary hover:bg-accent/50",
            disabled && "cursor-not-allowed opacity-50",
            uploading && "pointer-events-none"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-1 text-xs font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-1 text-xs font-medium">Upload Screenshots</p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG up to 5MB ({value.length}/{maxImages})
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
