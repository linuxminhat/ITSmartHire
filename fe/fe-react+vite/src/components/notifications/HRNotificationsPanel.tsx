import React, { useMemo, useCallback } from 'react';
import { useHRNotification } from '@/contexts/HRNotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const HRNotificationsPanel: React.FC = React.memo(() => {
    const { notifications, markAsRead, loading, unreadCount } = useHRNotification();

    // Memoize the date formatter function
    const fmt = useCallback((d: string | Date) =>
        formatDistanceToNow(typeof d === 'string' ? new Date(d) : d, {
            addSuffix: true,
            locale: vi,
        }), []);
        
    if (loading && !notifications.length) return (
        <div className="w-80 p-4 text-center bg-white rounded-lg shadow-lg">
            <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            <div className="mt-2">Đang tải thông báo...</div>
        </div>
    );

    // Memoize empty state JSX
    const emptyState = useMemo(() => (
        <div className="p-6 text-center text-gray-500">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">Chưa có thông báo</p>
        </div>
    ), []);

    return (
        <div className="w-80 bg-white rounded-lg shadow-lg max-h-[500px] overflow-hidden flex flex-col">
            <header className="p-3 bg-blue-50 border-b sticky top-0 z-10 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">Thông báo</span>
                {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {unreadCount} mới
                    </span>
                )}
            </header>

            <div className="overflow-y-auto flex-grow">
                {notifications.length === 0 ? emptyState :
                    notifications.map(n => (
                        <div 
                            key={n._id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 group transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(n._id)}
                        >
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 font-medium flex items-center">
                                        {n.candidateName} 
                                        {!n.isRead && (
                                            <span className="ml-2 w-2 h-2 bg-blue-600 inline-block rounded-full"></span>
                                        )}
                                    </p>
                                    <p className="text-sm">
                                        ứng tuyển vị trí <span className="font-medium">"{n.jobName}"</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{fmt(n.createdAt)}</p>
                                </div>
                                
                                {n.applicationId && (
                                    <Link 
                                        to={`/admin/applications/${n.applicationId}`}
                                        className="opacity-0 group-hover:opacity-100 ml-2 text-blue-600 hover:text-blue-800"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                }
            </div>
            
            <footer className="p-3 border-t bg-gray-50 text-center sticky bottom-0">
                <Link 
                    to="/admin/notifications" 
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Xem tất cả thông báo
                </Link>
            </footer>
        </div>
    );
});

export default HRNotificationsPanel;
