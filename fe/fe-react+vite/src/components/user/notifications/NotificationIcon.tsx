import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationIconProps {
    className?: string;
    showBadgeOnly?: boolean;
    showIconOnly?: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
    className,
    showBadgeOnly = false,
    showIconOnly = true
}) => {
    const { unreadCount, fetchNotifications } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {

        fetchNotifications();


        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 60000);


        return () => clearInterval(intervalId);
    }, [fetchNotifications]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                buttonRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const togglePanel = () => {
        setIsOpen(prevState => !prevState);
    };

    return (
        <div className="relative">
            {!showBadgeOnly ? (
                <button
                    ref={buttonRef}
                    className={`relative p-1 rounded-full hover:bg-gray-100 focus:outline-none ${className}`}
                    onClick={togglePanel}
                >
                    <BellIcon className="h-6 w-6 text-gray-600" />

                    {/* Badge for unread notifications */}
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            ) : (
                showIconOnly ? null : (
                    unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )
                )
            )}

            {/* Notification panel */}
            {!showBadgeOnly && isOpen && (
                <div
                    ref={panelRef}
                    className="absolute right-0 z-10 mt-2 transform translate-x-1/4 shadow-lg"
                >
                    <NotificationsPanel />
                </div>
            )}
        </div>
    );
};

export default NotificationIcon; 