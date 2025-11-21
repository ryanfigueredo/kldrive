"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
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
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<UsuarioComVeiculo | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    const carregarUsuarios = async () => {
      const res = await fetch("/api/admin/usuarios-com-veiculo");
      const data = await res.json();
      setUsuarios(data);
    };
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(
    (u) => {
      // Remove Joabe e Antonio da lista
      const emailsParaRemover = [
        "joabe.soares@klfacilities.com.br",
        "antonio.carvalho@klfacilities.com.br"
      ];
      if (emailsParaRemover.includes(u.email.toLowerCase())) {
        return false;
      }
      
      // Filtro de busca
      return (
        u.name.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
      );
    }
  );

  const abrirModalEdicao = (usuarioId: string) => {
    setUsuarioSelecionado(usuarioId);
  };

  const confirmarExclusao = (usuario: UsuarioComVeiculo) => {
    setUsuarioParaExcluir(usuario);
  };

  const excluirUsuario = async () => {
    if (!usuarioParaExcluir) return;

    setExcluindo(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuarioParaExcluir.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao excluir usuário");
        return;
      }

      // Remove o usuário da lista local
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaExcluir.id));
      setUsuarioParaExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário");
    } finally {
      setExcluindo(false);
    }
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
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={() => confirmarExclusao(u)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
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

      <Dialog open={!!usuarioParaExcluir} onOpenChange={(open) => !open && setUsuarioParaExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{usuarioParaExcluir?.name}</strong>? Esta ação não pode
              ser desfeita e todos os registros relacionados serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUsuarioParaExcluir(null)}
              disabled={excluindo}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={excluirUsuario}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
