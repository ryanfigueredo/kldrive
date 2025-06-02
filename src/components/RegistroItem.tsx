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

const RegistroItemComponent = ({ r }: { r: Registro }) => {
  return (
    <div
      className="rounded-xl shadow-md p-4 flex gap-4 items-center"
      key={r.id}
    >
      <Image
        width={80}
        height={80}
        src={r.imagem}
        alt="Registro"
        className="rounded-lg object-cover"
      />
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
