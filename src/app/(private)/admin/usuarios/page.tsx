"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Usuario {
  id: string;
  name: string;
  email: string;
  vehicleId?: string;
}

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [vinculo, setVinculo] = useState<Record<string, string>>({}); // userId -> vehicleId

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data));

    fetch("/api/admin/veiculos")
      .then((res) => res.json())
      .then((data) => setVeiculos(data));
  }, []);

  async function salvarVinculo(userId: string) {
    const vehicleId = vinculo[userId];
    if (!vehicleId) return;

    await fetch("/api/admin/vincular-veiculo", {
      method: "POST",
      body: JSON.stringify({ userId, vehicleId }),
      headers: { "Content-Type": "application/json" },
    });

    alert("Veículo vinculado com sucesso!");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Vincular Veículo a Usuário</h1>
      <div className="space-y-4">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="bg-muted p-4 rounded-none-lg flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div>
              <p className="font-semibold">{user.name ?? "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={vinculo[user.id] ?? user.vehicleId ?? ""}
                onValueChange={(val) =>
                  setVinculo((prev) => ({ ...prev, [user.id]: val }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} – {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => salvarVinculo(user.id)}>Salvar</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
