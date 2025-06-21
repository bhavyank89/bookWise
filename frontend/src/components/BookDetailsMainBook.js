import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../components/ui/button";
import { BookOpen, Bookmark, BookmarkCheck, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

function BookDetailsMainBook({ bookId }) {
    const [book, setBook] = useState({});
    const [activeUser, setActiveUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Memoize token to prevent unnecessary re-fetches
    const token = useMemo(() => Cookies.get("userToken"), []);

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    // Fetch book data
    const fetchBookData = useCallback(async (id) => {
        try {
            const response = await fetch(`${SERVER_URL}/book/fetch/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const json = await response.json();
            return json.book || {};
        } catch (e) {
            console.error("Error fetching book:", e.message);
            return {};
        }
    }, []);

    // Refresh book data
    const refreshBookData = useCallback(async () => {
        const updatedBook = await fetchBookData(bookId);
        setBook(updatedBook);
    }, [fetchBookData, bookId]);

    // Fetch user data
    useEffect(() => {
        const fetchActiveUser = async () => {
            try {
                if (!token) {
                    console.log("No token found");
                    return;
                }

                const res = await fetch(`${SERVER_URL}/user`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });

                const json = await res.json();
                if (res.ok) {
                    setActiveUser(json);
                } else {
                    console.log("Error fetching user data:", json.message || "Unknown error");
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        fetchActiveUser();
    }, [token]);

    // Fetch book data
    useEffect(() => {
        const fetchData = async () => {
            if (!bookId) return;

            setLoading(true);
            const bookData = await fetchBookData(bookId);
            setBook(bookData);
            setLoading(false);
        };

        fetchData();
    }, [bookId, fetchBookData]);

    // Memoized user ID to prevent unnecessary recalculations
    const userId = useMemo(() => activeUser?._id, [activeUser?._id]);

    // Memoized borrowers array to prevent deep comparison issues
    const borrowers = useMemo(() => book?.borrowers || [], [book?.borrowers]);

    // Memoized savedBy array to prevent deep comparison issues
    const savedBy = useMemo(() => book?.savedBy || [], [book?.savedBy]);

    // Memoized button states with stable dependencies
    const physicalButtonState = useMemo(() => {
        const isRequested = borrowers.some(borrower =>
            borrower.user === userId && !borrower.borrowed
        );
        const isBorrowed = borrowers.some(borrower =>
            borrower.user === userId && borrower.borrowed
        );

        if (isBorrowed) {
            return { text: "Borrowed", icon: BookOpen, disabled: true, variant: "borrowed" };
        }
        if (isRequested) {
            return { text: "Withdraw Request", icon: X, disabled: false, variant: "withdraw" };
        }
        return { text: "Borrow", icon: BookOpen, disabled: false, variant: "borrow" };
    }, [borrowers, userId]);

    const ebookButtonState = useMemo(() => {
        const isSaved = savedBy.includes(userId);

        if (isSaved) {
            return { text: "Unsave", icon: BookmarkCheck, disabled: false, variant: "unsave" };
        }
        return { text: "Save", icon: Bookmark, disabled: false, variant: "save" };
    }, [savedBy, userId]);

    // Memoized availability stats
    const availabilityStats = useMemo(() => ({
        available: book?.available || 0,
        borrowed: (book?.count || 0) - (book?.available || 0)
    }), [book?.available, book?.count]);

    // Memoized book type checks
    const bookTypeChecks = useMemo(() => ({
        hasPhysical: book?.bookType === "physical" || book?.bookType === "both" || !book?.bookType,
        hasEbook: book?.bookType === "ebook" || book?.bookType === "both"
    }), [book?.bookType]);

    // Physical book button logic
    const handlePhysicalBookAction = useCallback(async () => {
        const bookIdValue = book._id;
        const userIdValue = activeUser._id;

        if (!bookIdValue || !userIdValue) return;

        const isRequested = book.borrowers?.some(borrower =>
            borrower.user === userIdValue && !borrower.borrowed
        );
        const isBorrowed = book.borrowers?.some(borrower =>
            borrower.user === userIdValue && borrower.borrowed
        );

        if (isBorrowed) {
            return; // Button is disabled
        }

        setActionLoading(true);

        try {
            let url, method, successMessage;

            if (isRequested) {
                // Withdraw request
                url = `${SERVER_URL}/book/withdraw/${bookIdValue}`;
                method = "PUT";
                successMessage = "Request withdrawn successfully!";
            } else {
                // Make request
                url = `${SERVER_URL}/book/request/${bookIdValue}`;
                method = "PUT";
                successMessage = "Book requested successfully!";
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            const json = await response.json();

            if (response.ok) {
                toast.success(successMessage);
                await refreshBookData();
            } else {
                toast.error("An error occurred");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Network error");
        } finally {
            setActionLoading(false);
        }
    }, [book._id, book.borrowers, activeUser._id, token, refreshBookData]);

    // E-book button logic
    const handleEbookAction = useCallback(async () => {
        const bookIdValue = book._id;
        const userIdValue = activeUser._id;

        if (!bookIdValue || !userIdValue) return;

        const isSaved = book.savedBy?.includes(userIdValue);

        setActionLoading(true);

        try {
            let url, method, successMessage;

            if (isSaved) {
                // Unsave book
                url = `${SERVER_URL}/user/unsavebook/${bookIdValue}`;
                method = "DELETE";
                successMessage = "Book removed from saved list!";
            } else {
                // Save book
                url = `${SERVER_URL}/user/savebook/${bookIdValue}`;
                method = "POST";
                successMessage = "Book saved successfully!";
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            const json = await response.json();

            if (response.ok) {
                toast.success(successMessage);
                await refreshBookData();
            } else {
                toast.error("An error occurred");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Network error");
        } finally {
            setActionLoading(false);
        }
    }, [book._id, book.savedBy, activeUser._id, token, refreshBookData]);

    const handleReadBook = useCallback(() => {
        if (book?.pdfCloudinary?.secure_url) {
            window.open(book.pdfCloudinary.secure_url, '_blank');
        } else {
            toast.error("PDF not available");
        }
    }, [book?.pdfCloudinary?.secure_url]);

    // Stable button styling function using useCallback
    const getButtonStyling = useCallback((variant, isLoading) => {
        const baseClasses = "flex items-center gap-2 px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95";

        if (isLoading) {
            return `${baseClasses} opacity-70 cursor-wait`;
        }

        switch (variant) {
            case "borrowed":
                return `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed opacity-60`;
            case "withdraw":
                return `${baseClasses} bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/30`;
            case "borrow":
                return `${baseClasses} bg-[#f5c784] hover:bg-[#f1b65f] text-black shadow-lg hover:shadow-[#f5c784]/30`;
            case "unsave":
                return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/30`;
            case "save":
                return `${baseClasses} bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-600/30`;
            default:
                return `${baseClasses} bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-600/30`;
        }
    }, []);

    // Optimized button click handlers using useCallback
    const handlePhysicalBookActionWithDelay = useCallback(async () => {
        try {
            await handlePhysicalBookAction();
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error("Physical book action failed:", error);
        }
    }, [handlePhysicalBookAction]);

    const handleEbookActionWithDelay = useCallback(async () => {
        try {
            await handleEbookAction();
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error("Ebook action failed:", error);
        }
    }, [handleEbookAction]);

    const handleReadBookWithDelay = useCallback(async () => {
        try {
            await handleReadBook();
            await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
            console.error("Read book action failed:", error);
        }
    }, [handleReadBook]);

    // Loading state
    if (loading) {
        return (
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
        );
    }

    return (
        <>
            <section className="flex flex-col lg:flex-row gap-8 mb-12">
                {/* Book Image - Left Side */}
                <div className="w-full lg:w-1/3">
                    <div className="relative w-full max-w-xs mx-auto lg:max-w-none">
                        <img
                            src={book?.thumbnailCloudinary?.secure_url || book.thumbnailURL || "/origin-blue.png"}
                            alt={book?.title || "Book Image"}
                            className="w-full h-64 sm:h-80 lg:h-96 rounded-lg object-cover shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl"
                            loading="lazy"
                        />
                        {/* Loading overlay */}
                        {actionLoading && (
                            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center transition-opacity duration-300">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Book Details - Right Side */}
                <div className="w-full lg:w-2/3 space-y-4">
                    <div className="space-y-2">
                        <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold inline-block transition-colors duration-200 hover:bg-green-600">
                            {book?.genre || book?.category || "General"}
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight transition-colors duration-300">
                            {book?.title || "Book Title"}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 transition-colors duration-300">
                            By <span className="text-[#d1a954] font-medium hover:text-[#e6b963] transition-colors duration-200">{book?.author || "Unknown Author"}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span>Genre: <span className="text-[#d1a954] font-medium">{book?.genre || "General"}</span></span>
                    </div>

                    {/* Only show availability stats for physical books */}
                    {bookTypeChecks.hasPhysical && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/70">
                            <div className="text-center transform transition-transform duration-200 hover:scale-105">
                                <div className="text-2xl font-bold text-green-400 transition-colors duration-300">{availabilityStats.available}</div>
                                <div className="text-sm text-gray-400">Available</div>
                            </div>
                            <div className="text-center transform transition-transform duration-200 hover:scale-105">
                                <div className="text-2xl font-bold text-blue-400 transition-colors duration-300">{availabilityStats.borrowed}</div>
                                <div className="text-sm text-gray-400">Borrowed</div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="text-sm text-gray-400">Book Type:</div>
                        <div className="text-lg font-semibold capitalize transition-colors duration-300">{book?.bookType || "Physical"}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        {bookTypeChecks.hasPhysical && (
                            <Button
                                onClick={handlePhysicalBookActionWithDelay}
                                disabled={physicalButtonState.disabled || actionLoading || (activeUser.isVerified === false)}
                                className={getButtonStyling(physicalButtonState.variant, actionLoading)}
                            >
                                <physicalButtonState.icon className={`w-5 h-5 transition-transform duration-200 ${actionLoading ? 'animate-pulse' : ''}`} />
                                <span className="transition-opacity duration-200">
                                    {actionLoading ? "Processing..." : physicalButtonState.text}
                                </span>
                            </Button>
                        )}

                        {bookTypeChecks.hasEbook && (
                            <>
                                <Button
                                    onClick={handleEbookActionWithDelay}
                                    disabled={actionLoading || (activeUser.isVerified === false)}
                                    className={getButtonStyling(ebookButtonState.variant, actionLoading)}
                                >
                                    <ebookButtonState.icon className={`w-5 h-5 transition-transform duration-200 ${actionLoading ? 'animate-pulse' : ''}`} />
                                    <span className="transition-opacity duration-200">
                                        {actionLoading ? "Processing..." : ebookButtonState.text}
                                    </span>
                                </Button>

                                <Button
                                    onClick={handleReadBookWithDelay}
                                    disabled={actionLoading || (activeUser.isVerified === false)}
                                    className={getButtonStyling('read', actionLoading)}
                                >
                                    <ExternalLink className={`w-5 h-5 transition-transform duration-200 ${actionLoading ? 'animate-pulse' : ''}`} />
                                    <span className="transition-opacity duration-200">
                                        {actionLoading ? "Loading..." : "Read Book"}
                                    </span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Summary Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 transition-colors duration-300">Summary</h2>
                <div className="bg-gray-800/30 p-6 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/40">
                    <p className="text-gray-300 leading-relaxed transition-colors duration-300">
                        {book?.summary || "No summary available for this book. Please check back later for more details about the content and storyline."}
                    </p>
                </div>
            </section>

            {/* Video Section - Only show if video exists */}
            {(book?.videoCloudinary?.secure_url || book?.videoURL) && (
                <section className="mb-12">
                    <h3 className="text-xl font-semibold mb-4 transition-colors duration-300">Preview Video</h3>
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                        {(() => {
                            const url = book?.videoCloudinary?.secure_url || book?.videoURL;

                            // YouTube
                            const isYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(url);
                            if (isYouTube) {
                                const videoId = isYouTube[1];
                                return (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video player"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                );
                            }

                            // Google Drive
                            const isGoogleDrive = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\//.exec(url);
                            if (isGoogleDrive) {
                                const fileId = isGoogleDrive[1];
                                return (
                                    <iframe
                                        src={`https://drive.google.com/file/d/${fileId}/preview`}
                                        allow="autoplay"
                                        className="w-full h-full"
                                        title="Google Drive Video"
                                    ></iframe>
                                );
                            }

                            // Fallback: Render as HTML5 video
                            return (
                                <video
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                    controls
                                    preload="metadata"
                                    poster="/thumbnail.jpg"
                                >
                                    <source src={url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            );
                        })()}
                    </div>
                </section>
            )}


        </>
    );
}

export default BookDetailsMainBook;