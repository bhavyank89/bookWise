import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

function BookDetailsPopularBooks({ book, books, handleBookClick }) {
    // Filter books by genre, excluding current book
    const genreBooks = books.filter((b) => b.genre === book.genre && b._id !== book._id);
    const displayedBooks = genreBooks.length > 0 ? genreBooks.slice(0, 12) : books.slice(0, 12);

    return (
        <section className="w-full mt-8 lg:mt-12">
            <div className="mb-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">
                    {genreBooks.length > 0 ? "More in this Genre" : "Popular Books"}
                </h3>
                <div className="w-16 h-1 bg-[#d1a954] mt-2 rounded-full"></div>
            </div>

            {displayedBooks.length > 0 ? (
                <div className="w-full">
                    {/* Desktop/Tablet Grid - 4-6 columns */}
                    <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 lg:gap-6">
                        {displayedBooks.map((b, index) => (
                            <motion.div
                                whileHover={{
                                    scale: 1.05,
                                    y: -8,
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                key={b._id || index}
                                className="cursor-pointer bg-gray-800/50 backdrop-blur-sm p-3 lg:p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-gray-700/50 border border-gray-700/50 hover:border-[#d1a954]/30"
                                onClick={() => handleBookClick(b._id)}
                            >
                                <div className="relative overflow-hidden rounded-md mb-3">
                                    <img
                                        src={b?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                        alt={b.title}
                                        className="w-full h-36 lg:h-40 xl:h-44 object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm lg:text-base text-white leading-tight line-clamp-2">
                                        {b.title}
                                    </p>
                                    <p className="text-gray-400 text-xs lg:text-sm truncate">
                                        {b.author}
                                    </p>
                                    {b.genre && (
                                        <span className="inline-block bg-[#d1a954]/20 text-[#d1a954] text-xs px-2 py-1 rounded-full">
                                            {b.genre}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Grid - 2-3 columns with horizontal scroll option */}
                    <div className="md:hidden">
                        {/* Standard mobile grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                            {displayedBooks.slice(0, 6).map((b, index) => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    key={b._id || index}
                                    className="cursor-pointer bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700/50"
                                    onClick={() => handleBookClick(b._id)}
                                >
                                    <div className="relative overflow-hidden rounded-md mb-2">
                                        <img
                                            src={b?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                            alt={b.title}
                                            className="w-full h-32 sm:h-36 object-cover"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm text-white leading-tight line-clamp-2">
                                            {b.title}
                                        </p>
                                        <p className="text-gray-400 text-xs truncate">
                                            {b.author}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Show more button for mobile if there are more books */}
                        {displayedBooks.length > 6 && (
                            <div className="mt-4 text-center">
                                <button
                                    className="text-[#d1a954] text-sm font-medium hover:text-[#f1b65f] transition-colors duration-200"
                                    onClick={() => {
                                        // You can implement expand functionality here
                                        console.log("Show more books");
                                    }}
                                >
                                    View All {displayedBooks.length} Books →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 lg:h-80 text-center text-gray-400 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                        className="mb-4"
                    >
                        <BookOpen size={48} className="text-gray-500 sm:w-16 sm:h-16" />
                    </motion.div>
                    <p className="text-lg sm:text-xl font-semibold mb-2">No books available</p>
                    <p className="text-sm sm:text-base text-gray-500">Check back later for more recommendations 📚</p>
                </div>
            )}
        </section>
    );
}

export default BookDetailsPopularBooks;