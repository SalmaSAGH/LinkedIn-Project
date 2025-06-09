// components/Navbar.tsx
"use client";

import { signOut } from "next-auth/react";
import LogoLinkedIn from "@/components/LogoLinkedIn";
import { Home, MessageCircle, Bell, User, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await fetch("/api/notifications/unread-count");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setUnreadCount(data.count || 0);
            } catch (error) {
                console.error("Error fetching unread count:", error);
                setUnreadCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch immédiatement
        fetchUnreadCount();

        // Configurer un intervalle pour rafraîchir périodiquement
        const interval = setInterval(fetchUnreadCount, 30000); // 30 secondes

        return () => clearInterval(interval);
    }, []);

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

                        <div className="relative md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Partie droite */}
                    <div className="flex items-center space-x-6">
                        <NavIcon
                            icon={<Home size={20} />}
                            active={pathname === "/dashboard"}
                            href="/dashboard"
                            label="Accueil"
                        />
                        <NavIcon
                            icon={<MessageCircle size={20} />}
                            active={pathname === "/messages"}
                            href="/messages"
                            label="Messages"
                        />
                        <NavIcon
                            icon={
                                <div className="relative">
                                    <Bell size={20} />
                                    {!isLoading && unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </div>
                            }
                            active={pathname === "/notifications"}
                            href="/notifications"
                            label="Notifications"
                        />
                        <NavIcon
                            icon={<User size={20} />}
                            active={pathname === "/profile"}
                            href="/profile"
                            label="Profil"
                        />

                        <button
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                            className="text-sm bg-transparent hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-md border border-gray-300 transition-colors duration-200"
                        >
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