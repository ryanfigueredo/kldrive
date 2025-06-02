"use client";

import React from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageModal({ src, alt, onClose }: ImageModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()} // para não fechar ao clicar na imagem
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-3xl font-bold"
        aria-label="Fechar"
      >
        &times;
      </button>
    </div>
  );
}
