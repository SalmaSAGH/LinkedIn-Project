// app/api/friendships/cancel/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { receiverId } = await req.json();

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Supprime uniquement les demandes PENDING envoyées par l'utilisateur courant
        await prisma.friendship.deleteMany({
            where: {
                senderId: currentUser.id,
                receiverId,
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}