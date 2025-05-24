"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      alert("E-mail inválido ou não autorizado.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail corporativo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@klfacilities.com.br"
              required
              className="border border-gray-300 focus:border-green-500 focus:ring-blue-500 focus:ring-1 rounded-md"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Senha</Label>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 focus:border-green-500 focus:ring-blue-500 focus:ring-1 rounded-md"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
