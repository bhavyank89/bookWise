import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const PopularBooks = ({ loading, books, handleBookClick }) => {
    const scrollRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [noBooks, setNoBooks] = useState(false);

    useEffect(() => {
        setNoBooks(!loading && (!books || books.length === 0));
    }, [loading, books]);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const autoScroll = () => {
            if (scrollContainer && !isHovering) {
                scrollContainer.scrollLeft += 1;
                if (
                    scrollContainer.scrollLeft + scrollContainer.clientWidth >=
                    scrollContainer.scrollWidth
                ) {
                    scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
                }
            }
            requestAnimationFrame(autoScroll);
        };

        const scrollFrame = requestAnimationFrame(autoScroll);

        return () => cancelAnimationFrame(scrollFrame);
    }, [isHovering]);

    return (
        <section className="mb-8">
            <h3 className="text-xl font-semibold mb-6">Popular Books</h3>

            {noBooks ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <img
                        src="/no-books.png"
                        alt="No books found"
                        className="w-32 h-32 opacity-50 mb-4"
                    />
                    <p className="text-gray-400 text-lg">No popular books found</p>
                </div>
            ) : (
                <div
                    ref={scrollRef}
                    className="flex items-start gap-6 overflow-x-auto overflow-y-hidden py-4 no-scrollbar scroll-smooth"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[160px] h-[240px] bg-gray-700 animate-pulse rounded-lg shadow-inner"
                            ></div>
                        ))
                        : books.map((book, index) => (
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                key={book._id || index}
                                className="flex-shrink-0 w-[160px] h-[240px] bg-[#1a1a1a] rounded-lg shadow-md relative cursor-pointer overflow-hidden"
                                onClick={() => handleBookClick(book._id)}
                            >
                                <img
                                    src={book.thumbnailCloudinary?.secure_url || (book.thumbnailURL ? book.thumbnailURL : "/fury.png")}
                                    alt={book.title ? `Cover of ${book.title}` : "Book cover"}
                                    loading="lazy"
                                    className="w-full h-full object-cover rounded-sm"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-2 py-1">
                                    <p className="font-semibold text-xs text-white truncate text-center">
                                        {book.title || "Untitled"}
                                    </p>
                                    <p className="text-gray-300 text-[10px] truncate text-center">
                                        {book.author || "Unknown"}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                </div>
            )}
        </section>
    );
};

export default PopularBooks;
