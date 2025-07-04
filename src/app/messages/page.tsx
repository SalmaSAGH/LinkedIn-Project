"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, MoreVertical, Smile, Paperclip } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Image from "next/image";

type User = {
    id: string;
    name: string;
    image: string | null;
    bio?: string | null;
};

type Message = {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    read: boolean;
    sender: User;
};

type Conversation = {
    id: string;
    otherUser: User;
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
};

export default function MessagesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Détecter si c'est mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Charger les conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    // Auto-scroll des messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages/conversations');
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Erreur chargement conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`/api/messages/search-users?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error('Erreur recherche utilisateurs:', error);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchUsers(query);
        }, 300);
    };

    const startConversation = async (user: User) => {
        setSearchQuery('');
        setSearchResults([]);

        // Vérifier si une conversation existe déjà
        const existingConv = conversations.find(conv => conv.otherUser.id === user.id);
        if (existingConv) {
            setSelectedConversation(existingConv);
            await loadMessages(existingConv.id);
            return;
        }

        // Créer une nouvelle conversation temporaire
        const newConv: Conversation = {
            id: 'temp-' + user.id,
            otherUser: user,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
        };

        setSelectedConversation(newConv);
        setMessages([]);
    };

    const loadMessages = async (conversationId: string) => {
        if (conversationId.startsWith('temp-')) {
            setMessages([]);
            return;
        }

        try {
            const res = await fetch(`/api/messages?conversationId=${conversationId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
                // Mettre à jour le compteur non lu
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === conversationId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
                );
            }
        } catch (error) {
            console.error('Erreur chargement messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    receiverId: selectedConversation.otherUser.id,
                }),
            });

            if (res.ok) {
                const data = await res.json();

                // Ajouter le message à la liste
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');

                // Si c'était une conversation temporaire, mettre à jour avec la vraie ID
                if (selectedConversation.id.startsWith('temp-')) {
                    const updatedConv = {
                        ...selectedConversation,
                        id: data.conversationId,
                        lastMessage: data.message,
                        updatedAt: new Date().toISOString(),
                    };
                    setSelectedConversation(updatedConv);
                    setConversations(prev => [updatedConv, ...prev]);
                } else {
                    // Mettre à jour la conversation existante
                    setConversations(prev =>
                        prev.map(conv =>
                            conv.id === selectedConversation.id
                                ? { ...conv, lastMessage: data.message, updatedAt: new Date().toISOString() }
                                : conv
                        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    );
                }
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (hours < 168) { // 7 jours
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-white border-b border-gray-200">
                    <Navbar />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar horizontale en haut */}
            <div className="bg-white border-b border-gray-200">
                <Navbar />
            </div>

            {/* Contenu principal au même niveau */}
            <div className="flex-1 flex bg-white shadow-lg">
                {/* Sidebar - Liste des conversations */}
                <div className={`${
                    isMobile && selectedConversation ? 'hidden' : 'flex'
                } flex-col w-full md:w-96 xl:w-[400px] border-r border-gray-200 bg-white`}>

                    {/* Header avec recherche */}
                    <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>

                        {/* Barre de recherche améliorée */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Rechercher des personnes..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                            />
                        </div>

                        {/* Résultats de recherche */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-50 mt-2 w-full max-w-sm bg-white shadow-xl rounded-xl border border-gray-200 max-h-80 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => startConversation(user)}
                                        className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <div className="relative">
                                            <Image
                                                src={user.image || '/default-avatar.png'}
                                                alt={user.name}
                                                width={40}
                                                height={40}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="ml-4 text-left flex-1">
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            {user.bio && (
                                                <p className="text-sm text-gray-500 truncate mt-1">{user.bio}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Liste des conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="font-medium text-gray-900 mb-2">Aucune conversation</p>
                                <p className="text-sm">Recherchez quelqu un pour commencer à discuter</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {conversations.map((conversation) => (
                                    <button
                                        key={conversation.id}
                                        onClick={() => {
                                            setSelectedConversation(conversation);
                                            loadMessages(conversation.id);
                                        }}
                                        className={`w-full flex items-center p-4 hover:bg-gray-50 transition-all duration-200 ${
                                            selectedConversation?.id === conversation.id
                                                ? 'bg-blue-50 border-r-4 border-blue-500'
                                                : ''
                                        }`}
                                    >
                                        <div className="relative">
                                            <Image
                                                src={conversation.otherUser.image || '/default-avatar.png'}
                                                alt={conversation.otherUser.name}
                                                width={40}
                                                height={40}
                                                className="w-14 h-14 rounded-full object-cover"
                                            />
                                            {conversation.unreadCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1 text-left">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {conversation.otherUser.name}
                                                </p>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                                                </span>
                                            </div>
                                            {conversation.lastMessage && (
                                                <p className="text-sm text-gray-600 truncate mt-1">
                                                    {conversation.lastMessage.content}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Zone de chat */}
                <div className={`${
                    isMobile && !selectedConversation ? 'hidden' : 'flex'
                } flex-1 flex flex-col bg-white`}>
                    {selectedConversation ? (
                        <>
                            {/* Header du chat */}
                            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center">
                                    {isMobile && (
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div className="relative">
                                        <Image
                                            src={selectedConversation.otherUser.image || '/default-avatar.png'}
                                            alt={selectedConversation.otherUser.name}
                                            width={40}
                                            height={40}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h2 className="font-semibold text-gray-900 text-lg">
                                            {selectedConversation.otherUser.name}
                                        </h2>
                                        <p className="text-sm text-green-600">En ligne</p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <MoreVertical className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            message.senderId === selectedConversation.otherUser.id
                                                ? 'justify-start'
                                                : 'justify-end'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                                message.senderId === selectedConversation.otherUser.id
                                                    ? 'bg-white text-gray-900 border border-gray-200'
                                                    : 'bg-blue-600 text-white'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                            <p className={`text-xs mt-2 ${
                                                message.senderId === selectedConversation.otherUser.id
                                                    ? 'text-gray-500'
                                                    : 'text-blue-100'
                                            }`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input de message */}
                            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                        onClick={() => {/* Logique d'ajout de fichier */}}
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage(e);
                                                }
                                            }}
                                            placeholder="Écrivez un message..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                            onClick={() => {/* Logique d'emoji */}}
                                        >
                                            <Smile className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Sélectionnez une conversation
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Choisissez une conversation existante ou recherchez quelqu un pour commencer à discuter
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}