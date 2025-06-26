"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TipoCombustivel } from "@prisma/client";

export function CriarVeiculoDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [combustivel, setCombustivel] = useState<TipoCombustivel>("FLEX");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/veiculos", {
      method: "POST",
      body: JSON.stringify({
        placa,
        modelo,
        ano: Number(ano),
        tipoCombustivel: combustivel,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("Veículo cadastrado com sucesso!");
      setOpen(false);
      setPlaca("");
      setModelo("");
      setAno("");
      setCombustivel("FLEX");
      onCreated?.();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao criar veículo.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar Veículo</Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-zinc-900  text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <Label>Placa</Label>
            <Input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              required
              className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label>Ano</Label>
            <Input
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              type="number"
              placeholder="2024"
              className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <Label>Combustível</Label>
            <Select
              value={combustivel}
              onValueChange={(v) => setCombustivel(v as TipoCombustivel)}
            >
              <SelectTrigger className="bg-white dark:bg-zinc-800 border border-border dark:border-zinc-700 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground">
                <SelectValue placeholder="Tipo de combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GASOLINA">Gasolina</SelectItem>
                <SelectItem value="ALCOOL">Álcool</SelectItem>
                <SelectItem value="DIESEL">Diesel</SelectItem>
                <SelectItem value="FLEX">Flex</SelectItem>
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
