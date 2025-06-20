// src/contexts/HRNotificationContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useRef,
} from 'react';

import {
    fetchHRNotifications,
    getUnreadHRNotificationCount,
    markHRNotificationAsRead,
    markAllHRNotificationsAsRead,
    IHRNotification,
} from '@/services/hr-notifications.service';

import { useAuth } from '@/contexts/AuthContext';
import {
    requestNotificationPermission,
    setupForegroundNotifications,
} from '@/services/firebase.service';

interface CtxType {
    notifications: IHRNotification[];
    unreadCount: number;
    meta: { current: number; pageSize: number; pages: number; total: number };
    loading: boolean;

    fetchNotifications: (page?: number) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const Ctx = createContext<CtxType | undefined>(undefined);

// Cấu hình thời gian tối thiểu giữa các lần gọi API (mili giây)
const MIN_FETCH_INTERVAL = 120000; // 2 phút

export const HRNotificationProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
    const isHR = user?.role?.name === 'HR';

    const [notifications, setNotifications] = useState<IHRNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    });
    
    // Sử dụng useRef để lưu trữ thời gian gọi API cuối cùng
    // useRef sẽ giữ giá trị qua các lần render mà không gây render lại
    const lastFetchTimeRef = useRef<number>(0);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchNotifications = useCallback(async (page = 1, force = false) => {
        if (!isHR) return;
        
        // Chỉ cho phép fetch khi:
        // 1. Force = true (ví dụ: người dùng tự refresh)
        // 2. Hoặc đã qua khoảng thời gian MIN_FETCH_INTERVAL
        // 3. Hoặc chưa có dữ liệu notifications
        const now = Date.now();
        if (
            !force &&
            page === meta.current &&
            now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL && 
            notifications.length > 0
        ) {
            console.log('[HR Notifications] Skipping fetch - too frequent');
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
            
            const res = await fetchHRNotifications(query);
            const data = res.data;

            if (data) {
                setNotifications(data.result);
                setMeta(data.meta);
            }

            const cntRes = await getUnreadHRNotificationCount();
            setUnreadCount(cntRes.data?.count ?? 0);
        } catch (err) {
            console.error('HR fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    }, [isHR, meta.pageSize, notifications.length, meta.current]);

    const markAsRead = async (id: string) => {
        try {
            await markHRNotificationAsRead(id);
            setNotifications((n) =>
                n.map((item) => (item._id === id ? { ...item, isRead: true } : item)),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (e) {
            console.error('HR mark read error:', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllHRNotificationsAsRead();
            setNotifications((n) => n.map((i) => ({ ...i, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error('HR mark all read error:', e);
        }
    };

    // Handler cho Firebase notifications
    useEffect(() => {
        if (!isHR) return;
        requestNotificationPermission();

        const unsub = setupForegroundNotifications(() => fetchNotifications(1, true));

        return () => {
            typeof unsub === 'function' && unsub();
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [isHR, fetchNotifications]);

    /* initial load */
    useEffect(() => {
        if (isHR) {
            fetchNotifications(1, true);
        }
    }, [isHR]); // Dependency array changed to only run once on mount

    // Separate useEffect for polling to avoid re-triggering on page change
    useEffect(() => {
        if (!isHR) return;
        
        const intervalId = setInterval(() => {
            console.log('Polling for new notifications on page 1...');
            fetchNotifications(1, true);
        }, 300000); // 5 phút
        
        return () => clearInterval(intervalId);
    }, [isHR, fetchNotifications]);

    return (
        <Ctx.Provider
            value={{
                notifications,
                unreadCount,
                meta,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </Ctx.Provider>
    );
};

export const useHRNotification = () => {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error('useHRNotification must be used inside HRNotificationProvider');
    return ctx;
};
