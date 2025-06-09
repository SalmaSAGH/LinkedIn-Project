"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X, UserPlus, UserCheck, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
    };
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

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
                // Mettre à jour localement la notification
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
                // Rafraîchir les posts si nécessaire
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


    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <button
                    onClick={fetchNotifications}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Actualiser
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-3">
                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                        Aucune notification
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Vous navez aucune notification pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg ${notification.read ? "bg-white" : "bg-blue-50"} border border-gray-200`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {notification.content}
                                    </p>
                                    <p className="text-xs text-gray-500">
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
                                                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAction(notification.id, "REJECT");
                                                }}
                                                disabled={updating === notification.id}
                                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                {notification.metadata?.status === "ACCEPTED" && (
                                    <span className="text-green-500">
                    <UserCheck className="h-5 w-5" />
                  </span>
                                )}
                                {notification.metadata?.status === "REJECTED" && (
                                    <span className="text-red-500">
                    <UserX className="h-5 w-5" />
                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}