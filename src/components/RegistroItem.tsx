"use client";

import React, { memo } from "react";
import Image from "next/image";

interface Registro {
  id: string;
  tipo: "KM" | "ABASTECIMENTO";
  placa: string;
  usuario: string;
  valor: number;
  km: number;
  imagem: string;
  data: string;
}

interface RegistroItemProps {
  r: Registro;
  onImageClick?: (src: string) => void;
}

const RegistroItemComponent = ({ r, onImageClick }: RegistroItemProps) => {
  return (
    <div
      className="rounded-xl shadow-md p-4 flex gap-4 items-center"
      key={r.id}
    >
      <div
        className="cursor-pointer"
        onClick={() => r.imagem && onImageClick?.(r.imagem)}
      >
        {r.imagem ? (
          <Image
            width={80}
            height={80}
            src={r.imagem}
            alt={`${r.tipo} - ${r.placa}`}
            className="rounded-lg object-cover w-20 h-20 hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 text-gray-400 text-xs flex items-center justify-center rounded-lg">
            Sem imagem
          </div>
        )}
      </div>

      <div className="text-sm">
        <p>
          <strong>{r.tipo}</strong> – {r.placa}
        </p>
        <p>
          {r.km} km – R${r.valor.toFixed(2)}
        </p>
        <p className="text-gray-400 text-xs">{r.usuario}</p>
        <p className="text-gray-500 text-xs">
          {new Date(r.data).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export const RegistroItem = memo(RegistroItemComponent);
RegistroItem.displayName = "RegistroItem";
