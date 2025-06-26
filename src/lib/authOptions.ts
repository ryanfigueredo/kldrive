import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

interface VehicleSession {
  id: string;
  placa: string;
  modelo: string | null;
}

interface UserWithVehicle {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
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
      async authorize(credentials): Promise<UserWithVehicle | null> {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { vehicle: true },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl ?? "",
          vehicle: user.vehicle
            ? {
                id: user.vehicle.id,
                placa: user.vehicle.placa,
                modelo: user.vehicle.modelo ?? null,
              }
            : null,
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
        const u = user as UserWithVehicle;
        token.id = u.id;
        token.name = u.name;
        token.email = u.email;
        token.role = u.role;
        token.image = u.image;
        token.vehicle = u.vehicle ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        image: token.image as string,
        vehicle: token.vehicle ?? null,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
