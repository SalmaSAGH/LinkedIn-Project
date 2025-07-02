import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

type ToastProps = {
    message: {
        id: string;
        content: string;
        sender: {
            name: string;
            image: string | null;
        };
    };
    onClose: () => void;
    onNavigate: () => void;
};

const MessageToast: React.FC<ToastProps> = ({ message, onClose, onNavigate }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        // Auto-fermeture après 5 secondes
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Attendre la fin de l'animation
    };

    const handleClick = () => {
        onNavigate();
        handleClose();
    };

    return (
        <div className={`fixed top-20 right-4 z-50 transition-all duration-300 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm w-full cursor-pointer hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-3" onClick={handleClick}>
                    <div className="flex-shrink-0">
                        <img
                            src={message.sender.image || '/default-avatar.png'}
                            alt={message.sender.name}
                            className="w-10 h-10 rounded-full"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {message.sender.name}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.content}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageToast;