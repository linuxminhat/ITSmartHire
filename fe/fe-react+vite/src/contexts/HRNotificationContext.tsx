import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useRef,
} from 'react';
//service use to call API
import {
    fetchHRNotifications,
    getUnreadHRNotificationCount,
    markHRNotificationAsRead,
    markAllHRNotificationsAsRead,
    IHRNotification,
} from '@/services/hr-notifications.service';

import { useAuth } from '@/contexts/AuthContext';
//Firebase Helper
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
const MIN_FETCH_INTERVAL = 120000;//2 minutes

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
    const lastFetchTimeRef = useRef<number>(0);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    //fetch notification
    const fetchNotifications = useCallback(async (page = 1, force = false) => {
        if (!isHR) return;
        //get now
        const now = Date.now();
        //spam
        if (
            !force &&
            page === meta.current &&
            now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL &&
            notifications.length > 0
        ) {
            console.log('[HR Notifications] Skipping fetch - too frequent');
            return;
        }
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        lastFetchTimeRef.current = now;
        setLoading(true);

        try {
            const query = `current=${page}&pageSize=${meta.pageSize}&sort=-createdAt`;
            //call API get notification list
            const res = await fetchHRNotifications(query);
            const data = res.data;

            //if there is no data
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
            //same id => set true (read)
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
    }, [isHR]);
    useEffect(() => {
        if (!isHR) return;

        const intervalId = setInterval(() => {
            console.log('Polling for new notifications on page 1...');
            fetchNotifications(1, true);
        }, 300000);

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
