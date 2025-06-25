import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import Pagination from "./Pagination";

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 12;
    const navigate = useNavigate();

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${SERVER_URL}/book/fetchall`);
                const data = await response.json();
                setBooks(data.books || []);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleBookClick = (book_id) => {
        navigate(`/bookDetails/${book_id}`, { state: { fromDashboard: true } });
    };

    const filteredBooks = books.filter((book) =>
        book.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

    return (
        <main className="min-h-screen text-white pb-14 px-4 md:px-10">
            {/* Header + Sticky Search */}
            <section className="text-center mt-10 mb-10 px-2 md:px-4">
                {/* Heading */}
                <motion.h2
                    className="text-sm md:text-base text-gray-400 tracking-widest"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    DISCOVER YOUR NEXT GREAT READ:
                </motion.h2>

                <motion.h1
                    className="text-3xl md:text-5xl font-extrabold mt-2"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Explore and Search for{" "}
                    <span className="text-yellow-400">Any Book</span> In Our Library
                </motion.h1>

                {/* Responsive Sticky Search Bar */}
                <div className="sticky top-[100px] w-full py-4 px-4 mt-6">
                    <motion.div
                        className="mx-auto w-full max-w-screen-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="relative w-full max-w-3xl mx-auto">
                            <label htmlFor="search" className="sr-only">
                                Search Books
                            </label>
                            <Input
                                id="search"
                                className="bg-[#1f2333] border border-[#2f334a] text-white placeholder:text-gray-500 pl-12 py-6 rounded-xl w-full"
                                placeholder="Search by title (e.g., Thriller, Mystery...)"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <Search className="absolute left-4 top-5 text-gray-400" size={22} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Optional Search Term Indicator */}
            {searchTerm && (
                <motion.div
                    className="text-xl font-medium text-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    Search Results for{" "}
                    <span className="text-yellow-400">{searchTerm}</span>
                </motion.div>
            )}

            {/* Book Grid */}
            <section className="mt-6 px-2 sm:px-4 pb-16 lg:px-6">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[...Array(itemsPerPage)].map((_, index) => (
                            <div key={index} className="bg-[#1c1f2c] p-4 rounded-xl shadow-md">
                                <Skeleton height={192} className="rounded-lg mb-3" />
                                <Skeleton width="60%" height={24} className="mb-2" />
                                <Skeleton width="40%" height={20} />
                            </div>
                        ))}
                    </div>
                ) : paginatedBooks.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                    >
                        {paginatedBooks.map((book) => (
                            <motion.div
                                key={book._id}
                                onClick={() => handleBookClick(book._id)}
                                className="bg-[#1c1f2c] p-4 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <img
                                    src={book.thumbnailCloudinary?.secure_url || "/fury.png"}
                                    alt={book.title || "Book cover"}
                                    className="rounded-lg w-full object-cover h-48 mb-3"
                                />
                                <div className="text-sm font-semibold truncate">{book.title || "Untitled"}</div>
                                <div className="text-xs text-gray-400">{book.genre || book.category || "Unknown Genre"}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="flex flex-col items-center justify-center mt-20 space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="bg-[#242837] p-6 rounded-full shadow-md">
                            <AlertCircle className="text-yellow-400" size={48} />
                        </div>
                        <h3 className="text-2xl font-bold">No Results Found</h3>
                        <p className="text-gray-400 text-sm max-w-sm text-center">
                            We couldn’t find any books matching your search. Try different keywords.
                        </p>
                        <Button
                            className="bg-yellow-400 text-black hover:bg-yellow-300 px-6 py-2 rounded-xl"
                            onClick={() => setSearchTerm("")}
                        >
                            Clear Search
                        </Button>
                    </motion.div>
                )}
            </section>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </main>
    );
};

export default SearchPage;
