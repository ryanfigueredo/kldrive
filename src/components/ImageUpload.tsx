"use client";

import NextImage from "next/image";
import { useRef, useState } from "react";

interface ImageUploadProps {
  onChange: (file: File) => void;
  maxWidth?: number; // px
  maxHeight?: number; // px
  quality?: number; // 0-1
}

export default function ImageUpload({
  onChange,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.75,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Reduz tamanho e qualidade para economizar memória/upload
      const compressed = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality,
      });
      onChange(compressed);
      // Limpa URL anterior se houver
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      // fallback em caso de falha
      onChange(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  }

  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function compressImage(
    file: File,
    opts: { maxWidth: number; maxHeight: number; quality: number }
  ): Promise<File> {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    let { width, height } = img;
    // Ajusta alvos para imagens muito grandes
    const bigFile = file.size > 8 * 1024 * 1024; // >8MB
    const targetMaxWidth = bigFile
      ? Math.min(opts.maxWidth, 1024)
      : opts.maxWidth;
    const targetMaxHeight = bigFile
      ? Math.min(opts.maxHeight, 1024)
      : opts.maxHeight;
    const targetQuality = bigFile ? Math.min(opts.quality, 0.7) : opts.quality;

    const ratio = Math.min(targetMaxWidth / width, targetMaxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", targetQuality)
    );
    if (!blob) return file;
    return new File(
      [blob],
      file.name.replace(/\.(png|jpg|jpeg|webp)$/i, "") + ".jpg",
      { type: "image/jpeg" }
    );
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Força usar câmera traseira
        onChange={handleFileChange}
        hidden
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-200 p-4 w-full rounded-xl text-center text-gray-700"
      >
        {preview ? (
          <NextImage
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-xl"
            width={320}
            height={240}
          />
        ) : (
          "Tirar Foto do Odômetro"
        )}
      </button>
    </div>
  );
}
