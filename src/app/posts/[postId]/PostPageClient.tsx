"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageSquare, Share2, Edit3, Trash2, X, Check, MoreHorizontal, User, Send } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";


type PostPageProps = {
    postId: string;
};

type Comment = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    canEdit?: boolean;
    user: {
        id?: string;
        name?: string | null;
        image?: string | null;
    };
};

type Post = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    updatedAt?: string;
    imageUrl?: string;
    canEdit?: boolean;
    user: {
        id?: string;
        name?: string | null;
        image?: string | null;
    };
    likesCount: number;
    commentsCount: number;
    isLikedByCurrentUser: boolean;
    comments: Comment[];
};



export default function PostPageClient({ postId }: PostPageProps) {
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingPost, setEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState("");
    const [showPostMenu, setShowPostMenu] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/posts/${postId}`);
                if (!res.ok) {
                    throw new Error("Post introuvable");
                }
                const data = await res.json();
                setPost(data);
                setEditPostContent(data.body);
            } catch (error) {
                console.error("Failed to fetch post:", error);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);



    const handleLikePost = async () => {
        if (!post) return;

        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: "POST",
            });

            if (res.ok) {
                const { liked } = await res.json();
                setPost(prev => prev ? {
                    ...prev,
                    isLikedByCurrentUser: liked,
                    likesCount: liked ? prev.likesCount + 1 : prev.likesCount - 1
                } : null);
            }
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !post) return;

        setSubmittingComment(true);

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                const newCommentData = await res.json();
                setPost(prev => prev ? {
                    ...prev,
                    comments: [newCommentData, ...prev.comments],
                    commentsCount: prev.commentsCount + 1
                } : null);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDate = (date: string | Date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

        if (diff < 60) return "il y a quelques secondes";
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;

        return postDate.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-2xl mx-auto p-4 pt-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="max-w-2xl mx-auto p-4 pt-6">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <h2 className="text-xl font-semibold">Post introuvable</h2>
                        <p className="mt-2 text-gray-600">Le post que vous cherchez n existe pas ou a été supprimé.</p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                            Retour à l accueil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-2xl mx-auto p-4 pt-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start space-x-4">
                            {post.user?.image ? (
                                <Image
                                    src={post.user.image}
                                    alt={post.user.name || "Utilisateur"}
                                    width={40}
                                    height={40}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="text-gray-500" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-semibold text-lg">{post.title}</h2>
                                        <p className="text-sm text-gray-500">
                                            {post.user?.name || "Utilisateur"} • {formatDate(post.createdAt)}
                                            {post.updatedAt && post.updatedAt !== post.createdAt && (
                                                <span className="text-xs text-gray-400 ml-1">(modifié)</span>
                                            )}
                                        </p>
                                    </div>
                                    {post.canEdit && (
                                        <div className="relative">
                                            <button
                                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                                onClick={() => setShowPostMenu(!showPostMenu)}
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>
                                            {showPostMenu && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPost(true);
                                                            setShowPostMenu(false);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
                                                                await fetch("/api/posts", {
                                                                    method: "DELETE",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ postId: post.id }),
                                                                });
                                                                router.push("/");
                                                            }
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {editingPost ? (
                                    <div className="mt-3">
                                        <textarea
                                            value={editPostContent}
                                            onChange={(e) => setEditPostContent(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <button
                                                onClick={() => setEditingPost(false)}
                                                className="px-3 py-1 text-gray-600 hover:text-gray-800 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const res = await fetch("/api/posts", {
                                                        method: "PUT",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ postId: post.id, content: editPostContent }),
                                                    });
                                                    if (res.ok) {
                                                        const updatedPost = await res.json();
                                                        setPost(updatedPost);
                                                        setEditingPost(false);
                                                    }
                                                }}
                                                className="px-3 py-1 text-green-600 hover:text-green-800 cursor-pointer"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mt-3 text-gray-800">{post.body}</p>
                                        {post.imageUrl && (
                                            <div className="mt-3">
                                                <Image
                                                    src={post.imageUrl}
                                                    alt="Post content"
                                                    width={800}
                                                    height={600}
                                                    className="rounded-lg max-h-96 w-full object-contain"
                                                    quality={80}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 border-t border-gray-100">
                        <div className="flex justify-between">
                            <button
                                onClick={handleLikePost}
                                className={`flex items-center px-3 py-1 rounded transition ${post.isLikedByCurrentUser
                                    ? "text-blue-600 bg-blue-50 cursor-pointer"
                                    : "text-gray-500 hover:text-blue-600 cursor-pointer" 
                                }`}
                            >
                                <ThumbsUp
                                    className={`h-5 w-5 mr-1 ${post.isLikedByCurrentUser ? "fill-current" : ""}`}
                                />
                                {post.likesCount} {post.likesCount <= 1 ? "Like" : "Likes"}
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded cursor-pointer">
                                <MessageSquare className="h-5 w-5 mr-1" />
                                {post.commentsCount} Commentaire{post.commentsCount !== 1 ? "s" : ""}
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded cursor-pointer">
                                <Share2 className="h-5 w-5 mr-1" />
                                Partager
                            </button>
                        </div>
                    </div>

                    <div className="px-6 pb-4 border-t border-gray-100">
                        <form
                            onSubmit={handleSubmitComment}
                            className="flex items-start space-x-3 mt-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="text-blue-600 w-4 h-4" />
                            </div>
                            <div className="flex-1 flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Écrivez un commentaire..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submittingComment}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 space-y-3">
                            {post.comments?.map((comment) => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    {comment.user?.image ? (
                                        <Image
                                            src={comment.user.image}
                                            alt={comment.user.name || "Utilisateur"}
                                            width={40}
                                            height={40}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <User className="text-gray-500 w-4 h-4" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                                            <p className="font-medium text-sm">
                                                {comment.user?.name || "Utilisateur"}
                                            </p>
                                            <p className="text-gray-800 text-sm">{comment.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 px-3">
                                            {formatDate(comment.createdAt)}
                                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                                <span className="text-xs text-gray-400 ml-1">(modifié)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
