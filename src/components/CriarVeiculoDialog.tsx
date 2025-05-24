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
        <Button variant="outline">Criar Veículo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Placa</Label>
            <Input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </div>
          <div>
            <Label>Ano</Label>
            <Input
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              type="number"
              placeholder="2024"
            />
          </div>
          <div>
            <Label>Combustível</Label>
            <Select
              value={combustivel}
              onValueChange={(v) => setCombustivel(v as TipoCombustivel)}
            >
              <SelectTrigger>
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
