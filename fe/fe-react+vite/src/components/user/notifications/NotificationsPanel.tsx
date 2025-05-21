import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationsPanel: React.FC = () => {
    const { notifications, loading, fetchNotifications, markAsRead } = useNotification();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatRelativeTime = (date: string | Date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    };

    const renderStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string, text: string }> = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt' },
            'reviewed': { color: 'bg-blue-100 text-blue-800', text: 'Đã xem' },
            'offered': { color: 'bg-green-100 text-green-800', text: 'Đã mời' },
            'accepted': { color: 'bg-green-100 text-green-800', text: 'Chấp nhận' },
            'rejected': { color: 'bg-red-100 text-red-800', text: 'Từ chối' },
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">Thông báo</h2>
            </div>

            <div className="divide-y divide-gray-100">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-gray-500">Bạn chưa có thông báo nào</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notification._id)}
                        >
                            <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        Hồ sơ của bạn gửi đến công ty "{notification.companyName}" đã được cập nhật
                                    </p>
                                    <div className="mt-1">
                                        {renderStatusBadge(notification.status)}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatRelativeTime(notification.createdAt)}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-2 border-t border-gray-200 text-center">
                <Link
                    to="/jobs/applied"
                    className="inline-block w-full py-2 px-4 text-sm font-medium text-center text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                    Xem tất cả
                </Link>
            </div>
        </div>
    );
};

export default NotificationsPanel; 