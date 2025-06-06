import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

        // Vérifier si l'utilisateur a déjà liké ce post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: postId,
                },
            },
        });

        if (existingLike) {
            // Supprimer le like (unlike)
            await prisma.like.delete({
                where: { id: existingLike.id },
            });

            return NextResponse.json({
                liked: false,
                message: "Like retiré"
            });
        } else {
            // Ajouter le like
            await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: postId,
                },
            });

            return NextResponse.json({
                liked: true,
                message: "Post liké"
            });
        }
    } catch (error) {
        console.error("Erreur lors de la gestion du like:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}