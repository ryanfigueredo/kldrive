"use client";

import { signOut, useSession } from "next-auth/react";

export default function Perfil() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen p-6 bg-dark text-white">
      <h1 className="text-2xl font-bold mb-4">Perfil</h1>
      <p>Email: {session?.user?.email}</p>
      <p>Cargo: {session?.user?.role}</p>

      <button
        onClick={() => signOut()}
        className="mt-6 bg-red-600 py-2 px-4 rounded-lg font-semibold"
      >
        Sair
      </button>
    </main>
  );
}
