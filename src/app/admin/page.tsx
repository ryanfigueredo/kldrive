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
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    let url = "/api/admin/registros";
    if (tipo) url += `?tipo=${tipo}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setRegistros(data ?? []));
  }, [tipo]);

  return (
    <main className="min-h-screen px-4 py-6 bg-dark text-white">
      <h1 className="text-xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex flex-col gap-4 mb-6">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="bg-dark border border-gray-600 rounded-md p-2 text-white"
        >
          <option value="">Todos os tipos</option>
          <option value="KM">Quilometragem</option>
          <option value="ABASTECIMENTO">Abastecimento</option>
        </select>
      </div>

      <section className="flex flex-col gap-3">
        {registros.length > 0 ? (
          registros.map((r) => (
            <div
              key={r.id}
              className="bg-[#1f1f1f] rounded-xl shadow-md p-4 flex gap-4 items-center"
            >
              <img
                src={r.imagem}
                alt="Registro"
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="text-sm text-white">
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
          ))
        ) : (
          <p className="text-gray-400">Nenhum registro encontrado.</p>
        )}
      </section>
    </main>
  );
}
