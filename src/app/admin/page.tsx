"use client";

import { useEffect, useState } from "react";

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

export default function AdminDashboard() {
  const [registros, setRegistros] = useState<Registro[]>([]);

  useEffect(() => {
    fetch("/api/admin/registros")
      .then((res) => res.json())
      .then((data) => setRegistros(data ?? []));
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 bg-dark">
      <h1 className="text-xl font-bold mb-4">Painel Administrativo</h1>

      <section className="flex flex-col gap-3">
        {registros.length > 0 ? (
          registros.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl shadow-md p-4 flex gap-4 items-center"
            >
              <img
                src={r.imagem}
                alt="Registro"
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="text-sm">
                <p>
                  <strong>{r.tipo}</strong> – {r.placa}
                </p>
                <p>
                  {r.km} km – R${r.valor.toFixed(2)}
                </p>
                <p>{r.usuario}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.data).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nenhum registro encontrado.</p>
        )}
      </section>
    </main>
  );
}
