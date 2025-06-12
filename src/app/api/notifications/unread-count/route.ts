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

        const count = await prisma.notification.count({
            where: {
                userId: user.id,
                read: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Erreur lors du comptage des notifications:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}