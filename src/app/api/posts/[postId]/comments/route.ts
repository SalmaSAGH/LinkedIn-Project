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
        const session = await getServerSession(authOptions);

        // Récupérer l'utilisateur connecté si une session existe
        let currentUser = null;
        if (session?.user?.email) {
            currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
        }

        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Ajouter le champ canEdit pour chaque commentaire
        const commentsWithEditPermission = comments.map(comment => ({
            ...comment,
            canEdit: currentUser?.id === comment.userId,
        }));

        return NextResponse.json(commentsWithEditPermission);
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
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json({
            ...comment,
            canEdit: true,
        });
    } catch (error) {
        console.error("Erreur lors de la création du commentaire:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { commentId, content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Le contenu du commentaire est requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est le propriétaire du commentaire
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return NextResponse.json({ error: "Commentaire introuvable" }, { status: 404 });
        }

        if (existingComment.userId !== user.id) {
            return NextResponse.json({ error: "Non autorisé à modifier ce commentaire" }, { status: 403 });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content: content.trim(),
                updatedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json({
            ...updatedComment,
            canEdit: true,
        });
    } catch (error) {
        console.error("Erreur lors de la modification du commentaire:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { commentId } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est le propriétaire du commentaire
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return NextResponse.json({ error: "Commentaire introuvable" }, { status: 404 });
        }

        if (existingComment.userId !== user.id) {
            return NextResponse.json({ error: "Non autorisé à supprimer ce commentaire" }, { status: 403 });
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({ message: "Commentaire supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du commentaire:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}