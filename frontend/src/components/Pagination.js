import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const PaginationControls = ({ currentPage, totalPages, setCurrentPage, theme = "dark" }) => {
    if (totalPages <= 1) return null;

    const isDark = theme === "dark";

    const containerClasses = `
        fixed bottom-6 left-1/2 -translate-x-1/2 z-2
        backdrop-blur-sm rounded-xl px-4 py-3 flex flex-col items-center gap-3
        w-[90%] sm:w-auto max-w-full
        ${isDark ? "bg-black/30 border border-white/10 shadow-black/30" : "bg-white/30 border border-white/20 shadow-md"}
    `;

    const textColor = isDark ? "text-yellow-400" : "text-gray-800";
    const textMuted = isDark ? "text-gray-200" : "text-gray-500";
    const borderColor = isDark ? "border-gray-700" : "border-gray-300";
    const bgButton = isDark
        ? "bg-gray-800 hover:bg-gray-700 text-white"
        : "bg-[#F79B72] hover:bg-blue-100 text-gray-700";
    const activeButton = "bg-[#F79B72] text-blue-900 bg-[#F79B72]";

    return (
        <div className={containerClasses}>
            {/* Page Info Centered Above Buttons */}
            <p className={`text-sm ${textMuted}`}>
                Showing page{" "}
                <span className={`font-semibold ${textColor}`}>{currentPage}</span> of{" "}
                <span className={`font-semibold ${textColor}`}>{totalPages}</span>
            </p>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
                {/* Prev Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-2.5 py-1 text-sm border rounded flex items-center gap-1 transition-all duration-150
                    ${currentPage === 1
                            ? `opacity-50 cursor-not-allowed ${isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-100 border-gray-200 text-gray-400"}`
                            : `${bgButton} ${borderColor}`
                        }`}
                >
                    <ChevronLeft size={16} />
                    Prev
                </motion.button>

                {/* First Page */}
                {currentPage > 1 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setCurrentPage(1)}
                        className={`px-3 py-1 text-sm border rounded transition-all ${bgButton} ${borderColor}`}
                    >
                        1
                    </motion.button>
                )}

                {/* Current Page */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 text-sm border rounded shadow-sm ${activeButton}`}
                >
                    {currentPage}
                </motion.div>

                {/* Last Page */}
                {currentPage < totalPages && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1 text-sm border rounded transition-all ${bgButton} ${borderColor}`}
                    >
                        {totalPages}
                    </motion.button>
                )}

                {/* Next Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 py-1 text-sm border rounded flex items-center gap-1 transition-all duration-150
                    ${currentPage === totalPages
                            ? `opacity-50 cursor-not-allowed ${isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-100 border-gray-200 text-gray-400"}`
                            : `${bgButton} ${borderColor}`
                        }`}
                >
                    Next
                    <ChevronRight size={16} />
                </motion.button>
            </div>
        </div>
    );
};

export default PaginationControls;
