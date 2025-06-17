import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Adjust according to your button component path
import { Star } from "lucide-react"; // Ensure this icon is imported from the correct package
import { BookOpen } from "lucide-react"; // Importing a different icon for the fallback state

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState({});
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await fetch(`http://localhost:4000/book/fetch/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const json = await response.json();
                setBook(json.book || {});
            } catch (e) {
                console.error("Error fetching book:", e.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchBooks = async () => {
            try {
                const response = await fetch("http://localhost:4000/book/fetchall", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const json = await response.json();
                setBooks(json.books || []);
            } catch (e) {
                console.error("Error fetching books:", e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
        fetchBook();
    }, [id]);

    const handleBookClick = (book_id, b) => {
        navigate(`/bookDetails/${book_id}`, { state: { fromDashboard: true } });
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="px-6 py-10 md:px-20 text-white"
            >
                <section className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16 animate-pulse">
                    <div className="h-6 w-32 bg-gray-700 rounded"></div>
                    <div className="h-10 w-64 bg-gray-700 rounded"></div>
                    <div className="h-4 w-48 bg-gray-700 rounded"></div>
                    <div className="h-4 w-40 bg-gray-700 rounded"></div>
                    <div className="h-20 w-full bg-gray-700 rounded"></div>
                    <div className="h-10 w-40 bg-gray-700 rounded"></div>
                </section>
            </motion.div>
        );
    }

    const genreBooks = books.filter((b) => b.genre === book.genre && b._id !== book._id);

    // If no genre matches, display random books (limit to 6)
    const displayedBooks = genreBooks.length > 0 ? genreBooks.slice(0, 6) : books.slice(0, 6);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="px-6 py-10 md:px-20 text-white"
        >
            {/* Featured Book */}
            <section className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
                <div className="max-w-[450px]">
                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                        {book?.author || "Unknown Author"}
                    </span>
                    <h2 className="text-4xl font-bold mb-2">{book?.title || "Book Title"}</h2>
                    <p className="mb-2">
                        By <span className="text-[#d1a954] font-medium">{book?.author || "Unknown"}</span> &nbsp;|&nbsp; Category: <span className="text-[#d1a954] font-medium">{book?.genre || book?.category || "General"}</span> &nbsp;|&nbsp;
                        <Star className="inline-block w-4 h-4 text-yellow-400" /> 4.5/5
                    </p>
                    <p className="text-sm mb-2">
                        Total books: <strong>{book?.count || 0}</strong> &nbsp;&nbsp;
                        Available books: <strong>{book?.available || 0}</strong>
                    </p>
                    <p className="text-gray-400 mb-4">
                        {book?.summary || "No summary available."}
                    </p>
                    <Button className="bg-[#f5c784] hover:bg-[#f1b65f] text-black font-semibold">
                        📖 Borrow Book Request
                    </Button>
                </div>

                {/* Book Image */}
                <div className="group relative w-[276px] h-[385px] mx-auto">
                    <img
                        src={book?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                        alt={book?.title || "Book Image"}
                        className="absolute top-0 left-0 w-[276px] h-[385px] rounded-xl object-cover z-10 transition-transform duration-500 ease-in-out group-hover:-translate-y-2"
                        style={{
                            filter: "drop-shadow(-50px 4px 50px rgba(0, 0, 0, 0.5))",
                            transform: "perspective(1000px) rotateY(-15deg) rotateX(5deg)",
                            transformStyle: "preserve-3d",
                        }}
                    />
                    <img
                        src={book?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                        alt="Blur"
                        className="absolute top-1 left-6 w-[276px] h-[385px] rounded-xl blur-sm opacity-80 z-0 transition-transform duration-500 ease-in-out group-hover:-translate-y-1"
                        style={{
                            transform: "rotate(5.23deg) perspective(1000px) rotateY(-10deg) rotateX(2deg)",
                            transformStyle: "preserve-3d",
                        }}
                    />
                </div>
            </section>

            {/* Video and Popular Books */}
            <div className="flex flex-col lg:flex-row gap-10 justify-around items-start">
                {/* Video Section */}
                <section className="lg:w-[70%]">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-6">Video</h3>
                        <video
                            width="640"
                            height="360"
                            controls
                            autoPlay
                            muted
                            loop
                            poster="thumbnail.jpg"
                        >
                            <source src={book?.videoCloudinary?.secure_url || "video.mp4"} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-6">Summary</h3>
                        <p className="text-gray-400 mb-4">
                            {book?.summary || "No summary available."}
                        </p>
                    </div>
                </section>

                {/* Popular Books Section */}
                <section className="w-full lg:w-[50%]">
                    <h3 className="text-xl font-semibold mb-6">Popular Books</h3>

                    {displayedBooks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                            {displayedBooks.map((b, index) => (
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }} // Rotation effect added here
                                    transition={{ type: "spring", stiffness: 300 }}
                                    key={index}
                                    className="cursor-pointer bg-[#1a1a1a] p-3 rounded-lg shadow-md hover:shadow-lg"
                                    onClick={() => handleBookClick(b._id || id, b)}
                                >
                                    <img
                                        src={b?.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                        alt={b.title}
                                        className="w-full h-40 object-cover rounded-md"
                                    />
                                    <div className="mt-2">
                                        <p className="font-semibold text-sm truncate text-white">{b.title}</p>
                                        <p className="text-gray-400 text-xs mt-1 truncate">{b.author}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                            {/* Cool Animated Fallback */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1000000000, ease: "linear" }}
                                className="mb-4"
                            >
                                <motion.div
                                    whileHover={{ rotate: 180 }} // Apply a 180-degree rotation on hover
                                    transition={{ duration: 0.5 }}
                                >
                                    <BookOpen size={64} className="text-gray-500" />
                                </motion.div>
                            </motion.div>

                            <p className="text-lg font-semibold">No popular books available yet!</p>
                            <p className="text-sm">Please check back later 📚</p>
                            <span className="text-xl mt-2">👋🤞</span>
                        </div>
                    )}
                </section>
            </div>
        </motion.div>
    );
};

export default BookDetails;
