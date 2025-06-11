"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface FuelRecord {
  id: string;
  litros: number;
  valor: number;
  kmAtual: number;
  situacaoTanque: string;
  observacao: string | null;
  createdAt: string;
  photoUrl: string;
}

interface KmResumo {
  totalKm: number;
  totalGasto: number;
  abastecimentos: number;
  mediaPorLitro: number;
}

export default function PerfilClient({ session }: { session: Session }) {
  const [resumo, setResumo] = useState<KmResumo | null>(null);
  const [historico, setHistorico] = useState<FuelRecord[]>([]);

  useEffect(() => {
    fetch("/api/usuario/resumo")
      .then((res) => res.json())
      .then((data) => {
        setResumo(data.resumo);
        setHistorico(data.abastecimentos);
      });
  }, []);

  if (!session?.user) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Carregando sessão...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Perfil de {session.user.name ?? "Usuário"}
          </h1>
          <p className="text-gray-600">
            {session.user.email} • {session.user.role}
          </p>
        </div>
      </div>

      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total KM</CardTitle>
            </CardHeader>
            <CardContent>{resumo.totalKm} km</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Valor Abastecido</CardTitle>
            </CardHeader>
            <CardContent>R$ {resumo.totalGasto.toFixed(2)}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>{resumo.abastecimentos}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Média por litro</CardTitle>
            </CardHeader>
            <CardContent>{resumo.mediaPorLitro.toFixed(2)} km/L</CardContent>
          </Card>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 font-semibold border-b">
          Histórico de Abastecimento
        </div>
        <div className="divide-y text-sm">
          {historico.length > 0 ? (
            historico.map((a) => (
              <div key={a.id} className="p-4 flex justify-between">
                <div>
                  <p className="font-semibold">
                    {a.litros}L - R${a.valor.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    KM: {a.kmAtual} • {new Date(a.createdAt).toLocaleString()}
                  </p>
                  {a.observacao && <p className="text-xs">{a.observacao}</p>}
                </div>
                <Image
                  src={a.photoUrl}
                  alt="cupom"
                  width={64}
                  height={64}
                  className="rounded object-cover border"
                />
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-400">
              Nenhum abastecimento encontrado.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
