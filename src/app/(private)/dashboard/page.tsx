import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { Dashboard } from "@/components/Dashboard";
import { type Session } from "next-auth";

export default async function Page() {
  const session = (await getServerSession(authOptions)) as Session;

  return <Dashboard session={session} />;
}
