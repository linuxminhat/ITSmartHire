import React, { useEffect, useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationsPage: React.FC = () => {
    const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Format date to Vietnamese relative time (e.g. "5 phút trước")
    const formatRelativeTime = (date: string | Date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    };

    const handleMarkAllAsRead = async () => {
        setIsMarkingAll(true);
        await markAllAsRead();
        setIsMarkingAll(false);
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

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Thông báo của tôi</h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchNotifications}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Làm mới
                    </button>
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={loading || isMarkingAll || notifications.length === 0 || notifications.every(n => n.isRead)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Đang tải thông báo...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">Bạn chưa có thông báo nào</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <li
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
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
                                        <p className="mt-2 text-sm text-gray-500">{notification.message}</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatRelativeTime(notification.createdAt)}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage; 