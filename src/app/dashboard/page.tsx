"use client";

import { useEffect, useState } from "react";
import {
    User,
    MoreHorizontal,
    ThumbsUp,
    MessageSquare,
    Share2,
    Image as ImageIcon,
    Send,
    Edit3,
    Trash2,
    X,
    Check,
    ZoomIn,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
    imageUrl?: string; // Ajout du champ imageUrl
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

type Suggestion = {
    id: string;
    name: string;
    avatar: string;
    role: string;
};



function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative max-w-4xl max-h-[90vh]">
                <Image
                    src={src}
                    alt="Image agrandie"
                    width={1200}
                    height={900}
                    className="object-contain max-w-full max-h-[90vh]"
                />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                    <X className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});
    const [newComments, setNewComments] = useState<Record<string, string>>({});
    const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

    // États pour l'édition
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editPostContent, setEditPostContent] = useState("");
    const [editCommentContent, setEditCommentContent] = useState("");
    const [showPostMenu, setShowPostMenu] = useState<Record<string, boolean>>({});
    const [showCommentMenu, setShowCommentMenu] = useState<Record<string, boolean>>({});


    useEffect(() => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data: Post[]) => {
                setPosts(data);
            })
            .finally(() => setLoadingPosts(false));
    }, []);

    useEffect(() => {
        // Récupérer les suggestions depuis votre API
        fetch("/api/users/suggestions")
            .then((res) => res.json())
            .then((data: Suggestion[]) => {
                setSuggestions(data);
            })
            .finally(() => setLoadingSuggestions(false));
    }, []);

    useEffect(() => {
        const fetchSentRequests = async () => {
            try {
                const res = await fetch("/api/friendships/sent-requests");
                if (res.ok) {
                    const data = await res.json();
                    const requestsMap = data.reduce((acc: Record<string, boolean>, request: any) => {
                        acc[request.receiverId] = true;
                        return acc;
                    }, {});
                    setSentRequests(requestsMap);
                }
            } catch (error) {
                console.error("Error fetching sent requests:", error);
            }
        };

        fetchSentRequests();
    }, []);

    const followUser = async (userId: string) => {
        try {
            const res = await fetch("/api/friendships", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId }),
            });

            if (res.ok) {
                // Mettre à jour l'état local
                setSentRequests(prev => ({ ...prev, [userId]: true }));
                alert("Demande de connexion envoyée");
            } else {
                alert("Erreur lors de l'envoi de la demande");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de l'envoi de la demande");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!newPost.trim() && !imageFile) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('content', newPost);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch("/api/posts", {
                method: "POST",
                body: formData,
                // Ne pas définir Content-Type, le navigateur le fera automatiquement
            });

            if (res.ok) {
                const newCreatedPost: Post = await res.json();
                setPosts((prev) => [newCreatedPost, ...prev]);
                setNewPost("");
                setImagePreview(null);
                setImageFile(null);
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Erreur lors de la création du post");
            }
        } catch (error) {
            console.error("Erreur lors de la création du post:", error);
            alert("Erreur lors de la création du post");
        } finally {
            setIsUploading(false);
        }
    }


    function formatPostDate(date: string | Date): string {
        const now = new Date();
        const postDate = new Date(date);
        const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

        if (diff < 60) return "il y a quelques secondes";
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;

        return postDate.toLocaleDateString();
    }

    async function handleLikePost(postId: string) {
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: "POST",
            });

            if (res.ok) {
                const { liked } = await res.json();
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                isLikedByCurrentUser: liked,
                                likesCount: liked
                                    ? post.likesCount + 1
                                    : post.likesCount - 1
                            }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error("Erreur lors du like:", error);
        }
    }

    async function toggleComments(postId: string) {
        const isCurrentlyShown = showComments[postId];

        if (!isCurrentlyShown) {
            try {
                const res = await fetch(`/api/posts/${postId}/comments`);
                if (res.ok) {
                    const comments = await res.json();
                    setPosts(prevPosts =>
                        prevPosts.map(post =>
                            post.id === postId
                                ? { ...post, comments }
                                : post
                        )
                    );
                }
            } catch (error) {
                console.error("Erreur lors du chargement des commentaires:", error);
            }
        }

        setShowComments(prev => ({
            ...prev,
            [postId]: !isCurrentlyShown
        }));
    }

    async function handleSubmitComment(postId: string, e: React.FormEvent) {
        e.preventDefault();
        const content = newComments[postId]?.trim();
        if (!content) return;

        setSubmittingComment(prev => ({ ...prev, [postId]: true }));

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (res.ok) {
                const newComment = await res.json();

                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                comments: [newComment, ...post.comments],
                                commentsCount: post.commentsCount + 1
                            }
                            : post
                    )
                );

                setNewComments(prev => ({ ...prev, [postId]: "" }));
            } else {
                alert("Erreur lors de l'ajout du commentaire");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
        } finally {
            setSubmittingComment(prev => ({ ...prev, [postId]: false }));
        }
    }

    // Fonctions d'édition et suppression des posts
    function startEditingPost(postId: string, currentContent: string) {
        setEditingPost(postId);
        setEditPostContent(currentContent);
        setShowPostMenu(prev => ({ ...prev, [postId]: false }));
    }

    function cancelEditingPost() {
        setEditingPost(null);
        setEditPostContent("");
    }

    async function savePostEdit(postId: string) {
        if (!editPostContent.trim()) return;

        try {
            const res = await fetch("/api/posts", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, content: editPostContent }),
            });

            if (res.ok) {
                const updatedPost = await res.json();
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? { ...post, body: updatedPost.body, updatedAt: updatedPost.updatedAt }
                            : post
                    )
                );
                setEditingPost(null);
                setEditPostContent("");
            } else {
                alert("Erreur lors de la modification du post");
            }
        } catch (error) {
            console.error("Erreur lors de la modification du post:", error);
        }
    }

    async function deletePost(postId: string) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;

        try {
            const res = await fetch("/api/posts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId }),
            });

            if (res.ok) {
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            } else {
                alert("Erreur lors de la suppression du post");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du post:", error);
        }
    }

    // Fonctions d'édition et suppression des commentaires
    function startEditingComment(commentId: string, currentContent: string) {
        setEditingComment(commentId);
        setEditCommentContent(currentContent);
        setShowCommentMenu(prev => ({ ...prev, [commentId]: false }));
    }

    function cancelEditingComment() {
        setEditingComment(null);
        setEditCommentContent("");
    }

    async function saveCommentEdit(postId: string, commentId: string) {
        if (!editCommentContent.trim()) return;

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId, content: editCommentContent }),
            });

            if (res.ok) {
                const updatedComment = await res.json();
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                comments: post.comments.map(comment =>
                                    comment.id === commentId
                                        ? { ...comment, content: updatedComment.content, updatedAt: updatedComment.updatedAt }
                                        : comment
                                )
                            }
                            : post
                    )
                );
                setEditingComment(null);
                setEditCommentContent("");
            } else {
                alert("Erreur lors de la modification du commentaire");
            }
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
        }
    }

    async function deleteComment(postId: string, commentId: string) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId }),
            });

            if (res.ok) {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                comments: post.comments.filter(comment => comment.id !== commentId),
                                commentsCount: post.commentsCount - 1
                            }
                            : post
                    )
                );
            } else {
                alert("Erreur lors de la suppression du commentaire");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du commentaire:", error);
        }
    }

    const handleImageClick = (imageUrl: string | undefined) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setSelectedImage(imageUrl);
    };



    return (
        <div className="min-h-screen bg-gray-100">
            {selectedImage && (
                <ImageModal
                    src={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            <Navbar/>
            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                <section className="lg:col-span-3 space-y-6">
                    {/* Création de post */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="text-blue-600"/>
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Partagez une publication..."
                                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                />
                            </div>

                            {/* Aperçu de l'image */}
                            {imagePreview && (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="rounded-lg max-h-80 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageFile(null);
                                        }}
                                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                                    >
                                        <X className="h-4 w-4"/>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <label
                                        className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <ImageIcon className="h-5 w-5 mr-2"/>
                                        Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!newPost.trim() && !imageFile) || isUploading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {isUploading ? "Publication..." : "Publier"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Liste des posts */}
                    {loadingPosts ? (
                        <div className="flex justify-center py-8">
                            <div
                                className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-white rounded-lg shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        {post.user?.image ? (
                                            <img
                                                src={post.user.image}
                                                alt={post.user.name || "Utilisateur"}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="text-gray-500"/>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="font-semibold text-lg">{post.title}</h2>
                                                    <p className="text-sm text-gray-500">
                                                        <button
                                                            onClick={() => post.user?.id && router.push(`/profile/${post.user.id}`)}
                                                            className="hover:underline hover:text-blue-600"
                                                        >
                                                            {post.user?.name || "Utilisateur"}
                                                        </button>
                                                        •{" "}
                                                        {formatPostDate(post.createdAt)}
                                                        {post.updatedAt && post.updatedAt !== post.createdAt && (
                                                            <span
                                                                className="text-xs text-gray-400 ml-1">(modifié)</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600"
                                                        onClick={() => setShowPostMenu(prev => ({
                                                            ...prev,
                                                            [post.id]: !prev[post.id]
                                                        }))}
                                                    >
                                                        <MoreHorizontal size={20}/>
                                                    </button>
                                                    {showPostMenu[post.id] && post.canEdit && (
                                                        <div
                                                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                            <button
                                                                onClick={() => startEditingPost(post.id, post.body)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <Edit3 className="w-4 h-4 mr-2"/>
                                                                Modifier
                                                            </button>
                                                            <button
                                                                onClick={() => deletePost(post.id)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2"/>
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {editingPost === post.id ? (
                                                <div className="mt-3">
                                                    <textarea
                                                        value={editPostContent}
                                                        onChange={(e) => setEditPostContent(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end space-x-2 mt-2">
                                                        <button
                                                            onClick={cancelEditingPost}
                                                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                                        >
                                                            <X className="w-4 h-4"/>
                                                        </button>
                                                        <button
                                                            onClick={() => savePostEdit(post.id)}
                                                            className="px-3 py-1 text-green-600 hover:text-green-800"
                                                        >
                                                            <Check className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="mt-3 text-gray-800">{post.body}</p>
                                                    {post.imageUrl && (
                                                        <div
                                                            className="mt-3 cursor-pointer relative group"
                                                            onClick={() => handleImageClick(post.imageUrl)}
                                                        >
                                                            <Image
                                                                src={post.imageUrl}
                                                                alt="Post content"
                                                                width={800}
                                                                height={600}
                                                                className="rounded-lg max-h-96 w-full object-contain"
                                                                quality={80}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="bg-black/50 rounded-full p-2">
                                                                    <ZoomIn className="h-6 w-6 text-white" />
                                                                </div>
                                                            </div>
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
                                            onClick={() => handleLikePost(post.id)}
                                            className={`flex items-center px-3 py-1 rounded transition ${
                                                post.isLikedByCurrentUser
                                                    ? "text-blue-600 bg-blue-50"
                                                    : "text-gray-500 hover:text-blue-600"
                                            }`}
                                        >
                                            <ThumbsUp
                                                className={`h-5 w-5 mr-1 ${
                                                    post.isLikedByCurrentUser ? "fill-current" : ""
                                                }`}
                                            />
                                            {post.likesCount} {post.likesCount <= 1 ? "Like" : "Likes"}
                                        </button>
                                        <button
                                            onClick={() => toggleComments(post.id)}
                                            className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded"
                                        >
                                            <MessageSquare className="h-5 w-5 mr-1"/>
                                            {post.commentsCount} Commentaire{post.commentsCount !== 1 ? "s" : ""}
                                        </button>
                                        <button
                                            className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded">
                                            <Share2 className="h-5 w-5 mr-1"/>
                                            Partager
                                        </button>
                                    </div>
                                </div>

                                {/* Section commentaires */}
                                {showComments[post.id] && (
                                    <div className="px-6 pb-4 border-t border-gray-100">
                                        {/* Formulaire d'ajout de commentaire */}
                                        <form
                                            onSubmit={(e) => handleSubmitComment(post.id, e)}
                                            className="flex items-start space-x-3 mt-4"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <User className="text-blue-600 w-4 h-4"/>
                                            </div>
                                            <div className="flex-1 flex space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Écrivez un commentaire..."
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={newComments[post.id] || ""}
                                                    onChange={(e) => setNewComments(prev => ({
                                                        ...prev,
                                                        [post.id]: e.target.value
                                                    }))}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newComments[post.id]?.trim() || submittingComment[post.id]}
                                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                >
                                                    <Send className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </form>

                                        {/* Liste des commentaires */}
                                        <div className="mt-4 space-y-3">
                                            {post.comments?.map((comment) => (
                                                <div key={comment.id} className="flex items-start space-x-3">
                                                    {comment.user?.image ? (
                                                        <img
                                                            src={comment.user.image}
                                                            alt={comment.user.name || "Utilisateur"}
                                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                            <User className="text-gray-500 w-4 h-4"/>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        {editingComment === comment.id ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={editCommentContent}
                                                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                                    rows={2}
                                                                />
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={cancelEditingComment}
                                                                        className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                                                    >
                                                                        <X className="w-3 h-3"/>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => saveCommentEdit(post.id, comment.id)}
                                                                        className="px-2 py-1 text-green-600 hover:text-green-800"
                                                                    >
                                                                        <Check className="w-3 h-3"/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="bg-gray-100 rounded-lg px-3 py-2 relative group">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-sm">
                                                                            {comment.user?.name || "Utilisateur"}
                                                                        </p>
                                                                        <p className="text-gray-800 text-sm">{comment.content}</p>
                                                                    </div>
                                                                    {comment.canEdit && (
                                                                        <div
                                                                            className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={() => setShowCommentMenu(prev => ({
                                                                                    ...prev,
                                                                                    [comment.id]: !prev[comment.id]
                                                                                }))}
                                                                                className="text-gray-400 hover:text-gray-600 p-1"
                                                                            >
                                                                                <MoreHorizontal className="w-3 h-3"/>
                                                                            </button>
                                                                            {showCommentMenu[comment.id] && (
                                                                                <div
                                                                                    className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                                                    <button
                                                                                        onClick={() => startEditingComment(comment.id, comment.content)}
                                                                                        className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                                                                    >
                                                                                        <Edit3
                                                                                            className="w-3 h-3 mr-2"/>
                                                                                        Modifier
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => deleteComment(post.id, comment.id)}
                                                                                        className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-gray-100"
                                                                                    >
                                                                                        <Trash2
                                                                                            className="w-3 h-3 mr-2"/>
                                                                                        Supprimer
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1 px-3">
                                                            {formatPostDate(comment.createdAt)}
                                                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                                                <span
                                                                    className="text-xs text-gray-400 ml-1">(modifié)</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </section>

                {/* Suggestions */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Suggestions de connexions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Suggestions de connexions
                        </h3>
                        {loadingSuggestions ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suggestions.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => followUser(user.id)}
                                            disabled={sentRequests[user.id]}
                                            className={`text-sm font-medium px-3 py-1 rounded-md ${
                                                sentRequests[user.id]
                                                    ? "text-gray-500 bg-gray-100 cursor-default"
                                                    : "text-blue-600 hover:underline"
                                            }`}
                                        >
                                            {sentRequests[user.id] ? "Demandé" : "Suivre"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section profil / actualités */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Qui a consulté votre profil
                        </h3>
                        <p className="text-gray-500 text-sm">12 personnes cette semaine</p>
                        <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                            Voir tous
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Actualités</h3>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">
                                Les nouvelles tendances tech en 2023
                            </p>
                            <p className="text-xs text-gray-500">2h • 125 lectures</p>

                            <p className="text-sm font-medium">
                                Comment améliorer votre réseau professionnel
                            </p>
                            <p className="text-xs text-gray-500">5h • 89 lectures</p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}