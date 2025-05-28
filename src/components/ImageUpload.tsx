// src/components/ImageUpload.tsx
"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  onChange: (file: File) => void;
}

export default function ImageUpload({ onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        hidden
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-200 p-4 w-full rounded-none-xl text-center text-gray-700"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-none-xl"
          />
        ) : (
          "Selecionar Foto do Odômetro"
        )}
      </button>
    </div>
  );
}
