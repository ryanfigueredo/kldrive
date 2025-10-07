"use client";

import React, { memo } from "react";
// Image import removed; this item now renders compact text rows only

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

const RegistroItemComponent = ({ r }: RegistroItemProps) => {
  return (
    <div
      className="rounded-xl shadow-md p-4 flex gap-4 items-center"
      key={r.id}
    >
      <div className="text-sm">
        <p>
          <strong>{r.tipo}</strong> – {r.placa}
        </p>
        <p>
          {r.km} km – R${" "}
          {r.valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
