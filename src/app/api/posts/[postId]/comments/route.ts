import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const { postId } = params;

        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Erreur lors de la récupération des commentaires:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { postId } = params;
        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Le contenu du commentaire est requis" }, { status: 400 });
        }

        // Vérifier si le post existe
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
        }

        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Créer le commentaire
        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: user.id,
                postId: postId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Erreur lors de la création du commentaire:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}