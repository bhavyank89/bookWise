import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function DashboardFeaturedBook({
    loading,
    handleBookClick,
    featuredBooks = [],
    featuredBook,
    setFeaturedBook,
    activeUser
}) {
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
    const [borrowLoading, setBorrowLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const scrollIntervalRef = useRef(null);

    useEffect(() => {
        if (featuredBooks.length > 1 && !loading && !borrowLoading && !saveLoading) {
            scrollIntervalRef.current = setInterval(() => {
                setCurrentFeaturedIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % featuredBooks.length;
                    setFeaturedBook(featuredBooks[nextIndex]);
                    return nextIndex;
                });
            }, 4000);
        }

        return () => clearInterval(scrollIntervalRef.current);
    }, [featuredBooks, loading, borrowLoading, saveLoading, setFeaturedBook]);

    const handleBorrow = () => {
        setBorrowLoading(true);
        clearInterval(scrollIntervalRef.current);
        setTimeout(() => {
            toast.success("Book borrow request submitted successfully!");
            setBorrowLoading(false);
        }, 1500);
    };

    const handleSave = () => {
        setSaveLoading(true);
        clearInterval(scrollIntervalRef.current);
        setTimeout(() => {
            toast.success("Book saved to your collection!");
            setSaveLoading(false);
        }, 1500);
    };

    return (
        <>
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
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -100, scale: 0.9 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16"
                        >
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
                                    By <span className="text-[#d1a954] font-medium">{featuredBook.author || "Unknown"}</span>
                                    &nbsp;|&nbsp; Genre: <span className="text-[#d1a954] font-medium">{featuredBook.genre || featuredBook.category || "General"}</span>
                                    &nbsp;|&nbsp; Type: <span className="text-[#74c0fc] font-semibold uppercase">{featuredBook.bookType || "Unknown"}</span>
                                </p>

                                {featuredBook.bookType !== "ebook" && (
                                    <p className="text-sm mb-2">
                                        Total books: <strong>{featuredBook.count || 0}</strong>
                                        &nbsp;&nbsp;
                                        Available books: <strong>{featuredBook.available || 0}</strong>
                                    </p>
                                )}

                                <p className="text-gray-400 mb-4">
                                    {featuredBook.summary || "No summary available."}
                                </p>

                                <div className="flex gap-4 flex-wrap">
                                    {(featuredBook.bookType === "both" || featuredBook.bookType === "physical") && (
                                        <Button
                                            onClick={handleBorrow}
                                            disabled={featuredBook.available <= 0 || borrowLoading || !activeUser?.isVerified}
                                            className={`font-semibold ${borrowLoading ? "bg-yellow-300 text-black" : "bg-[#f5c784] hover:bg-[#f1b65f] text-black"}`}
                                        >
                                            {borrowLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : "📖 Borrow Book Request"}
                                        </Button>
                                    )}

                                    {(featuredBook.bookType === "both" || featuredBook.bookType === "ebook") && (
                                        <Button
                                            onClick={handleSave}
                                            disabled={saveLoading || !activeUser?.isVerified}
                                            className={`font-semibold ${saveLoading ? "bg-blue-300 text-black" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                                        >
                                            {saveLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "💾 Save Book"}
                                        </Button>
                                    )}
                                </div>
                            </div>

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
        </>
    );
}

export default DashboardFeaturedBook;
