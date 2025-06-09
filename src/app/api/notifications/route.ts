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

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 10 // Limiter à 10 notifications
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { notificationId, action } = await req.json(); // action: "ACCEPT" ou "REJECT" pour les demandes

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Marquer comme lue ou traiter l'action
        if (action) {
            // Gérer l'acceptation/rejet d'une demande d'amitié
            // (voir la route friendships pour l'implémentation complète)
        } else {
            // Juste marquer comme lue
            await prisma.notification.update({
                where: { id: notificationId, userId: user.id },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la notification:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}