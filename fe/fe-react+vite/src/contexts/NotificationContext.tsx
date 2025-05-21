import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserNotifications, getUnreadNotificationCount, INotification, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notifications.service';
import { useAuth } from '@/contexts/AuthContext';
import { requestNotificationPermission, setupForegroundNotifications } from '@/services/firebase.service';

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    totalNotifications: number;
    loading: boolean;
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };

    fetchNotifications: (page?: number, pageSize?: number) => Promise<void>;
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
    const [totalNotifications, setTotalNotifications] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [meta, setMeta] = useState({ current: 1, pageSize: 10, pages: 0, total: 0 });
    //Lấy thông tin Auth
    const { isAuthenticated } = useAuth();

    const fetchNotifications = async (page: number = 1, pageSize: number = 10) => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const query = `current=${page}&pageSize=${meta.pageSize}&sort=-createdAt`;
            const res = await fetchUserNotifications(query);

            if (res.data) {
                setNotifications(res.data.result);
                setMeta(res.data.meta);

                // Set total count from pagination metadata
                if (res.data.meta) {
                    setTotalNotifications(res.data.meta.total);
                } else {
                    // Fallback if meta is not available
                    setTotalNotifications(res.data.result.length);
                }
            }

            const countRes = await getUnreadNotificationCount();
            if (countRes.data) {
                setUnreadCount(countRes.data.count);
            }
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
            if (res && res.statusCode === 200) {
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
                meta,
                totalNotifications,
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