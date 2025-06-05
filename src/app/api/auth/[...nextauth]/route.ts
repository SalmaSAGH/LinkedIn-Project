import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// @ts-ignore
const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) throw new Error('Utilisateur non trouvé');

                const passwordCorrect = await bcrypt.compare(credentials.password, user.password);
                if (!passwordCorrect) throw new Error('Mot de passe incorrect');

                return { id: user.id, name: user.name, email: user.email };
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
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token) session.user.id = token.id;
            return session;
        },
    },
});

export { handler as GET, handler as POST };
