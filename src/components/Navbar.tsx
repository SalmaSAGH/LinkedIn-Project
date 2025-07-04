"use client";

import { signOut } from "next-auth/react";
import LogoLinkedIn from "@/components/LogoLinkedIn";
import { Home, MessageCircle, Bell, User, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LogOut } from "lucide-react";
import { debounce } from "lodash";
import Image from "next/image";

type UserSearchResult = {
    id: string;
    name: string;
    image: string | null;
    bio: string | null;
    skills: string[] | null;
};

type PostSearchResult = {
    id: string;
    body: string;
    title: string;
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    imageUrl: string | null;
};

type SearchResults = {
    users?: UserSearchResult[];
    posts?: PostSearchResult[];
};

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
    const [messageUnreadCount, setMessageUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResults>({});
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Gérer le clic en dehors de la zone de recherche
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Effet pour les notifications générales
    useEffect(() => {
        const fetchNotificationUnreadCount = async () => {
            try {
                const res = await fetch("/api/notifications/unread-count");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setNotificationUnreadCount(data.count || 0);
            } catch (error) {
                console.error("Error fetching notification unread count:", error);
                setNotificationUnreadCount(0);
            }
        };

        fetchNotificationUnreadCount();
        const notificationInterval = setInterval(fetchNotificationUnreadCount, 30000);

        return () => {
            clearInterval(notificationInterval);
        };
    }, []);

    // Effet pour les messages non lus
    useEffect(() => {
        const fetchMessageUnreadCount = async () => {
            try {
                const res = await fetch("/api/messages/unread-count");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setMessageUnreadCount(data.count || 0);
            } catch (error) {
                console.error("Error fetching message unread count:", error);
                setMessageUnreadCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessageUnreadCount();
        const messageInterval = setInterval(fetchMessageUnreadCount, 10000); // Plus fréquent pour les messages

        return () => {
            clearInterval(messageInterval);
        };
    }, []);

    // Fonction de recherche avec debounce
    const handleSearch = debounce(async (query: string) => {
        if (!query.trim()) {
            setSearchResults({});
            return;
        }

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults({});
        }
    }, 300);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        handleSearch(query);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowResults(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults({});
        setShowResults(false);
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Partie gauche */}
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="flex items-center">
                            <LogoLinkedIn className="w-8 h-8 text-blue-600" />
                            <span className="ml-2 text-xl font-semibold text-blue-700 hidden md:block">LinkedIn</span>
                        </Link>

                        <div className="relative md:w-64" ref={searchRef}>
                            <form onSubmit={handleSubmit}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher"
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    onFocus={() => setShowResults(true)}
                                    className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                                    </button>
                                )}
                            </form>

                            {/* Résultats de recherche */}
                            {showResults && (
                                (searchResults.users && searchResults.users.length > 0) ||
                                (searchResults.posts && searchResults.posts.length > 0)
                            ) && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-96 overflow-auto">
                                    {searchResults.users && searchResults.users.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Personnes
                                            </div>
                                            {searchResults.users.map((user) => (
                                                <Link
                                                    key={user.id}
                                                    href={`/profile/${user.id}`}
                                                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    <Image
                                                        src={user.image || "/default-avatar.png"}
                                                        alt={user.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-8 h-8 rounded-full mr-3"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        {user.bio && (
                                                            <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </>
                                    )}

                                    {searchResults.posts && searchResults.posts.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Publications
                                            </div>
                                            {searchResults.posts.map((post) => (
                                                <Link
                                                    key={post.id}
                                                    href={`/posts/${post.id}`}
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    <div className="flex items-center mb-1">
                                                        <Image
                                                            src={post.user.image || "/default-avatar.png"}
                                                            alt={post.user.name}
                                                            width={40}
                                                            height={40}
                                                            className="w-6 h-6 rounded-full mr-2"
                                                        />
                                                        <span className="text-sm font-medium">{post.user.name}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 truncate">
                                                        {post.body || post.title}
                                                    </p>
                                                </Link>
                                            ))}
                                        </>
                                    )}

                                    <div className="border-t border-gray-200 px-4 py-2">
                                        <Link
                                            href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            onClick={() => setShowResults(false)}
                                        >
                                            Voir tous les résultats pour &#34;{searchQuery}&#34;
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Partie droite */}
                    <div className="flex items-center space-x-6">
                        <NavIcon
                            icon={<Home size={20}/>}
                            active={pathname === "/dashboard"}
                            href="/dashboard"
                            label="Accueil"
                        />
                        <NavIcon
                            icon={
                                <div className="relative">
                                    <MessageCircle size={20}/>
                                    {!isLoading && messageUnreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {messageUnreadCount > 9 ? "9+" : messageUnreadCount}
                                        </span>
                                    )}
                                </div>
                            }
                            active={pathname === "/messages"}
                            href="/messages"
                            label="Messages"
                        />
                        <NavIcon
                            icon={
                                <div className="relative">
                                    <Bell size={20}/>
                                    {!isLoading && notificationUnreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}
                                        </span>
                                    )}
                                </div>
                            }
                            active={pathname === "/notifications"}
                            href="/notifications"
                            label="Notifications"
                        />
                        <NavIcon
                            icon={<User size={20}/>}
                            active={pathname === "/profile"}
                            href="/profile"
                            label="Profil"
                        />

                        <button
                            onClick={() => signOut({callbackUrl: "/signin"})}
                            className="flex items-center gap-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full border border-red-200 transition-all duration-200 cursor-pointer"
                        >
                            <LogOut size={16}/>
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavIcon({
                     icon,
                     active = false,
                     href = "#",
                     label
                 }: {
    icon: React.ReactNode;
    active?: boolean;
    href?: string;
    label?: string;
}) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center p-2 ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"} hover:bg-gray-100 transition-colors duration-200`}
        >
            {icon}
            {label && <span className="text-xs mt-1">{label}</span>}
        </Link>
    );
}