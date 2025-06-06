import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adapte le chemin à ton projet
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }

        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Utilisateur créé", user });
    } catch (err) {
        console.error("Erreur dans /api/register :", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
