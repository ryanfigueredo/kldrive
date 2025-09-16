import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import NovoRotaClient from "@/components/NovoRotaClient";
import { type Session } from "next-auth";

export default async function NovaRotaPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session || !session.user) {
    redirect("/login");
  }

  return <NovoRotaClient session={session as Session} />;
}
