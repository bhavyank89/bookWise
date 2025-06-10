"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PopularBooks from "./PopularBooks";

const Dashboard = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredBook, setFeaturedBook] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const navigate = useNavigate();

    // useEffect(() => {
    //     if (books.length > 0 && !initialLoad) {
    //         let currentIndex = 0;
    //         const intervalId = setInterval(() => {
    //             setFeaturedBook(books[currentIndex]);
    //             currentIndex = (currentIndex + 1) % books.length;
    //         });

    //         return () => clearInterval(intervalId);
    //     }
    // }, [books, initialLoad]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch("http://localhost:4000/book/fetchall", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const json = await response.json();
                setBooks(json.books || []);
                setFeaturedBook(json.books[0] || null);  // Set initial featured book from the fetched list
            } catch (e) {
                console.error("Error fetching books:", e.message);
            } finally {
                setLoading(false);
                setInitialLoad(false);  // Mark initial loading as complete
            }
        };

        fetchBooks();
    }, []);

    // useEffect(() => {
    //     if (books.length > 0 && !initialLoad) {
    //         let currentIndex = 0;
    //         const intervalId = setInterval(() => {
    //             setFeaturedBook(books[currentIndex]);
    //             currentIndex = (currentIndex + 1) % books.length;
    //         }, 5000);

    //         return () => clearInterval(intervalId);
    //     }
    // }, [books, initialLoad]);

    const handleBookClick = (book_id) => {
        navigate(`/bookDetails/${book_id}`, { state: { fromDashboard: true } });
    };

    return (
        <motion.main
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
                duration: 0,
                ease: "easeInOut",
            }}
            className="min-h-screen text-white px-6 py-10 md:px-20"
        >
            {/* Featured Book Section */}
            {loading ? (
                <section className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16 animate-pulse">
                    <div className="max-w-xl space-y-4">
                        <div className="bg-gray-700 h-6 w-32 rounded-full"></div>
                        <div className="bg-gray-700 h-10 w-80 rounded"></div>
                        <div className="bg-gray-700 h-4 w-64 rounded"></div>
                        <div className="bg-gray-700 h-4 w-48 rounded"></div>
                        <div className="bg-gray-700 h-20 w-full rounded"></div>
                        <div className="bg-gray-600 h-10 w-48 rounded"></div>
                    </div>
                    <div className="w-48 md:w-60 h-72 bg-gray-700 rounded-xl shadow-xl"></div>
                </section>
            ) : (
                <AnimatePresence mode="wait">
                    {featuredBook && (
                        <motion.section
                            key={featuredBook._id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            transition={{
                                duration: 0,
                                ease: "easeInOut",
                            }}
                            className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16"
                        >
                            {/* Book Information */}
                            <div className="max-w-[450px]">
                                <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                                    Featured Book
                                </span>
                                <h2
                                    className="text-4xl font-bold mb-2 cursor-pointer"
                                    onClick={() => handleBookClick(featuredBook._id)}
                                >
                                    {featuredBook.title || "Untitled"}
                                </h2>
                                <p className="mb-2">
                                    By{" "}
                                    <span className="text-[#d1a954] font-medium">
                                        {featuredBook.author || "Unknown"}
                                    </span>{" "}
                                    &nbsp;|&nbsp; Category:{" "}
                                    <span className="text-[#d1a954] font-medium">
                                        {featuredBook.genre || featuredBook.category || "General"}
                                    </span>{" "}
                                    &nbsp;|&nbsp;
                                    <Star className="inline-block w-4 h-4 text-yellow-400" /> 4.5/5
                                </p>
                                <p className="text-sm mb-2">
                                    Total books: <strong>{featuredBook.count || 0}</strong> &nbsp;&nbsp;
                                    Available books: <strong>{featuredBook.available || 0}</strong>
                                </p>
                                <p className="text-gray-400 mb-4">
                                    {featuredBook.summary || "No summary available."}
                                </p>
                                <Button className="bg-[#f5c784] hover:bg-[#f1b65f] text-black font-semibold">
                                    📖 Borrow Book Request
                                </Button>
                            </div>

                            {/* Book Image */}
                            <div className="group xs:ml-2 lg:ml-80 mb-8 relative w-[276px] h-[385px] mx-auto">
                                <img
                                    onClick={() => handleBookClick(featuredBook._id)}
                                    src={featuredBook.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                    alt={featuredBook.title || "Featured Book Cover"}
                                    className="absolute top-0 left-0 w-[276px] h-[385px] rounded-xl object-cover z-10 transition-transform duration-500 ease-in-out group-hover:-translate-y-2 hover:cursor-pointer"
                                    style={{
                                        filter: "drop-shadow(-50px 4px 50px rgba(0, 0, 0, 0.5))",
                                        transform: "perspective(1000px) rotateY(-15deg) rotateX(5deg)",
                                        transformStyle: "preserve-3d",
                                    }}
                                />
                                <img
                                    src={featuredBook.thumbnailCloudinary?.secure_url || "/origin-blue.png"}
                                    alt="Blurred Featured Book Cover"
                                    className="absolute top-1 left-6 w-[276px] h-[385px] rounded-xl blur-sm opacity-80 z-0 transition-transform duration-500 ease-in-out group-hover:-translate-y-1"
                                    style={{
                                        transform: "rotate(5.23deg) perspective(1000px) rotateY(-10deg) rotateX(2deg)",
                                        transformStyle: "preserve-3d",
                                    }}
                                />
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            )}

            {/* Popular Books Section */}
            <PopularBooks loading={loading} books={books} handleBookClick={handleBookClick} />
        </motion.main>
    );
};

export default Dashboard;
