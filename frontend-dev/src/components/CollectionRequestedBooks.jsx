'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import BookCard from './BookCard';
import Pagination from './CollectionPagination';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

const CollectionRequestedBooks = ({
    borrowedBooks = [],
    onDataRefresh,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [withdrawingId, setWithdrawingId] = useState(null);

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const requestedBooks = useMemo(() => {
        return Array.isArray(borrowedBooks)
            ? borrowedBooks.filter(
                (b) => b && b.borrowed === false && b.returnedAt === null
            )
            : [];
    }, [borrowedBooks]);

    const totalPages = Math.ceil(requestedBooks.length / itemsPerPage);
    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return requestedBooks.slice(start, start + itemsPerPage);
    }, [requestedBooks, currentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const handleWithdraw = async (borrowId) => {
        if (withdrawingId) return;

        setWithdrawingId(borrowId);
        let isMounted = true;

        try {
            const token = Cookies.get('userToken');
            if (!token) throw new Error('No auth token found');

            const res = await fetch(`${SERVER_URL}/book/withdraw/${borrowId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'auth-token': token,
                },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to withdraw');
            }
            if (isMounted) {
                toast.success('Request withdrawn successfully');
                onDataRefresh?.();
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            if (isMounted) {
                toast.error(error.message || 'Withdraw failed');
            }
        } finally {
            if (isMounted) {
                setWithdrawingId(null);
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
            <h2 className="text-xl sm:text-2xl font-bold text-green-400 tracking-wide mb-4">
                📨 Requested Books
            </h2>

            {requestedBooks.length === 0 ? (
                <div className="text-center py-10">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-400 italic text-lg">No requested books yet.</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Books you request will appear here while pending approval.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto pr-2 custom-scroll">
                        <AnimatePresence mode="wait">
                            {paginatedBooks.map((entry, i) => {
                                const book = entry.book;
                                const bookId = typeof book === 'string' ? book : book?._id;
                                const entryId = entry._id || `${bookId}-${i}`;

                                return (
                                    <motion.div
                                        key={entryId}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="bg-gray-900 rounded-lg p-3 sm:p-4 shadow border border-gray-700"
                                    >
                                        <div className="hover:scale-[1.01] hover:shadow-xl transition-transform duration-300">
                                            <BookCard bookId={bookId} book={book} status="Requested" />
                                        </div>

                                        <div className="text-xs text-gray-300 mt-3 space-y-1">
                                            <p>
                                                <strong>Requested:</strong>{' '}
                                                {entry.requestedAt
                                                    ? dayjs(entry.requestedAt).format('DD MMM YYYY')
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Status:</strong>{' '}
                                                <span className="text-yellow-400">Pending Approval</span>
                                            </p>
                                            {entry.dueDate && (
                                                <p>
                                                    <strong>Expected Due:</strong>{' '}
                                                    {dayjs(entry.dueDate).format('DD MMM YYYY')}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleWithdraw(bookId)}
                                            disabled={withdrawingId === entry._id}
                                            className={`w-full mt-3 py-2 px-3 rounded text-xs font-semibold flex items-center justify-center transition-all duration-300 ease-in-out ${withdrawingId === entry._id
                                                ? 'bg-gray-700 text-gray-400 cursor-wait'
                                                : 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer'
                                                }`}
                                        >
                                            {withdrawingId === entry._id ? (
                                                <>
                                                    <Loader2 className="animate-spin w-4 h-4 mr-1" />
                                                    Withdrawing...
                                                </>
                                            ) : (
                                                'Withdraw Request'
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

export default CollectionRequestedBooks;
