'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import CollectionRequestedBooks from './CollectionRequestedBooks';
import CollectionBorrowHistory from './CollectionBorrowHistory';
import CollectionSavedBooks from './CollectionSavedBooks';
import toast from 'react-hot-toast';

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

    const fetchUserCollectionData = useCallback(async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) throw new Error('No token found');

            const res = await fetch('http://localhost:4000/user', {
                method: 'GET',
                credentials: 'include',
                headers: { 'auth-token': token },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Fetch failed');

            if (isMounted) {
                setActiveUser(data);
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
                <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
                    <CollectionRequestedBooks
                        activeUser={activeUser}
                        borrowedBooks={activeUser.borrowedBooks || []}
                        onDataRefresh={fetchUserCollectionData}
                    />
                </motion.div>

                <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp}>
                    <CollectionBorrowHistory
                        books={activeUser.borrowHistory || []}
                        borrowedBooks={activeUser.borrowedBooks || []}
                        activeUser={activeUser}
                        onDataRefresh={fetchUserCollectionData}
                    />
                </motion.div>

                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
                    <CollectionSavedBooks
                        activeUser={activeUser}
                        savedBooks={activeUser.savedBooks || []}
                        onDataRefresh={fetchUserCollectionData}
                    />
                </motion.div>
            </div>
        </section>
    );
}

export default Collection;
