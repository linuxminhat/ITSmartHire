import React, { useEffect, useState } from 'react';
import { useHRNotification } from '@/contexts/HRNotificationContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HRNotificationsPage: React.FC = () => {
    const { notifications, fetchNotifications, meta, markAllAsRead, loading, markAsRead } = useHRNotification();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadNotifications(currentPage);
    }, [currentPage]);

    const loadNotifications = async (page: number) => {
        await fetchNotifications(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < meta.pages) setCurrentPage(currentPage + 1);
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow">
            <header className="flex items-center justify-between mb-6 border-b pb-4">
                <h1 className="text-2xl font-semibold text-gray-800">Quản lý thông báo</h1>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors"
                        onClick={() => loadNotifications(currentPage)}
                    >
                        Làm mới
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                        onClick={markAllAsRead}
                        disabled={loading || notifications.length === 0 || notifications.every(n => n.isRead)}
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                </div>
            </header>

            <div className="mb-4">
                <p className="text-gray-600">Hiển thị thông báo khi có ứng viên mới gửi CV ứng tuyển vào các vị trí của công ty</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Chưa có thông báo nào</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {notifications.map(n => (
                            <div 
                                key={n._id} 
                                className={`p-4 border rounded-lg shadow-sm ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-medium text-gray-900">{n.candidateName}</h3>
                                            {!n.isRead && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{n.candidateEmail}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(n.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                                    </div>
                                </div>
                                
                                <div className="mt-3">
                                    <p className="text-sm">
                                        Hồ sơ của <span className="font-medium">{n.candidateName}</span> gửi đến công ty ứng tuyển vị trí <span className="font-medium">"{n.jobName}"</span>
                                    </p>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center">
                                    <div>
                                        {n.isRead ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Đã đọc
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Mới
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        {!n.isRead && (
                                            <button
                                                onClick={() => markAsRead(n._id)}
                                                className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium"
                                            >
                                                Đánh dấu đã đọc
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 mt-4 rounded-b-lg">
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
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === currentPage
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
                </>
            )}
        </section>
    );
};

export default HRNotificationsPage;