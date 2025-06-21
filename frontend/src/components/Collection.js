'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import CollectionRequestedBooks from './CollectionRequestedBooks';
import CollectionBorrowHistory from './CollectionBorrowHistory';
import CollectionSavedBooks from './CollectionSavedBooks';
import CollectionBorrowedBook from './CollectionBorrowedBook';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' },
    }),
};

function Collection() {
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(true); // mount tracking without useRef
    const [activeTab, setActiveTab] = useState('requested'); // Add tab state

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    const tabs = [
        { id: 'requested', label: 'Requested Books', component: 'CollectionRequestedBooks' },
        { id: 'borrowed', label: 'Borrowed Books', component: 'CollectionBorrowedBook' },
        { id: 'history', label: 'Borrow History', component: 'CollectionBorrowHistory' },
        { id: 'saved', label: 'Saved Books', component: 'CollectionSavedBooks' }
    ];

    const fetchUserCollectionData = useCallback(async () => {
        try {
            const token = Cookies.get('userToken');
            if (!token) throw new Error('No token found');

            const res = await fetch(`${SERVER_URL}/user`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'auth-token': token },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Fetch failed');

            if (isMounted) {
                setActiveUser(data);
                console.log(data)
            }
        } catch (err) {
            console.error('Fetch error:', err);
            if (isMounted) toast.error(err.message || 'Failed to load user');
        } finally {
            if (isMounted) setLoading(false);
        }
    }, [isMounted]);

    useEffect(() => {
        setIsMounted(true); // explicitly mark mount
        fetchUserCollectionData();

        return () => {
            setIsMounted(false); // cleanup on unmount
        };
    }, [fetchUserCollectionData]);

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'requested':
                return (
                    <CollectionRequestedBooks
                        activeUser={activeUser}
                        borrowedBooks={activeUser.borrowedBooks || []}
                        onDataRefresh={fetchUserCollectionData}
                    />
                );
            case 'borrowed':
                return (
                    <CollectionBorrowedBook
                        activeUser={activeUser}
                        borrowedBooks={activeUser.borrowedBooks || []}
                        onDataRefresh={fetchUserCollectionData}
                    />
                );
            case 'history':
                return (
                    <CollectionBorrowHistory
                        books={activeUser.borrowHistory || []}
                        borrowedBooks={activeUser.borrowedBooks || []}
                        activeUser={activeUser}
                        onDataRefresh={fetchUserCollectionData}
                    />
                );
            case 'saved':
                return (
                    <CollectionSavedBooks
                        activeUser={activeUser}
                        savedBooks={activeUser.savedBooks || []}
                        onDataRefresh={fetchUserCollectionData}
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center">
                <p className="text-yellow-400 text-sm animate-pulse">Loading user collection...</p>
            </div>
        );
    }

    if (!activeUser) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center">
                <p className="text-red-400 text-sm">User not found.</p>
            </div>
        );
    }

    return (
        <section className="min-h-screen w-full overflow-x-hidden text-gray-100 py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10 md:gap-12">
                {/* Tab Navigation */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="flex flex-wrap gap-2 sm:gap-4 border-b border-gray-700 pb-4"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm cursor-pointer sm:text-base font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-yellow-400 text-gray-900 shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Active Tab Content */}
                <motion.div
                    key={activeTab} // Add key to trigger re-animation on tab change
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    {renderActiveTabContent()}
                </motion.div>
            </div>
        </section>
    );
}

export default Collection;