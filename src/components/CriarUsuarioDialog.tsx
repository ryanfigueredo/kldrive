"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";

interface Veiculo {
  id: string;
  placa: string;
  modelo: string | null;
}

export function CriarUsuarioDialog({
  onUserCreated,
}: {
  onUserCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("COLABORADOR");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  useEffect(() => {
    fetch("/api/admin/veiculos")
      .then((res) => res.json())
      .then((data) => setVeiculos(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      body: JSON.stringify({ name, email, role, vehicleId }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setOpen(false);
      setName("");
      setEmail("");
      setRole("COLABORADOR");
      setVehicleId("");
      onUserCreated?.();
      alert("Usuário criado com sucesso!");
    } else {
      const error = await res.json();
      alert(error.error || "Erro ao criar usuário.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar Usuário</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Cargo</Label>
            <Select value={role} onValueChange={(val) => setRole(val as Role)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Veículo</Label>
            <Select
              value={vehicleId}
              onValueChange={(val) => setVehicleId(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} {v.modelo ? `– ${v.modelo}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
