// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

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

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // Marquer les messages reçus comme lus
        await prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: session.user.id,
                read: false,
            },
            data: { read: true },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Erreur récupération messages:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const { content, receiverId } = await request.json();

        if (!content?.trim() || !receiverId) {
            return NextResponse.json(
                { error: "Contenu et destinataire requis" },
                { status: 400 }
            );
        }

        // Créer ou récupérer la conversation
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: session.user.id, user2Id: receiverId },
                    { user1Id: receiverId, user2Id: session.user.id },
                ],
            },
        });

        let conversation;
        if (existingConversation) {
            conversation = existingConversation;
        } else {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: session.user.id,
                    user2Id: receiverId,
                },
            });
        }

        // Créer le message
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                senderId: session.user.id,
                receiverId,
                conversationId: conversation.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Mettre à jour la conversation
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message, conversationId: conversation.id });
    } catch (error) {
        console.error("Erreur envoi message:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}