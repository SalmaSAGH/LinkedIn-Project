import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Récupérer l'utilisateur connecté si une session existe
        let currentUser = null;
        if (session?.user?.email) {
            currentUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
        }

        // Récupérer les posts de base
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
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

        // Pour chaque post, récupérer les informations de likes et commentaires
        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const [likesCount, commentsCount, userLike, comments] = await Promise.all([
                    prisma.like.count({ where: { postId: post.id } }),
                    prisma.comment.count({ where: { postId: post.id } }),
                    currentUser
                        ? prisma.like.findFirst({
                            where: { postId: post.id, userId: currentUser.id }
                        })
                        : null,
                    prisma.comment.findMany({
                        where: { postId: post.id },
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
                        take: 3,
                    })
                ]);

                return {
                    ...post,
                    likesCount,
                    commentsCount,
                    isLikedByCurrentUser: !!userLike,
                    comments,
                    canEdit: currentUser?.id === post.userId, // Nouveau champ
                };
            })
        );

        return NextResponse.json(postsWithCounts);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérifiez la taille du corps de la requête
        const contentLength = Number(req.headers.get('content-length') || 0);
        if (contentLength > 4 * 1024 * 1024) { // 4MB max
            return NextResponse.json(
                { error: "La taille de l'image ne doit pas dépasser 4MB" },
                { status: 413 }
            );
        }

        const formData = await req.formData();
        const content = formData.get('content') as string;
        const imageFile = formData.get('image') as File | null;

        if (!content?.trim() && !imageFile) {
            return NextResponse.json(
                { error: "Le contenu ou une image est requis" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Traitement de l'image
        let imageUrl = null;
        if (imageFile) {
            // Vérifiez la taille du fichier
            if (imageFile.size > 4 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "La taille de l'image ne doit pas dépasser 4MB" },
                    { status: 413 }
                );
            }

            // Convertir en base64
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString('base64');
            const dataUri = `data:${imageFile.type};base64,${base64Image}`;

            try {
                const result = await cloudinary.uploader.upload(dataUri, {
                    folder: "linkedin-clone/posts",
                    resource_type: "auto",
                    quality: "auto:good", // Optimisation qualité/taille
                });
                imageUrl = result.secure_url;
            } catch (error) {
                console.error("Erreur Cloudinary:", error);
                return NextResponse.json(
                    { error: "Échec de l'upload de l'image" },
                    { status: 500 }
                );
            }
        }

        // Création du post
        const post = await prisma.post.create({
            data: {
                title: user.name ?? "Utilisateur",
                body: content,
                userId: user.id,
                imageUrl,
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
            ...post,
            isLikedByCurrentUser: false,
            likesCount: 0,
            commentsCount: 0,
            comments: [],
            canEdit: true,
        });

    } catch (error) {
        console.error("Erreur lors de la création du post:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { postId, content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Le contenu est requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est le propriétaire du post
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
        }

        if (existingPost.userId !== user.id) {
            return NextResponse.json({ error: "Non autorisé à modifier ce post" }, { status: 403 });
        }

        // Mise à jour du post (updatedAt sera géré automatiquement par Prisma)
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                body: content,
                // Ne pas inclure updatedAt ici - Prisma le gère automatiquement
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

        // Récupérer les informations supplémentaires comme dans GET
        const [likesCount, commentsCount, userLike, comments] = await Promise.all([
            prisma.like.count({ where: { postId: updatedPost.id } }),
            prisma.comment.count({ where: { postId: updatedPost.id } }),
            prisma.like.findFirst({
                where: { postId: updatedPost.id, userId: user.id }
            }),
            prisma.comment.findMany({
                where: { postId: updatedPost.id },
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
                take: 3,
            })
        ]);

        return NextResponse.json({
            ...updatedPost,
            likesCount,
            commentsCount,
            isLikedByCurrentUser: !!userLike,
            comments,
            canEdit: true,
        });

    } catch (error) {
        console.error("Erreur lors de la modification du post:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { postId } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est le propriétaire du post
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
        }

        if (existingPost.userId !== user.id) {
            return NextResponse.json({ error: "Non autorisé à supprimer ce post" }, { status: 403 });
        }

        // Supprimer les likes et commentaires associés puis le post
        await prisma.$transaction([
            prisma.like.deleteMany({ where: { postId } }),
            prisma.comment.deleteMany({ where: { postId } }),
            prisma.post.delete({ where: { id: postId } }),
        ]);

        return NextResponse.json({ message: "Post supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du post:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}