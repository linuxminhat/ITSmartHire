import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
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

    fetchNotifications: (page?: number, pageSize?: number, force?: boolean) => Promise<void>;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Cấu hình thời gian tối thiểu giữa các lần gọi API (mili giây)
const MIN_FETCH_INTERVAL = 120000; // 2 phút

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [totalNotifications, setTotalNotifications] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [meta, setMeta] = useState({ current: 1, pageSize: 10, pages: 0, total: 0 });
    
    // Sử dụng useRef để lưu trữ thời gian gọi API cuối cùng
    const lastFetchTimeRef = useRef<number>(0);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Lấy thông tin Auth
    const { isAuthenticated } = useAuth();

    const fetchNotifications = useCallback(async (page: number = 1, pageSize: number = 10, force: boolean = false) => {
        if (!isAuthenticated) return;

        // Chỉ cho phép fetch khi:
        // 1. Force = true (ví dụ: người dùng tự refresh)
        // 2. Hoặc đã qua khoảng thời gian MIN_FETCH_INTERVAL
        // 3. Hoặc chưa có dữ liệu notifications
        const now = Date.now();
        if (
            !force && 
            now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL && 
            notifications.length > 0
        ) {
            console.log('[Notifications] Skipping fetch - too frequent');
            return;
        }
        
        // Hủy timeout fetch trước đó nếu có
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }
        
        lastFetchTimeRef.current = now;
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
    }, [isAuthenticated, meta.pageSize, notifications.length]);

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

    // Xử lý Firebase notifications
    useEffect(() => {
        if (isAuthenticated) {
            requestNotificationPermission();

            const unsubscribe = setupForegroundNotifications((payload) => {
                // Khi có thông báo mới từ Firebase, force fetch để cập nhật ngay
                fetchNotifications(1, 10, true);

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
                if (fetchTimeoutRef.current) {
                    clearTimeout(fetchTimeoutRef.current);
                }
            };
        }
    }, [isAuthenticated, fetchNotifications]);

    // Initial load và polling
    useEffect(() => {
        if (isAuthenticated) {
            // Fetch lần đầu khi mount
            fetchNotifications(1, 10, true);
            
            // Thiết lập polling với interval 5 phút
            const intervalId = setInterval(() => {
                fetchNotifications(1, 10, true);
            }, 300000); // 5 phút
            
            return () => clearInterval(intervalId);
        }
    }, [isAuthenticated, fetchNotifications]);

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