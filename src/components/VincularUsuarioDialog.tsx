"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRoundPlus } from "lucide-react";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  vehicleId?: string;
}

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
}

interface Props {
  onVincular: () => void;
}

export function VincularUsuarioDialog({ onVincular }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [vinculo, setVinculo] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/usuarios")
      .then((res) => res.json())
      .then(setUsuarios);
    fetch("/api/admin/veiculos")
      .then((res) => res.json())
      .then(setVeiculos);
  }, [open]);

  async function salvarVinculo(userId: string) {
    const vehicleId = vinculo[userId];
    if (!vehicleId) return;

    try {
      const res = await fetch("/api/admin/vincular-veiculo", {
        method: "POST",
        body: JSON.stringify({ userId, vehicleId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao vincular veículo.");
        return;
      }

      alert("Veículo vinculado com sucesso!");
      onVincular?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro inesperado.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserRoundPlus className="w-4 h-4 mr-2" />
          Vincular Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular Veículo a Usuário</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {usuarios.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 ${
                  user.role === "ADMIN" ? "bg-gray-900 text-white" : "bg-muted"
                }`}
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
                  <Button
                    variant="secondary"
                    onClick={() => salvarVinculo(user.id)}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
