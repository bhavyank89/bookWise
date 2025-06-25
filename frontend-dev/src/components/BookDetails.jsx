import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import BookDetailsMainBook from "./BookDetailsMainBook";
import BookDetailsPopularBooks from "./BookDetailsPopularBooks";

const BookDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    // Simple loading check - we'll let child components handle their own loading
    useEffect(() => {
        if (id) {
            setLoading(false);
        }
    }, [id]);

    // Loading status
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="px-4 py-6 sm:px-6 md:px-12 lg:px-20 text-white min-h-screen"
            >
                <div className="flex flex-col lg:flex-row gap-8 mb-12 animate-pulse">
                    <div className="w-full lg:w-1/3">
                        <div className="h-64 sm:h-80 lg:h-96 bg-gray-700 rounded-lg"></div>
                    </div>
                    <div className="w-full lg:w-2/3 space-y-4">
                        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                        <div className="h-20 bg-gray-700 rounded"></div>
                        <div className="h-10 bg-gray-700 rounded w-32"></div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="px-4 py-6 sm:px-6 md:px-12 lg:px-20 text-white min-h-screen"
        >
            {/* Each component now fetches its own data */}
            <BookDetailsMainBook bookId={id} />
            <BookDetailsPopularBooks bookId={id} />
        </motion.div>
    );
};

export default BookDetails;