'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BookCard from './BookCard';
import Pagination from './CollectionPagination';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

const CollectionBorrowHistory = ({
  books = [],
  borrowedBooks = [],
  activeUser,
  onDataRefresh,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerPage(3);
      else if (width < 768) setItemsPerPage(3);
      else if (width < 1024) setItemsPerPage(3);
      else if (width < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(books.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return books.slice(start, start + itemsPerPage);
  }, [books, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const isAlreadyRequested = (bookId) => {
    return borrowedBooks?.some(
      (b) =>
        (b.book === bookId || b.book?._id === bookId) &&
        b.returnedAt === null &&
        (b.borrowed === false || b.borrowed === true)
    );
  };

  const handleRequestAgain = async (bookId) => {
    if (loadingRequestId) return;
    setLoadingRequestId(bookId);
    let isMounted = true;

    try {
      const res = await fetch(`${SERVER_URL}/book/request/${bookId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'auth-token': Cookies.get('userToken'),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request again');
      }

      if (isMounted) {
        toast.success('Requested again!');
        onDataRefresh?.();
      }
    } catch (error) {
      console.error('Request error:', error);
      if (isMounted) {
        toast.error(error.message || 'Request failed');
      }
    } finally {
      if (isMounted) {
        setLoadingRequestId(null);
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
      <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-wide mb-4">
        📚 Borrow History
      </h2>

      {books.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl sm:text-6xl mb-4">📖</div>
          <p className="text-gray-400 italic text-base sm:text-lg">No borrowed books found.</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            Your borrowing history will appear here once you borrow books.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto pr-2 custom-scroll">
            <AnimatePresence mode="wait">
              {paginatedBooks.map((entry, i) => {
                const {
                  book,
                  borrowedAt,
                  dueDate,
                  returnedAt,
                  lateFine,
                  _id,
                } = entry;

                const bookId = typeof book === 'string' ? book : book?._id;
                if (!bookId) return null;

                const alreadyRequested = isAlreadyRequested(bookId);

                return (
                  <motion.div
                    key={`${bookId}-${_id || i}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-gray-900 rounded-lg p-3 sm:p-4 shadow text-sm duration-300"
                  >
                    <div className="hover:scale-[1.01] hover:shadow-xl transition-transform duration-300">
                      <BookCard bookId={bookId} book={book} status="Returned" />
                    </div>

                    <div className="text-gray-300 space-y-1 mt-3 text-xs sm:text-sm">
                      <p><strong>Borrowed:</strong> {dayjs(borrowedAt).isValid() ? dayjs(borrowedAt).format('DD MMM YYYY') : '-'}</p>
                      <p><strong>Due Date:</strong> {dayjs(dueDate).isValid() ? dayjs(dueDate).format('DD MMM YYYY') : '-'}</p>
                      <p><strong>Returned:</strong> {dayjs(returnedAt).isValid() ? dayjs(returnedAt).format('DD MMM YYYY') : '-'}</p>
                      <p><strong>Late Fine:</strong> {lateFine > 0 ? `₹${lateFine}` : '-'}</p>
                    </div>

                    <button
                      onClick={() => handleRequestAgain(bookId)}
                      disabled={alreadyRequested || loadingRequestId === bookId}
                      className={`w-full mt-4 py-2 px-3 rounded text-xs font-semibold flex items-center justify-center transition-all duration-300 ease-in-out ${alreadyRequested
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : loadingRequestId === bookId
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer'
                        }`}
                    >
                      {loadingRequestId === bookId ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-1" />
                          Requesting...
                        </>
                      ) : alreadyRequested ? (
                        'Already Requested'
                      ) : (
                        'Request Again'
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

export default CollectionBorrowHistory;
