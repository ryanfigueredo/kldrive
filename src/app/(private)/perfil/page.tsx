"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Perfil() {
  const { data: session, update } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Selecione uma foto!");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro no upload");

      const data = await res.json();

      // Atualiza a sessão para refletir a nova foto
      await update({ ...session?.user, image: data.imageUrl });

      alert("Foto atualizada com sucesso!");
      setFile(null);
    } catch {
      alert("Erro ao enviar a foto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Perfil</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Cargo: {session?.user?.role}</p>

      <div className="my-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Enviando..." : "Enviar Foto"}
        </button>
      </div>

      <button
        onClick={() => signOut()}
        className="mt-6 bg-red-600 py-2 px-4 rounded-lg font-semibold"
      >
        Sair
      </button>
    </main>
  );
}
