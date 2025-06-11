import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

interface VehicleSession {
  id: string;
  placa: string;
  modelo: string | null;
}

interface UserWithVehicleAndAvatar {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  vehicle?: VehicleSession | null;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials): Promise<UserWithVehicleAndAvatar | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            vehicle: true,
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        const vehicle: VehicleSession | null = user.vehicle
          ? {
              id: user.vehicle.id,
              placa: user.vehicle.placa,
              modelo: user.vehicle.modelo ?? null,
            }
          : null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
          vehicle,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.avatarUrl = (user as UserWithVehicleAndAvatar).avatarUrl ?? null;
        token.vehicle = (user as UserWithVehicleAndAvatar).vehicle ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.role = token.role as string;
      session.user.image =
        typeof token.avatarUrl === "string"
          ? token.avatarUrl
          : session.user.image ?? "";
      session.user.vehicle =
        token.vehicle &&
        typeof token.vehicle === "object" &&
        "id" in token.vehicle &&
        "placa" in token.vehicle &&
        "modelo" in token.vehicle
          ? (token.vehicle as VehicleSession)
          : null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
