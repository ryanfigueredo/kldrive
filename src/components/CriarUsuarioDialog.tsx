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
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/admin/veiculos")
      .then((res) => res.json())
      .then((data) => setVeiculos(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, vehicleId }),
      });

      if (res.ok) {
        alert("Usuário criado com sucesso!");
        setOpen(false);
        setName("");
        setEmail("");
        setRole("COLABORADOR");
        setVehicleId("");
        if (onUserCreated) onUserCreated();
      } else {
        let errorMessage = "Erro ao criar usuário.";
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // resposta vazia ou inválida
        }
        alert(errorMessage);
      }
    } catch {
      alert("Erro inesperado ao criar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="">
        <Button>Criar Usuário</Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-zinc-900  text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 dark:border-white">
          <div>
            <Label>Nome</Label>
            <Input
              className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              type="email"
            />
          </div>

          <div>
            <Label>Senha</Label>
            <Input
              className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label>Cargo</Label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val as Role)}
              disabled={loading}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground w-full">
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
              disabled={loading}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground">
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
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
