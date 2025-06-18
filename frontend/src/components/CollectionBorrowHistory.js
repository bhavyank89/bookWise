'use client';

import React, { useState, useMemo, useEffect } from 'react';
import BookCard from './BookCard';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const BorrowHistory = ({ books = [], borrowedBooks = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingRequestId, setLoadingRequestId] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    const today = dayjs();

    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
            if (width < 640) setItemsPerPage(3);
            else if (width < 1024) setItemsPerPage(4);
            else if (width < 1280) setItemsPerPage(6);
            else setItemsPerPage(9);
        };
        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    const totalPages = Math.ceil(books.length / itemsPerPage);

    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return books.slice(start, start + itemsPerPage);
    }, [books, currentPage, itemsPerPage]);

    const isAlreadyRequested = (bookId) =>
        borrowedBooks.some(
            b =>
                b.book === bookId &&
                b.returnedAt === null &&
                b.borrowed === true // only true borrow entries, not pending/withdrawn
        );

    const handleRequestAgain = async (bookId) => {
        setLoadingRequestId(bookId);
        try {
            const res = await fetch(`http://localhost:4000/book/request/${bookId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    "auth-token": localStorage.getItem("userToken"),
                }
            });
            if (!res.ok) throw new Error("Failed to request again");
            toast.success("Requested again!");
        } catch (err) {
            console.error(err);
            toast.error("Could not request again");
        } finally {
            setLoadingRequestId(null);
        }
    };


    return (
        <motion.div
            className="text-gray-100 p-4 md:p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-2xl font-bold mb-6 text-yellow-400 tracking-wide">📚 Borrow History</h2>

            {books?.length > 0 ? (
                <>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto max-h-[75vh] pr-2 custom-scroll">
                        <AnimatePresence>
                            {paginatedBooks.map((entry, i) => {
                                const {
                                    book: bookId,
                                    borrowedAt,
                                    dueDate,
                                    returnedAt,
                                    lateFine,
                                } = entry;

                                const alreadyRequested = isAlreadyRequested(bookId);

                                return (
                                    <motion.div
                                        key={i}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-gray-900 rounded-md p-4 shadow text-sm duration-300"
                                    >
                                        {/* Add hover effect to BookCard wrapper */}
                                        <div className="hover:scale-[1.01] hover:shadow-xl cursor-pointer transition-transform duration-300">
                                            <BookCard bookId={bookId} status="Returned" />
                                        </div>

                                        <div className="text-gray-300 space-y-1 mt-3">
                                            <p><strong>Borrowed At:</strong> {dayjs(borrowedAt).format("DD MMM YYYY")}</p>
                                            <p><strong>Due Date:</strong> {dayjs(dueDate).format("DD MMM YYYY")}</p>
                                            <p><strong>Returned At:</strong> {dayjs(returnedAt).format("DD MMM YYYY")}</p>
                                            <p><strong>Late Fine:</strong> {lateFine > 0 ? `₹${lateFine}` : "-"}</p>
                                        </div>

                                        {/* Button with hover effect only */}
                                        <button
                                            onClick={() => handleRequestAgain(bookId)}
                                            disabled={alreadyRequested || loadingRequestId === bookId}
                                            className={`w-full mt-4 py-2 rounded text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out ${alreadyRequested
                                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                : loadingRequestId === bookId
                                                    ? "bg-gray-700 text-gray-400 cursor-wait"
                                                    : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] hover:shadow-lg"
                                                }`}
                                        >
                                            {loadingRequestId === bookId ? (
                                                <>
                                                    <Loader2 className="animate-spin w-4 h-4 mr-1" />
                                                    Requesting...
                                                </>
                                            ) : alreadyRequested ? (
                                                "Already Requested"
                                            ) : (
                                                "Request Again"
                                            )}
                                        </button>

                                    </motion.div>

                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap justify-center items-center mt-8 gap-2 text-sm">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <div className="flex flex-wrap gap-1 overflow-x-auto max-w-[300px] custom-scroll">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1.5 rounded transition-all ${currentPage === i + 1
                                        ? "bg-yellow-600 text-white"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p className="text-gray-400 italic">No borrowed books found.</p>
            )}
        </motion.div>
    );
};

export default BorrowHistory;
