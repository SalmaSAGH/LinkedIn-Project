// hooks/useMessageNotifications.ts
import { useState, useEffect, useCallback } from 'react';

type Message = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    read: boolean;
};

export function useMessageNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [newMessages, setNewMessages] = useState<Message[]>([]);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch('/api/messages/unread-count');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Erreur récupération messages non lus:', error);
        }
    }, []);

    // Polling pour vérifier les nouveaux messages
    useEffect(() => {
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 10000); // Vérifier toutes les 10 secondes

        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const markAsRead = useCallback(() => {
        setUnreadCount(0);
        setNewMessages([]);
    }, []);

    const addNewMessage = useCallback((message: Message) => {
        setNewMessages(prev => [...prev, message]);
        setUnreadCount(prev => prev + 1);
    }, []);

    return {
        unreadCount,
        newMessages,
        markAsRead,
        addNewMessage,
        fetchUnreadCount
    };
}