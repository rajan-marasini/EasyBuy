"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  value: (string | File)[];
  onChange: (value: (string | File)[]) => void;
  onRemove: (value: string | File) => void;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange([...value, ...acceptedFiles]);
    },
    [onChange, value],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-200"
          >
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(image)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              src={
                typeof image === "string" ? image : URL.createObjectURL(image)
              }
              alt="Product Image"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={`
                    border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer
                    flex flex-col items-center justify-center gap-2
                    ${
                      isDragActive
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-zinc-200 hover:border-emerald-400 hover:bg-zinc-50"
                    }
                `}
      >
        <input {...getInputProps()} />
        <div className="p-3 rounded-full bg-emerald-100/50 text-emerald-600">
          <ImagePlus className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-900">
            {isDragActive ? "Drop images here" : "Upload Product Images"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Drag and drop or click to select (JPG, PNG, WebP)
          </p>
        </div>
      </div>
    </div>
  );
}
