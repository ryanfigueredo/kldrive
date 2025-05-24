"use client";

import { useEffect, useState } from "react";
import { DateSelector } from "@/components/DateSelector";

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

interface Usuario {
  id: string;
  email: string;
}

interface Veiculo {
  id: string;
  placa: string;
}

export default function AdminDashboard() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [tipo, setTipo] = useState("");
  const [usuario, setUsuario] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    fetch("/api/admin/opcoes-filtros")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data.usuarios);
        setVeiculos(data.veiculos);
      });
  }, []);

  function exportar(formato: "pdf" | "excel") {
    const params = new URLSearchParams();

    if (tipo) params.set("tipo", tipo);
    if (usuario) params.set("usuario", usuario);
    if (veiculo) params.set("veiculo", veiculo);
    if (startDate)
      params.set("startDate", startDate.toISOString().split("T")[0]);
    if (endDate) params.set("endDate", endDate.toISOString().split("T")[0]);

    window.open(
      `/api/admin/exportar?${params.toString()}&formato=${formato}`,
      "_blank"
    );
  }

  useEffect(() => {
    const params = new URLSearchParams();

    if (tipo) params.set("tipo", tipo);
    if (usuario) params.set("usuario", usuario);
    if (veiculo) params.set("veiculo", veiculo);
    if (startDate)
      params.set("startDate", startDate.toISOString().split("T")[0]);
    if (endDate) params.set("endDate", endDate.toISOString().split("T")[0]);

    fetch(`/api/admin/registros?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setRegistros(data ?? []));
  }, [tipo, usuario, veiculo, startDate, endDate]);

  return (
    <main className="min-h-screen px-4 py-6 bg-dark text-white">
      <h1 className="text-xl font-bold mb-6">Painel Administrativo</h1>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DateSelector
          label="Data Inicial"
          date={startDate}
          setDate={setStartDate}
        />
        <DateSelector label="Data Final" date={endDate} setDate={setEndDate} />

        <div className="w-full">
          <span className="text-sm block mb-1">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="bg-dark border border-gray-600 rounded-md p-2 text-white w-full"
          >
            <option value="">Todos os tipos</option>
            <option value="KM">Quilometragem</option>
            <option value="ABASTECIMENTO">Abastecimento</option>
          </select>
        </div>

        <div className="w-full">
          <span className="text-sm block mb-1">Usuário</span>
          <select
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="bg-dark border border-gray-600 rounded-md p-2 text-white w-full"
          >
            <option value="">Todos os usuários</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <span className="text-sm block mb-1">Veículo</span>
          <select
            value={veiculo}
            onChange={(e) => setVeiculo(e.target.value)}
            className="bg-dark border border-gray-600 rounded-md p-2 text-white w-full"
          >
            <option value="">Todos os veículos</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa}
              </option>
            ))}
          </select>
        </div>
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

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => exportar("excel")}
          className="bg-primary text-white px-4 py-2 rounded-md font-semibold"
        >
          Exportar Excel
        </button>
        <button
          onClick={() => exportar("pdf")}
          className="bg-primary text-white px-4 py-2 rounded-md font-semibold"
        >
          Exportar PDF
        </button>
      </div>
    </main>
  );
}
