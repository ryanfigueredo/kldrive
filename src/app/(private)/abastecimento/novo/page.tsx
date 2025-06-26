import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import NovoAbastecimentoClient from "@/components/NovoAbastecimentoClient";
import { type Session } from "next-auth";

export default async function AbastecimentoPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session || !session.user) {
    redirect("/login");
  }

  return <NovoAbastecimentoClient session={session as Session} />;
}
