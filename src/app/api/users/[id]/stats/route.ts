import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // Extraction de l'id depuis l'URL
        const idMatch = request.nextUrl.pathname.match(/\/users\/([^/]+)\/stats/);
        const userId = idMatch?.[1];

        if (!userId) {
            return NextResponse.json({ error: "ID utilisateur manquant" }, { status: 400 });
        }

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

        return NextResponse.json({ postCount, connectionsCount });

    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
