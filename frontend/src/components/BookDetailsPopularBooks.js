import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

function BookDetailsPopularBooks({ bookId }) {
    const [currentBook, setCurrentBook] = useState({});
    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch current book data
    const fetchCurrentBook = useCallback(async (id) => {
        try {
            const response = await fetch(`http://localhost:4000/book/fetch/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const json = await response.json();
            return json.book || {};
        } catch (e) {
            console.error("Error fetching current book:", e.message);
            return {};
        }
    }, []);

    // Fetch all books
    const fetchAllBooks = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:4000/book/fetchall", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const json = await response.json();
            return json.books || [];
        } catch (e) {
            console.error("Error fetching books:", e.message);
            return [];
        }
    }, []);

    // Fetch data on component mount and when bookId changes
    useEffect(() => {
        const fetchData = async () => {
            if (!bookId) return;

            setLoading(true);
            const [currentBookData, allBooksData] = await Promise.all([
                fetchCurrentBook(bookId),
                fetchAllBooks()
            ]);

            setCurrentBook(currentBookData);
            setAllBooks(allBooksData);
            setLoading(false);
        };

        fetchData();
    }, [bookId, fetchCurrentBook, fetchAllBooks]);

    // Memoized book filtering and selection
    const displayedBooks = useMemo(() => {
        if (!currentBook.genre || !allBooks.length) {
            return allBooks.slice(0, 12);
        }

        // Filter books by genre, excluding current book
        const genreBooks = allBooks.filter((b) =>
            b.genre === currentBook.genre && b._id !== currentBook._id
        );

        return genreBooks.length > 0 ? genreBooks.slice(0, 12) : allBooks.slice(0, 12);
    }, [currentBook.genre, currentBook._id, allBooks]);

    // Memoized title determination
    const sectionTitle = useMemo(() => {
        if (!currentBook.genre || !allBooks.length) return "Popular Books";

        const genreBooks = allBooks.filter((b) =>
            b.genre === currentBook.genre && b._id !== currentBook._id
        );

        return genreBooks.length > 0 ? "More in this Genre" : "Popular Books";
    }, [currentBook.genre, currentBook._id, allBooks]);

    // Memoized navigation handler
    const handleBookClick = useCallback((book_id) => {
        navigate(`/bookDetails/${book_id}`, { state: { fromDashboard: true } });
    }, [navigate]);

    // Show more books handler (for future implementation)
    const handleShowMore = useCallback(() => {
        console.log("Show more books - implement pagination/infinite scroll");
    }, []);

    // Loading state
    if (loading) {
        return (
            <section className="w-full mt-8 lg:mt-12">
                <div className="mb-6">
                    <div className="h-8 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="w-16 h-1 bg-gray-600 rounded-full animate-pulse"></div>
                </div>

                {/* Loading grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 lg:gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-700 rounded-lg p-3 lg:p-4">
                                <div className="bg-gray-600 rounded-md h-36 lg:h-40 xl:h-44 mb-3"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="w-full mt-8 lg:mt-12">
            <div className="mb-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">
                    {sectionTitle}
                </h3>
                <div className="w-16 h-1 bg-[#d1a954] mt-2 rounded-full"></div>
            </div>

            {displayedBooks.length > 0 ? (
                <div className="w-full">
                    {/* Desktop/Tablet Grid - 4-6 columns */}
                    <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 lg:gap-6">
                        {displayedBooks.map((book, index) => (
                            <motion.div
                                whileHover={{
                                    scale: 1.05,
                                    y: -8,
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                key={book._id || index}
                                className="cursor-pointer bg-gray-800/50 backdrop-blur-sm p-3 lg:p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-gray-700/50 border border-gray-700/50 hover:border-[#d1a954]/30"
                                onClick={() => handleBookClick(book._id)}
                            >
                                <div className="relative overflow-hidden rounded-md mb-3">
                                    <img
                                        src={book?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                        alt={book.title}
                                        className="w-full h-36 lg:h-40 xl:h-44 object-cover transition-transform duration-300 hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm lg:text-base text-white leading-tight line-clamp-2">
                                        {book.title}
                                    </p>
                                    <p className="text-gray-400 text-xs lg:text-sm truncate">
                                        {book.author}
                                    </p>
                                    {book.genre && (
                                        <span className="inline-block bg-[#d1a954]/20 text-[#d1a954] text-xs px-2 py-1 rounded-full">
                                            {book.genre}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Grid - 2-3 columns */}
                    <div className="md:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {displayedBooks.map((book, index) => (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                key={book._id || index}
                                className="cursor-pointer bg-gray-800/50 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-700/50 border border-gray-700/50"
                                onClick={() => handleBookClick(book._id)}
                            >
                                <div className="relative overflow-hidden rounded-md mb-2">
                                    <img
                                        src={book?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                        alt={book.title}
                                        className="w-full h-32 sm:h-36 object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-xs sm:text-sm text-white leading-tight line-clamp-2">
                                        {book.title}
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">
                                        {book.author}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Show More Button */}
                    {displayedBooks.length >= 12 && (
                        <div className="flex justify-center mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShowMore}
                                className="flex items-center gap-2 bg-[#d1a954] hover:bg-[#c19a4a] text-black font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
                            >
                                <BookOpen size={20} />
                                Show More Books
                            </motion.button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">
                        No Books Found
                    </h4>
                    <p className="text-gray-500 text-sm max-w-md">
                        We couldn't find any books to recommend at the moment. Please try again later.
                    </p>
                </div>
            )}
        </section>
    );
}

export default BookDetailsPopularBooks;