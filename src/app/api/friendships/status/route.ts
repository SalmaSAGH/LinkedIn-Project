// app/api/friendships/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!session?.user?.email || !userId) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: currentUser.id, receiverId: userId },
                    { senderId: userId, receiverId: currentUser.id }
                ]
            },
            select: {
                status: true,
                senderId: true
            }
        });

        return NextResponse.json({
            status: friendship?.status || "none",
            isSender: friendship?.senderId === currentUser.id
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}