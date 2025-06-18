"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import BookCard from './BookCard';

const ITEMS_PER_PAGE = 6;

const RequestedBooks = ({ books }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingWithdrawId, setLoadingWithdrawId] = useState(null);
    const today = dayjs();

    const activeBooks = useMemo(
        () => books?.filter(entry => entry.returnedAt === null) || [],
        [books]
    );

    const totalPages = Math.ceil(activeBooks.length / ITEMS_PER_PAGE);
    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return activeBooks.slice(start, start + ITEMS_PER_PAGE);
    }, [activeBooks, currentPage]);

    const handleWithdraw = async (bookId) => {
        setLoadingWithdrawId(bookId);
        try {
            const token = localStorage.getItem("userToken");
            if (!token) {
                toast.error("Authentication token missing!");
                return;
            }

            const res = await fetch(`http://localhost:4000/book/withdraw/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data?.error || 'Failed to withdraw request');
                console.error("Withdraw error response:", data);
                return;
            }

            toast.success('Request withdrawn successfully!');
            // Optional: Refresh or trigger parent state update
        } catch (err) {
            console.error("Withdraw error:", err);
            toast.error('Something went wrong while withdrawing.');
        } finally {
            setLoadingWithdrawId(null);
        }
    };

    return (
        <div className="text-gray-100 p-4 rounded-xl shadow-inner">
            <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-bold mb-4 text-blue-400"
            >
                📌 Requested Books
            </motion.h2>

            {activeBooks.length > 0 ? (
                <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto pr-1 pb-4 custom-scroll">
                        <AnimatePresence>
                            {paginatedBooks.map((entry, i) => {
                                const {
                                    book: bookId,
                                    requestedAt,
                                    borrowed,
                                    borrowedAt,
                                    dueDate,
                                    lateFine,
                                } = entry;

                                const isOverdue = borrowed && dueDate && dayjs(dueDate).isBefore(today);
                                const showWithdraw = !borrowed && !isOverdue;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-gray-900 p-4 rounded-lg shadow space-y-2 text-sm transition-all duration-300"
                                    >
                                        <div className="hover:scale-[1.01] hover:shadow-xl cursor-pointer transition-transform duration-300">
                                            <BookCard
                                                bookId={bookId}
                                                status={isOverdue ? "Overdue" : borrowed ? "Borrowed" : "Requested"}
                                            />
                                        </div>

                                        <div className="space-y-1 text-gray-300 mt-1">
                                            <p><strong>Requested:</strong> {dayjs(requestedAt).format("DD MMM YYYY")}</p>
                                            <p><strong>Borrowed:</strong> {borrowed ? dayjs(borrowedAt).format("DD MMM YYYY") : "-"}</p>
                                            <p><strong>Due:</strong> {borrowed ? dayjs(dueDate).format("DD MMM YYYY") : "-"}</p>
                                            <p><strong>Late Fine:</strong> {borrowed && lateFine > 0 ? `₹${lateFine}` : "-"}</p>
                                        </div>

                                        {showWithdraw && (
                                            <button
                                                onClick={() => handleWithdraw(bookId)}
                                                disabled={loadingWithdrawId === bookId}
                                                className={`w-full mt-2 py-2 rounded text-xs font-semibold flex items-center justify-center transition-all duration-300 ease-in-out 
                                                    ${loadingWithdrawId === bookId
                                                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                        : "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-lg"
                                                    }`}
                                            >
                                                {loadingWithdrawId === bookId ? "Withdrawing..." : "Withdraw Request"}
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded transition ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 italic"
                >
                    No requested or borrowed books found.
                </motion.p>
            )}
        </div>
    );
};

export default RequestedBooks;
