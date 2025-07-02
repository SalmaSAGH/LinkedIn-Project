// app/api/messages/conversations/route.ts
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

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: session.user.id },
                    { user2Id: session.user.id },
                ],
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                user2: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        senderId: true,
                        read: true,
                    },
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                receiverId: session.user.id,
                                read: false,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        const formattedConversations = conversations.map((conv) => {
            const otherUser = conv.user1Id === session.user.id ? conv.user2 : conv.user1;
            const lastMessage = conv.messages[0];

            return {
                id: conv.id,
                otherUser,
                lastMessage,
                unreadCount: conv._count.messages,
                updatedAt: conv.updatedAt,
            };
        });

        return NextResponse.json({ conversations: formattedConversations });
    } catch (error) {
        console.error("Erreur récupération conversations:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}