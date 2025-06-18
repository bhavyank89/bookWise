"use client";
import React, { useState, useMemo, useEffect } from 'react';
import BookCard from './BookCard';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const SavedBooks = ({ books = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingUnsaveId, setLoadingUnsaveId] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    // Adjust items per page based on screen width
    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
            if (width < 640) setItemsPerPage(4);
            else if (width < 1024) setItemsPerPage(6);
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

    const handleUnsave = async (bookId) => {
        setLoadingUnsaveId(bookId);
        try {
            const res = await fetch(`http://localhost:4000/user/unsavebook/${bookId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    "auth-token": localStorage.getItem("userToken"),
                }
            });
            if (!res.ok) throw new Error('Unsave failed');
            toast.success('Book unsaved!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to unsave the book.');
        } finally {
            setLoadingUnsaveId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gray-100 p-4 md:p-6 rounded-lg shadow-lg"
        >
            <h2 className="text-2xl text-orange-300 font-bold mb-6 tracking-wide">💾 Saved Books</h2>

            {books?.length > 0 ? (
                <>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[75vh] overflow-y-auto pr-2 custom-scroll">
                        <AnimatePresence>
                            {paginatedBooks.map((entry, i) => (
                                <motion.div
                                    key={entry.book}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-900 p-3 rounded-md shadow transition-all duration-300 space-y-2 text-sm"
                                >

                                    <div className="hover:scale-[1.01] hover:shadow-xl cursor-pointer transition-transform duration-300">
                                        <BookCard bookId={entry.book} status="Saved" />
                                    </div>

                                    <div className="text-gray-300 mt-1">
                                        <p><strong>Saved At:</strong> {dayjs(entry.savedAt).format("DD MMM YYYY, hh:mm A")}</p>
                                    </div>

                                    <button
                                        onClick={() => handleUnsave(entry.book)}
                                        disabled={loadingUnsaveId === entry.book}
                                        className={`w-full mt-2 py-2 rounded text-xs font-semibold flex items-center justify-center transition-all duration-300 ease-in-out ${loadingUnsaveId === entry.book
                                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                            : "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] hover:shadow-lg"
                                            }`}
                                    >
                                        {loadingUnsaveId === entry.book ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4 mr-1" />
                                                Unsaving...
                                            </>
                                        ) : (
                                            "Unsave"
                                        )}
                                    </button>
                                </motion.div>

                            ))}
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
                        <div className="flex flex-wrap gap-1 overflow-x-auto max-w-[300px] custom-scroll scrollbar-thin">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1.5 rounded transition-all ${currentPage === i + 1
                                        ? "bg-orange-600 text-white"
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
                <p className="text-gray-400 italic">No saved books found.</p>
            )}
        </motion.div>
    );
};

export default SavedBooks;
