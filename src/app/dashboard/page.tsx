"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface KmRecord {
  id: string;
  km: number;
  photoUrl: string;
  observacao: string | null;
  createdAt: string;
}

interface FuelRecord {
  id: string;
  litros: number;
  valor: number;
  situacaoTanque: string;
  kmAtual: number;
  photoUrl: string;
  observacao: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [kmRecords, setKmRecords] = useState<KmRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  useEffect(() => {
    fetch("/api/historico")
      .then((res) => res.json())
      .then((data) => {
        setKmRecords(data.kmRecords ?? []);
        setFuelRecords(data.fuelRecords ?? []);
      })
      .catch(() => {
        setKmRecords([]);
        setFuelRecords([]);
      });
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 bg-dark">
      <h1 className="text-xl font-bold mb-4">Bem-vindo à KL Drive</h1>

      <div className="flex flex-col gap-4 mb-8">
        <Link href="/quilometragem/novo">
          <div className="bg-primary text-white py-3 rounded-xl text-center">
            Registrar Quilometragem
          </div>
        </Link>

        <Link href="/abastecimento/novo">
          <div className="bg-primary text-white py-3 rounded-xl text-center">
            Registrar Abastecimento
          </div>
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Últimas Quilometragens</h2>
        <div className="flex flex-col gap-3">
          {Array.isArray(kmRecords) && kmRecords.length > 0 ? (
            kmRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-xl shadow-md flex gap-4 items-center"
              >
                <img
                  src={r.photoUrl}
                  alt="Odômetro"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-800">
                  <p>
                    <strong>{r.km} km</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  {r.observacao && <p className="text-xs">{r.observacao}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma quilometragem registrada ainda.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Últimos Abastecimentos</h2>
        <div className="flex flex-col gap-3">
          {Array.isArray(fuelRecords) && fuelRecords.length > 0 ? (
            fuelRecords.map((r) => (
              <div
                key={r.id}
                className="bg-white p-3 rounded-xl shadow-md flex gap-4 items-center"
              >
                <img
                  src={r.photoUrl}
                  alt="Cupom"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-800">
                  <p>
                    <strong>
                      {r.litros} L – R${r.valor.toFixed(2)}
                    </strong>
                  </p>
                  <p className="text-xs">
                    Tanque: {r.situacaoTanque.replace("_", " ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs">KM: {r.kmAtual}</p>
                  {r.observacao && <p className="text-xs">{r.observacao}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Nenhum abastecimento registrado ainda.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
