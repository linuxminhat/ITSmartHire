import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserNotifications, getUnreadNotificationCount, INotification, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications.service';
import { useAuth } from '@/contexts/AuthContext';
import { requestNotificationPermission, setupForegroundNotifications } from '@/services/firebase.service';

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    //Lấy thông tin Auth
    const { isAuthenticated } = useAuth();

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const query = 'current=1&pageSize=10&sort=-createdAt';
            const res = await fetchUserNotifications(query);
            setNotifications(res.data.result);
            const countRes = await getUnreadNotificationCount();
            setUnreadCount(countRes.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);           // không check success
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (err) {
            console.error(err);
            alert('Không thể đánh dấu đã đọc');
        }
    };


    const markAllAsRead = async () => {
        try {
            const res = await markAllNotificationsAsRead();
            if (res.data?.success) {
                // Update all local notifications to be read
                const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
                setNotifications(updatedNotifications);

                // Reset unread count
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            alert('Không thể đánh dấu tất cả thông báo đã đọc');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            requestNotificationPermission();

            const unsubscribe = setupForegroundNotifications((payload) => {

                fetchNotifications();

                if (Notification.permission === 'granted') {
                    const { title, body } = payload.notification || {};
                    new Notification(title || 'Thông báo mới', {
                        body: body || 'Bạn có thông báo mới',
                    });
                }
            });

            // Cleanup
            return () => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            };
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 