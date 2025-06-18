import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BookDetailsMainBook from "./BookDetailsMainBook";
import BookDetailsPopularBooks from "./BookDetailsPopularBooks";
import toast from "react-hot-toast";

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState({});
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeUser, setActiveUser] = useState({});
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    // fetch user
    useEffect(() => {
        const fetchActiveUser = async () => {
            try {
                const token = localStorage.getItem("userToken");

                if (!token) {
                    console.log("No token found");
                    return;
                }

                const res = await fetch("http://localhost:4000/user", {
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
    }, []);

    //  fetch single book and all books
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
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchBook(), fetchBooks()]);
            setLoading(false);
        };

        fetchData();
    }, [id]);

    // handle book click for other books
    const handleBookClick = (book_id) => {
        navigate(`/bookDetails/${book_id}`, { state: { fromDashboard: true } });
    };

    // Physical book button logic
    const handlePhysicalBookAction = async () => {
        const bookId = book._id;
        const isRequested = book.borrowers?.some(borrower =>
            borrower.user === activeUser._id && !borrower.borrowed
        );
        const isBorrowed = book.borrowers?.some(borrower =>
            borrower.user === activeUser._id && borrower.borrowed
        );

        if (isBorrowed) {
            return; // Button is disabled
        }

        setActionLoading(true);
        const token = localStorage.getItem("userToken");

        try {
            let url, method, successMessage;

            if (isRequested) {
                // Withdraw request
                url = `http://localhost:4000/book/withdraw/${bookId}`;
                method = "PUT";
                successMessage = "Request withdrawn successfully!";
            } else {
                // Make request
                url = `http://localhost:4000/book/request/${bookId}`;
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
                // Refresh book data
                const bookResponse = await fetch(`http://localhost:4000/book/fetch/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const bookJson = await bookResponse.json();
                setBook(bookJson.book || {});
            } else {
                toast.error("an error occured")
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Network error");
        } finally {
            setActionLoading(false);
        }
    };

    // E-book button logic
    const handleEbookAction = async () => {
        const bookId = book._id;
        const isSaved = book.savedBy?.includes(activeUser._id);

        setActionLoading(true);
        const token = localStorage.getItem("userToken");

        try {
            let url, method, successMessage;

            if (isSaved) {
                // Unsave book
                url = `http://localhost:4000/user/unsavebook/${bookId}`;
                method = "DELETE";
                successMessage = "Book removed from saved list!";
            } else {
                // Save book
                url = `http://localhost:4000/user/savebook/${bookId}`;
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
                // Refresh book data
                const bookResponse = await fetch(`http://localhost:4000/book/fetch/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const bookJson = await bookResponse.json();
                setBook(bookJson.book || {});
            } else {
                toast.error("An error occured");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Network error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReadBook = () => {
        if (book?.pdfCloudinary?.secure_url) {
            window.open(book.pdfCloudinary.secure_url, '_blank');
        } else {
            showToast("PDF not available", 'error');
        }
    };

    //  Loading status
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
            <BookDetailsMainBook
                book={book}
                activeUser={activeUser}
                actionLoading={actionLoading}
                handlePhysicalBookAction={handlePhysicalBookAction}
                handleEbookAction={handleEbookAction}
                handleReadBook={handleReadBook}
            />

            {/* Popular Books Section */}
            <BookDetailsPopularBooks
                book={book}
                books={books}
                handleBookClick={handleBookClick}
            />
        </motion.div>
    );
};

export default BookDetails;