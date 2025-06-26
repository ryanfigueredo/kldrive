import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import PerfilClient from "@/components/PerfilClient";
import { redirect } from "next/navigation";
import { type Session } from "next-auth";

export default async function PerfilPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session || !session.user) {
    redirect("/login");
  }

  return <PerfilClient session={session} />;
}
