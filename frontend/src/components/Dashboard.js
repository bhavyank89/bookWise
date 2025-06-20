'use client';

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PopularBooks from "./PopularBooks";
import DashboardFeaturedBook from "./DashboardFeaturedBook";
import UnverifiedUserModal from "./UnverifiedModal";

const Dashboard = ({ activeUser, isLogin }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [featuredBook, setFeaturedBook] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    // Fetch all books on mount
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch("http://localhost:4000/book/fetchall");
                const json = await response.json();
                const allBooks = json.books || [];

                setBooks(allBooks);

                const topFiveBooks = allBooks.slice(0, 5);
                setFeaturedBooks(topFiveBooks);
                setFeaturedBook(topFiveBooks[0] || null);
            } catch (e) {
                console.error("Error fetching books:", e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Handle book navigation
    const handleBookClick = (book_id) => {
        navigate(`/bookDetails/${book_id}`, {
            state: { fromDashboard: true },
        });
    };

    // Show Unverified Modal once per session
    useEffect(() => {
        const hasSeenModal = sessionStorage.getItem('hasSeenUserUnverifiedModal');
        if (!activeUser?.isVerified && !hasSeenModal) {
            setIsModalOpen(true);
            sessionStorage.setItem('hasSeenUserUnverifiedModal', 'true');
        }
    }, [activeUser]);

    const closeModal = () => setIsModalOpen(false);
    const handleExplore = () => setIsModalOpen(false);

    return (
        <>
            {/* Modal */}
            <UnverifiedUserModal
                closeModal={closeModal}
                isModalOpen={isModalOpen}
                handleExplore={handleExplore}
            />

            {/* Dashboard Content */}
            <motion.main
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-h-screen text-white px-6 py-10 md:px-20"
            >
                <DashboardFeaturedBook
                    loading={loading}
                    activeUser={activeUser}
                    featuredBook={featuredBook}
                    setFeaturedBook={setFeaturedBook}
                    featuredBooks={featuredBooks}
                    handleBookClick={handleBookClick}
                />

                <PopularBooks
                    loading={loading}
                    books={books}
                    handleBookClick={handleBookClick}
                />
            </motion.main>
        </>
    );
};

export default Dashboard;
