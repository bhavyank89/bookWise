"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PopularBooks from "./PopularBooks";
import DashboardFeaturedBook from "./DashboardFeaturedBook";

const Dashboard = ({ activeUser, isLogin }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [featuredBook, setFeaturedBook] = useState(null);

    const navigate = useNavigate();

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
                const allBooks = json.books || [];
                setBooks(allBooks);

                const topFiveBooks = allBooks.slice(0, 5);
                setFeaturedBooks(topFiveBooks);
                setFeaturedBook(topFiveBooks[0] || null); // Initial featured book
            } catch (e) {
                console.error("Error fetching books:", e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleBookClick = (book_id) => {
        navigate(`/bookDetails/${book_id}`, {
            state: { fromDashboard: true },
        });
    };

    return (
        <motion.main
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-screen text-white px-6 py-10 md:px-20"
        >
            {/* Featured Book Section */}
            <DashboardFeaturedBook
                loading={loading}
                activeUser={activeUser}
                featuredBook={featuredBook}
                setFeaturedBook={setFeaturedBook}
                featuredBooks={featuredBooks}
                handleBookClick={handleBookClick}
            />

            {/* Popular Books Section */}
            <PopularBooks
                loading={loading}
                books={books}
                handleBookClick={handleBookClick}
            />
        </motion.main>
    );
};

export default Dashboard;
