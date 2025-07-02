// app/api/messages/mark-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const { conversationId } = await request.json();

        if (!conversationId) {
            return NextResponse.json(
                { error: "ID de conversation requis" },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { user1Id: session.user.id },
                    { user2Id: session.user.id },
                ],
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation non trouvée" },
                { status: 404 }
            );
        }

        // Marquer tous les messages reçus dans cette conversation comme lus
        await prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: session.user.id,
                read: false,
            },
            data: { read: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur marquage messages lus:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}