import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email et mot de passe requis');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) throw new Error('Utilisateur non trouvé');
                if (!user.password) throw new Error('Mot de passe non défini');

                const passwordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!passwordCorrect) throw new Error('Mot de passe incorrect');

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
            },
        }),
    ],
    pages: {
        signIn: '/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };