import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { classNames } from '@/utils/classNames';
import { ICompany, ICompanyComment } from '@/types/backend';
import { callFetchCommentByCompany } from '@/services/comment.service';
import { InformationCircleIcon, StarIcon, MapIcon } from '@heroicons/react/24/outline';

import CompanyInfo from './CompanyInfo';
import CompanyReviews from './CompanyReviews';
import CompanyMap from './CompanyMap';

interface CompanyTabsProps {
    company: ICompany;
}

const CompanyTabs: React.FC<CompanyTabsProps> = ({ company }) => {
    const [comments, setComments] = useState<ICompanyComment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);

    const fetchComments = async () => {
        if (!company._id) return;
        setIsLoadingComments(true);
        try {
            const res = await callFetchCommentByCompany(company._id);
            if (res && res.data && Array.isArray(res.data.result)) {
                setComments(res.data.result);
            }
        } catch (error) {
            console.error("Failed to fetch comments for tabs", error);
            setComments([]);
        } finally {
            setIsLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [company._id]);
    
    // Định nghĩa các tab với ID ổn định
    const tabDefs = [
        { id: 'info', name: 'Giới thiệu', icon: InformationCircleIcon },
        { id: 'reviews', name: 'Đánh giá', icon: StarIcon },
        { id: 'map', name: 'Bản đồ', icon: MapIcon },
    ];

    return (
        <div className="w-full bg-white rounded-lg shadow-md">
            <Tab.Group>
                <Tab.List className="flex border-b border-gray-200 rounded-t-lg">
                    {tabDefs.map((tab) => {
                        // Tạo tên hiển thị động cho tab Đánh giá
                        const displayName = tab.id === 'reviews'
                            ? `${tab.name} (${isLoadingComments ? '...' : comments.length})`
                            : tab.name;
                        
                        return (
                            <Tab
                                key={tab.id} // Sử dụng ID ổn định làm key
                                className={({ selected }) =>
                                    classNames(
                                        'w-full py-4 px-1 text-center text-sm font-semibold leading-5 transition-all duration-200',
                                        'focus:outline-none focus:ring-2 ring-offset-2 ring-indigo-400 ring-opacity-60',
                                        selected
                                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                                            : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
                                    )
                                }
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <tab.icon className="h-5 w-5" aria-hidden="true" />
                                    <span>{displayName}</span>
                                </div>
                            </Tab>
                        );
                    })}
                </Tab.List>
                <Tab.Panels className="p-6">
                    <Tab.Panel>
                        <CompanyInfo company={company} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <CompanyReviews 
                            company={company}
                            initialComments={comments}
                            isLoading={isLoadingComments}
                            refetch={fetchComments}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <CompanyMap company={company} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default CompanyTabs;
