import React, { useEffect, useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NotificationsPage: React.FC = () => {
    const {
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        meta
    } = useNotification();

    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Mỗi khi currentPage thay đổi, tải lại thông báo
    useEffect(() => {
        loadNotifications(currentPage);
    }, [currentPage]);

    const loadNotifications = async (page: number) => {
        await fetchNotifications(page);
        // meta sẽ được cập nhật tự động trong context
    };

    const formatRelativeTime = (date: string | Date) =>
        formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });

    const handleMarkAllAsRead = async () => {
        setIsMarkingAll(true);
        await markAllAsRead();
        setIsMarkingAll(false);
    };

    const renderStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt' },
            reviewed: { color: 'bg-blue-100 text-blue-800', text: 'Đã xem' },
            offered: { color: 'bg-green-100 text-green-800', text: 'Đã mời' },
            accepted: { color: 'bg-green-100 text-green-800', text: 'Chấp nhận' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Từ chối' },
        };
        const cfg = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                {cfg.text}
            </span>
        );
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < meta.pages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Thông báo của tôi</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => loadNotifications(currentPage)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Làm mới
                    </button>
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={
                            loading ||
                            isMarkingAll ||
                            notifications.length === 0 ||
                            notifications.every(n => n.isRead)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                    </button>
                </div>
            </div>

            {/* Nội dung */}
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
                        {notifications.map(notification => (
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
                                        <div className="mt-1">{renderStatusBadge(notification.status)}</div>
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

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                        {/* Mobile */}
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage <= 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Trước
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= meta.pages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Tiếp
                            </button>
                        </div>

                        {/* Desktop */}
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị{' '}
                                    <span className="font-medium">
                                        {1 + (currentPage - 1) * meta.pageSize}
                                    </span>{' '}
                                    –{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * meta.pageSize, meta.total)}
                                    </span>{' '}
                                    trong{' '}
                                    <span className="font-medium">{meta.total}</span> kết quả
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage <= 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <span className="sr-only">Trang trước</span>
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    {Array.from({ length: meta.pages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage >= meta.pages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <span className="sr-only">Trang sau</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
