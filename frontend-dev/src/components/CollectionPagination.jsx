import React from 'react';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = ""
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex flex-wrap justify-center items-center mt-8 gap-2 text-sm ${className}`}>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                Prev
            </button>

            <div className="flex flex-wrap gap-1 overflow-x-auto max-w-[300px] custom-scroll scrollbar-thin">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => onPageChange(i + 1)}
                        className={`px-3 py-1.5 rounded transition-all duration-200 ${currentPage === i + 1
                                ? "bg-orange-600 text-white shadow-md"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;