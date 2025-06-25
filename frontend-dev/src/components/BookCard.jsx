import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ bookId, status }) => {
    const [book, setBook] = useState(null);
    const navigate = useNavigate();

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/book/fetch/${bookId}`);
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setBook(data.book);
            } catch (error) {
                console.error('Failed to fetch book:', error);
            }
        };

        if (bookId) {
            fetchBook();
        }
    }, [bookId,SERVER_URL]);

    if (!book) {
        return (
            <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
        );
    }

    const handleCardClick = (bookId) => {
        navigate(`/bookdetails/${bookId}`)
    }

    return (
        <div onClick={() => { handleCardClick(bookId) }} className="bg-gray-900 text-gray-100 cursor-pointer p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
            <img
                src={book.thumbnailCloudinary?.secure_url || book.thumbnailURL || "/fallback.png"}
                alt={book.title}
                className="w-full h-48 object-cover rounded-md mb-3"
            />
            <h3 className="text-lg font-bold truncate">{book.title}</h3>
            <p className="text-sm text-gray-400 truncate">{book.author}</p>
            <div className="mt-2">
                <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded 
                        ${status === "Returned" ? "bg-green-700 text-green-200" :
                            status === "Borrowed" ? "bg-yellow-600 text-yellow-100" :
                                status === "Requested" ? "bg-blue-700 text-blue-200" :
                                    "bg-gray-700 text-gray-300"}`}
                >
                    {status}
                </span>
            </div>
        </div>
    );
};

export default BookCard;
