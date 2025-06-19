'use client';

import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import BookCard from './BookCard';
import Pagination from './Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const CollectionSavedBooks = ({
    savedBooks = [],
    activeUser,
    onDataRefresh,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [unsavingId, setUnsavingId] = useState(null);

    // Responsive itemsPerPage
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setItemsPerPage(3);
            else if (width < 768) setItemsPerPage(4);
            else if (width < 1024) setItemsPerPage(6);
            else if (width < 1280) setItemsPerPage(8);
            else setItemsPerPage(9);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(savedBooks.length / itemsPerPage);
    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return savedBooks.slice(start, start + itemsPerPage);
    }, [savedBooks, currentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    // Handle unsave request
    const handleUnsave = async (bookId) => {
        if (unsavingId) return;
        setUnsavingId(bookId);

        let isMounted = true;

        try {
            const res = await fetch(`http://localhost:4000/user/unsavebook/${bookId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'auth-token': localStorage.getItem('userToken'),
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to unsave');
            }

            if (isMounted) {
                toast.success('Book unsaved');
                onDataRefresh?.();
            }
        } catch (err) {
            console.error('Unsave error:', err);
            if (isMounted) {
                toast.error(err.message || 'Unsave failed');
            }
        } finally {
            if (isMounted) {
                setUnsavingId(null);
            }
        }

        return () => {
            isMounted = false;
        };
    };

    return (
        <motion.div
            className="text-gray-100 p-3 sm:p-4 md:p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-xl sm:text-2xl font-bold text-purple-400 tracking-wide mb-4">
                💾 Saved Books
            </h2>

            {savedBooks.length === 0 ? (
                <div className="text-center py-10">
                    <div className="text-5xl">📁</div>
                    <p className="text-gray-400 italic mt-2">No saved books yet.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto pr-2 custom-scroll">
                        <AnimatePresence mode="wait">
                            {paginatedBooks.map((entry, i) => {
                                const book = entry.book;
                                const bookId = typeof book === 'string' ? book : book?._id;
                                const key = `${bookId}-${i}`;
                                if (!bookId) return null;

                                return (
                                    <motion.div
                                        key={key}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="bg-gray-900 rounded-lg p-3 sm:p-4 shadow"
                                    >
                                        <div className="hover:scale-[1.01] hover:shadow-xl transition-transform duration-300">
                                            <BookCard bookId={bookId} book={book} status="Saved" />
                                        </div>

                                        <button
                                            onClick={() => handleUnsave(bookId)}
                                            disabled={unsavingId === bookId}
                                            className={`w-full cursor-pointer mt-3 py-2 px-3 rounded text-xs font-semibold flex items-center justify-center transition-all duration-300 ease-in-out ${unsavingId === bookId
                                                    ? 'bg-gray-700 text-gray-400 cursor-wait'
                                                    : 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                                                }`}
                                        >
                                            {unsavingId === bookId ? (
                                                <>
                                                    <Loader2 className="animate-spin w-4 h-4 mr-1" />
                                                    Removing...
                                                </>
                                            ) : (
                                                'Unsave'
                                            )}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default CollectionSavedBooks;
