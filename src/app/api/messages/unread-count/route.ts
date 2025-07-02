// app/api/messages/unread-count/route.ts
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

        const unreadCount = await prisma.message.count({
            where: {
                receiverId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({ count: unreadCount });
    } catch (error) {
        console.error("Erreur comptage messages non lus:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}