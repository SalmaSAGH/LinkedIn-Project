
"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X, UserPlus, UserCheck, UserX, Trash2, RefreshCw, ThumbsUp, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Navbar from "@/components/Navbar";

type Notification = {
    id: string;
    type: string;
    content: string;
    read: boolean;
    createdAt: string;
    metadata?: {
        friendshipId?: string;
        senderId?: string;
        status?: string;
        postId?: string;
        commentId?: string;
        type?: string;
    };
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    function getNotificationIcon(type: string, status?: string) {
        switch (type) {
            case "FRIEND_REQUEST":
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case "FRIEND_REQUEST_RESPONSE":
                return status === "ACCEPTED"
                    ? <UserCheck className="h-5 w-5 text-green-500" />
                    : <UserX className="h-5 w-5 text-red-500" />;
            case "POST_LIKE":
                return <ThumbsUp className="h-5 w-5 text-blue-500" />;
            case "POST_COMMENT":
                return <MessageSquare className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    }

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/notifications");
            const data = await res.json();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (notificationId: string, action: "ACCEPT" | "REJECT") => {
        try {
            setUpdating(notificationId);
            const res = await fetch("/api/friendships", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    friendshipId: notifications.find(n => n.id === notificationId)?.metadata?.friendshipId,
                    action
                }),
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId
                            ? {
                                ...n,
                                content: action === "ACCEPT"
                                    ? "Vous avez accepté la demande de connexion"
                                    : "Vous avez refusé la demande de connexion",
                                metadata: { ...n.metadata, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" }
                            }
                            : n
                    )
                );
                if (action === "ACCEPT") {
                    router.refresh();
                }
            }
        } catch (error) {
            console.error("Failed to process action:", error);
        } finally {
            setUpdating(null);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });
            setNotifications(prev =>
                prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Marquer comme lu si ce n'est pas déjà fait
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // Rediriger en fonction du type de notification
        if (notification.metadata?.postId) {
            router.push(`/posts/${notification.metadata.postId}`);
        } else if (notification.metadata?.senderId) {
            router.push(`/profile/${notification.metadata.senderId}`);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            setDeleting(notificationId);
            const res = await fetch("/api/notifications", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [notificationId] }),
            });

            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
        } finally {
            setDeleting(null);
        }
    };

    const deleteReadNotifications = async () => {
        try {
            const readNotifications = notifications
                .filter(n => n.read)
                .map(n => n.id);

            if (readNotifications.length === 0) return;

            const res = await fetch("/api/notifications", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: readNotifications }),
            });

            if (res.ok) {
                setNotifications(prev => prev.filter(n => !n.read));
            }
        } catch (error) {
            console.error("Failed to delete read notifications:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto p-4 pt-6">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchNotifications}
                                disabled={loading}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                                Actualiser
                            </button>
                            {notifications.some(n => n.read) && (
                                <button
                                    onClick={deleteReadNotifications}
                                    disabled={loading}
                                    className="text-sm text-red-600 hover:text-red-800 hover:underline flex items-center disabled:opacity-50 cursor-pointer"
                                    title="Supprimer les notifications lues"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Nettoyer
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex space-x-3">
                                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Aucune notification
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Vous n avez aucune notification pour le moment.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group p-4 rounded-lg shadow-sm transition-all duration-200 ${notification.read ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"} border border-gray-200 hover:border-gray-300 flex justify-between items-start`}
                            >
                                <div
                                    className="flex items-start space-x-3 flex-1 cursor-pointer"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex-shrink-0 pt-1">
                                        {getNotificationIcon(notification.type, notification.metadata?.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${notification.read ? "text-gray-800" : "text-gray-900"}`}>
                                            {notification.content}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                                locale: fr
                                            })}
                                        </p>
                                    </div>
                                    {notification.type === "FRIEND_REQUEST" &&
                                        !notification.metadata?.status && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(notification.id, "ACCEPT");
                                                    }}
                                                    disabled={updating === notification.id}
                                                    className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors cursor-pointer"
                                                    title="Accepter"
                                                >
                                                    <Check className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(notification.id, "REJECT");
                                                    }}
                                                    disabled={updating === notification.id}
                                                    className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer"
                                                    title="Refuser"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    {notification.metadata?.status === "ACCEPTED" && (
                                        <span className="text-green-500 p-1.5">
                                            <UserCheck className="h-5 w-5" />
                                        </span>
                                    )}
                                    {notification.metadata?.status === "REJECTED" && (
                                        <span className="text-red-500 p-1.5">
                                            <UserX className="h-5 w-5" />
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                    disabled={deleting === notification.id}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity duration-200 disabled:opacity-50 cursor-pointer"
                                    title="Supprimer cette notification"
                                >
                                    {deleting === notification.id ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}