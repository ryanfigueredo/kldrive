"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditarVinculoDialog } from "./EditarVinculoDialog";

interface UsuarioComVeiculo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  vehicle?: {
    placa: string;
  };
  totalAbastecido: number;
  ativo: boolean;
}

export function ListaUsuariosCadastrados() {
  const [usuarios, setUsuarios] = useState<UsuarioComVeiculo[]>([]);
  const [busca, setBusca] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string | null>(
    null
  );

  useEffect(() => {
    const carregarUsuarios = async () => {
      const res = await fetch("/api/admin/usuarios-com-veiculo");
      const data = await res.json();
      setUsuarios(data);
    };
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirModalEdicao = (usuarioId: string) => {
    setUsuarioSelecionado(usuarioId);
  };

  return (
    <Card className=" dark:bg-card bg-white text-black border-none  dark:text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Usuários Cadastrados
        </CardTitle>
        <Input
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <ScrollArea className="max-h-[400px]">
        <CardContent className="divide-y">
          {usuariosFiltrados.map((u) => (
            <div key={u.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <p className="text-xs">
                  Veículo: {u.vehicle?.placa ?? "Não vinculado"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end">
                <Badge variant={u.ativo ? "default" : "destructive"}>
                  {u.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-white dark:text-black bg-black dark:bg-white"
                  onClick={() => abrirModalEdicao(u.id)}
                >
                  <Pencil className="h-3 w-3 mr-1" /> Editar
                </Button>
                {usuarioSelecionado === u.id && (
                  <EditarVinculoDialog
                    userId={usuarioSelecionado}
                    open={!!usuarioSelecionado}
                    onClose={() => setUsuarioSelecionado(null)}
                    onSaved={() => window.location.reload()}
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
