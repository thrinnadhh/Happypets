"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus } from "lucide-react";

interface ImageUploaderProps {
  value?: string; // current image URL
  onChange: (base64: string | null) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "Upload Image" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      {preview ? (
        <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 group">
          <img src={preview} alt="Product preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-2
            transition-all duration-200
            ${dragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-gray-300 hover:border-primary hover:bg-gray-50"}
          `}
        >
          <ImagePlus className={`w-8 h-8 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm text-muted-foreground text-center px-3">
            {dragging ? "Drop to upload" : "Drag & drop or click to select"}
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}
