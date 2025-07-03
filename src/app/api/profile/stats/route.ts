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

        // Compter les posts de l'utilisateur
        const postCount = await prisma.post.count({
            where: { userId: user.id }
        });

        // Compter les connexions (amis) de l'utilisateur
        const connectionsCount = await prisma.friendship.count({
            where: {
                OR: [
                    { senderId: user.id, status: "ACCEPTED" },
                    { receiverId: user.id, status: "ACCEPTED" }
                ]
            }
        });

        return NextResponse.json({
            postCount,
            connectionsCount
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}