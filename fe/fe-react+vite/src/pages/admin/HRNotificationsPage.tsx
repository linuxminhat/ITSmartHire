import React, { useEffect } from 'react';
import { useHRNotification } from '@/contexts/HRNotificationContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const HRNotificationsPage: React.FC = () => {
    const { notifications, fetchNotifications, meta, markAllAsRead, loading, markAsRead } = useHRNotification();

    useEffect(() => { fetchNotifications(); }, []);

    return (
        <section className="bg-white p-6 rounded-lg shadow">
            <header className="flex items-center justify-between mb-6 border-b pb-4">
                <h1 className="text-2xl font-semibold text-gray-800">Quản lý thông báo</h1>
                <button
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    onClick={markAllAsRead}
                >
                    Đánh dấu tất cả đã đọc
                </button>
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

                    {meta.pages > 1 && (
                        <div className="flex justify-center items-center mt-6">
                            <nav className="flex items-center space-x-2">
                                {Array.from({ length: meta.pages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => fetchNotifications(page)}
                                        className={`px-4 py-2 rounded ${meta.current === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default HRNotificationsPage;