// app/api/friendships/sent-requests/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        const sentRequests = await prisma.friendship.findMany({
            where: {
                senderId: user.id,
                status: "PENDING"
            },
            select: {
                receiverId: true
            }
        });

        return NextResponse.json(sentRequests);
    } catch (error) {
        console.error("Erreur lors de la récupération des demandes:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}