import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = params.id;

        // Compter les posts de l'utilisateur
        const postCount = await prisma.post.count({
            where: { userId }
        });

        // Compter les connexions (amis) de l'utilisateur
        const connectionsCount = await prisma.friendship.count({
            where: {
                OR: [
                    { senderId: userId, status: "ACCEPTED" },
                    { receiverId: userId, status: "ACCEPTED" }
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