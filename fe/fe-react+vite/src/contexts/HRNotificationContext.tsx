// src/contexts/HRNotificationContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
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
    
    // Track last fetch time to prevent excessive API calls
    const [lastFetchTime, setLastFetchTime] = useState(0);

    const fetchNotifications = useCallback(async (page = 1) => {
        if (!isHR) return;
        
        // Prevent fetching too frequently (minimum 5 seconds between fetches)
        const now = Date.now();
        if (now - lastFetchTime < 5000 && notifications.length > 0) return;
        
        setLastFetchTime(now);
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
    }, [isHR, lastFetchTime, meta.pageSize, notifications.length]);

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

    useEffect(() => {
        if (!isHR) return;
        requestNotificationPermission();

        const unsub = setupForegroundNotifications(() => fetchNotifications());

        return () => {
            typeof unsub === 'function' && unsub();
        };
    }, [isHR, fetchNotifications]);

    /* initial load */
    useEffect(() => {
        if (isHR) fetchNotifications();
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
