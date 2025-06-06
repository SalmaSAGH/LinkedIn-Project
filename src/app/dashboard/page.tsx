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
} from "lucide-react";

import Navbar from "@/components/Navbar";

type Comment = {
    id: string;
    content: string;
    createdAt: string;
    user: {
        name?: string | null;
        image?: string | null;
    };
};

type Post = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    user: {
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

type RandomUserApiResponse = {
    results: {
        name: { first: string; last: string };
        picture: { thumbnail: string };
        login: { uuid: string };
    }[];
};

export default function DashboardPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});
    const [newComments, setNewComments] = useState<Record<string, string>>({});
    const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data: Post[]) => {
                setPosts(data);
            })
            .finally(() => setLoadingPosts(false));
    }, []);

    useEffect(() => {
        fetch("https://randomuser.me/api/?results=5&inc=name,picture,login")
            .then((res) => res.json())
            .then((data: RandomUserApiResponse) => {
                const roles = [
                    "Développeur Fullstack",
                    "UX Designer",
                    "Product Manager",
                    "Data Scientist",
                    "Marketing Digital",
                ];
                const users: Suggestion[] = data.results.map((user, index) => ({
                    id: user.login.uuid,
                    name: `${user.name.first} ${user.name.last}`,
                    avatar: user.picture.thumbnail,
                    role: roles[index % roles.length],
                }));
                setSuggestions(users);
            })
            .finally(() => setLoadingSuggestions(false));
    }, []);

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!newPost.trim()) return;

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newPost }),
        });

        if (res.ok) {
            const newCreatedPost: Post = await res.json();
            setPosts((prev) => [newCreatedPost, ...prev]);
            setNewPost("");
        } else {
            alert("Erreur lors de la création du post");
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
            // Charger les commentaires si on les affiche pour la première fois
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

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
                <section className="lg:col-span-3 space-y-6">
                    {/* Création de post */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="text-blue-600" />
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Partagez une publication..."
                                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    <ImageIcon className="h-5 w-5 mr-2" />
                                    Photo
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newPost.trim()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Publier
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Liste des posts */}
                    {loadingPosts ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="text-gray-500" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="font-semibold text-lg">{post.title}</h2>
                                                    <p className="text-sm text-gray-500">
                                                        {post.user?.name || "Utilisateur"} •{" "}
                                                        {formatPostDate(post.createdAt)}
                                                    </p>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                            <p className="mt-3 text-gray-800">{post.body}</p>
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
                                            <MessageSquare className="h-5 w-5 mr-1" />
                                            {post.commentsCount} Commentaire{post.commentsCount !== 1 ? "s" : ""}
                                        </button>
                                        <button className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1 rounded">
                                            <Share2 className="h-5 w-5 mr-1" />
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
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <User className="text-blue-600 w-4 h-4" />
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
                                                    <Send className="w-4 h-4" />
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
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatPostDate(comment.createdAt)}
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
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between"
                                    >
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
                                        <button className="text-blue-600 text-sm font-medium hover:underline">
                                            Suivre
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