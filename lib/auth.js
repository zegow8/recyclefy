import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { wilayah: true }
        });

        if (!user || !user.password) {
          throw new Error("Email tidak ditemukan");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nama,
          role: user.role,
          wilayahId: user.wilayahId,
          wilayah: user.wilayah,
          koin: user.koin,
          noHp: user.noHp,
          alamat: user.alamat,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.wilayahId = user.wilayahId;
        token.wilayah = user.wilayah;
        token.koin = user.koin;
        token.id = user.id;
        token.noHp = user.noHp;
        token.alamat = user.alamat;
      }
      return token;
    },
    async session({ session, token }) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: token.id }
        });
        
        if (user) {
          session.user.koin = user.koin;
          session.user.name = user.nama;
          session.user.email = user.email;
          session.user.noHp = user.noHp;
          session.user.alamat = user.alamat;
          session.user.role = user.role;
          session.user.id = user.id;
        }
      } catch (error) {
        session.user.koin = token.koin;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.noHp = token.noHp;
        session.user.alamat = token.alamat;
        session.user.role = token.role;
        session.user.id = token.id;
      }
      
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};