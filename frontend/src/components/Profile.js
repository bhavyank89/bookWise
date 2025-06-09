"use client";

import { CalendarDays, Undo2, Clock, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BorrowedBooksPage = () => {
    const [activeUser, setActiveUser] = useState({});
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userData, setUserData] = useState({
        avatar: '',
        name: '',
        email: '',
        uniId: '',
        avatarFile: null,
        uniIdFile: null
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:4000/fetchuser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem("auth-token"),
                    },
                });
                const json = await res.json();
                setActiveUser(json);
                setBorrowedBooks(json.books || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching user:", err);
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleOpenModal = () => {
        setUserData({
            avatar: activeUser.avatar?.[0]?.path || '',
            name: activeUser.name || '',
            email: activeUser.email || '',
            uniId: activeUser.uniId || '',
            avatarFile: null,
            uniIdFile: null
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setUserData(prev => ({ ...prev, [`${name}File`]: files[0] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('uniId', userData.uniId);
        if (userData.avatarFile) formData.append('avatar', userData.avatarFile);
        if (userData.uniIdFile) formData.append('uniIdFile', userData.uniIdFile);

        try {
            const res = await fetch("http://localhost:4000/auth/updateuser", {
                method: "POST",
                headers: { "auth-token": localStorage.getItem("auth-token") },
                body: formData
            });

            const json = await res.json();

            if (json.success) {
                setActiveUser(json.updatedUser);
                setIsModalOpen(false);
            } else {
                console.error("Error updating user", json.message);
            }
        } catch (err) {
            console.error("Error submitting form", err);
        }
    };

    return (
        <main className="min-h-screen text-white px-8 py-10 font-sans">
            <motion.div className="grid md:grid-cols-2 gap-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                {/* Left Card */}
                <motion.div className="bg-[#1b1e2e] rounded-2xl p-6 w-full max-w-md mx-auto shadow-lg" initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="flex justify-center items-center space-x-4">
                                <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
                                <div className="flex flex-col space-y-2">
                                    <div className="w-32 h-4 bg-gray-700 rounded"></div>
                                    <div className="w-40 h-4 bg-gray-700 rounded"></div>
                                    <div className="w-24 h-4 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <div className="w-full h-48 bg-gray-700 rounded-lg"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 p-0 items-center text-center">
                            <div className="flex flex-col col-span-1 items-center">
                                <img src={activeUser?.avatar?.[0]?.path || "/fury.png"} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-[#2c3145]" />
                            </div>
                            <div className="flex flex-col col-span-2 justify-between items-start">
                                <p className="text-sm text-green-400 mb-2 flex flex-row justify-between mt-2 items-baseline">
                                    {activeUser?.isVerified ? "✔ Verified Student" : "Verification Pending..."}
                                    <span className="ml-auto">
                                        <button onClick={handleOpenModal} className="text-sm text-blue-400 mt-2">
                                            <Edit size={20} />
                                        </button>
                                    </span>
                                </p>
                                <p className="text-sm text-gray-400 mt-1"><span className="font-semibold text-white mr-2">Name:</span> {activeUser?.name || "Student"}</p>
                                <p className="text-sm text-gray-400 mt-1"><span className="font-semibold text-white mr-2">Email ID:</span> {activeUser?.email || "example@student.com"}</p>
                                <p className="text-sm text-gray-400 mt-2"><span className="font-semibold text-white mr-2">Student ID:</span> {activeUser?.uniId || "N/A"}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 w-full h-auto">
                        {loading ? (
                            <div className="w-full h-48 bg-gray-700 rounded-lg"></div>
                        ) : (
                            <img src={activeUser?.uniIdDoc?.[0]?.path || "/fury.png"} alt="University ID" className="w-full h-[200px] rounded-xl object-cover border-2 border-[#2c3145]" />
                        )}
                    </div>
                </motion.div>

                {/* Right Column */}
                <motion.div initial={{ x: 100 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-xl font-semibold mb-4">Borrowed Books</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {loading ? (
                            <div className="grid gap-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="bg-[#1b1e2e] rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300 animate-pulse">
                                        <div className="w-full h-48 bg-gray-700 rounded-lg mb-3"></div>
                                        <div className="w-1/2 h-4 bg-gray-700 rounded mb-2"></div>
                                        <div className="w-1/3 h-4 bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : borrowedBooks.length === 0 ? (
                            <p className="text-gray-400">No books borrowed yet.</p>
                        ) : (
                            borrowedBooks.map((book, index) => (
                                <motion.div key={book._id || index} className="bg-[#1b1e2e] rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300" whileHover={{ scale: 1.05 }}>
                                    <img src={book.cover || "/origin-red.png"} alt={book.title} className="rounded-lg w-full h-48 object-cover mb-3" />
                                    <h3 className="font-semibold text-sm">{book.title || "Untitled"}</h3>
                                    <p className="text-xs text-gray-400">{book.category || "Unknown"}</p>
                                    <div className="mt-2 text-xs space-y-1 text-gray-300">
                                        <p className="flex items-center gap-1"><CalendarDays size={14} /> Borrowed on {book.date || "Unknown"}</p>
                                        {book.returned ? (
                                            <p className="flex items-center gap-1 text-green-400"><Undo2 size={14} /> Returned on {book.returned}</p>
                                        ) : book.overdue ? (
                                            <p className="flex items-center gap-1 text-red-400"><Clock size={14} /> Overdue Return</p>
                                        ) : book.due ? (
                                            <p className="flex items-center gap-1 text-yellow-400"><Clock size={14} /> Due on {book.due}</p>
                                        ) : null}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Modal for Editing Profile */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div className="bg-[#1b1e2e] rounded-lg p-6 w-96 shadow-lg" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300">Name</label>
                                        <input type="text" name="name" value={userData.name} onChange={handleChange} className="mt-2 px-4 py-2 w-full rounded-lg bg-[#2c3145] border border-[#444]" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300">Email</label>
                                        <input type="email" name="email" value={userData.email} onChange={handleChange} className="mt-2 px-4 py-2 w-full rounded-lg bg-[#2c3145] border border-[#444]" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300">University ID</label>
                                        <input type="text" name="uniId" value={userData.uniId} onChange={handleChange} className="mt-2 px-4 py-2 w-full rounded-lg bg-[#2c3145] border border-[#444]" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300">Avatar</label>
                                        <input type="file" name="avatar" onChange={handleFileChange} className="mt-2 px-4 py-2 w-full rounded-lg bg-[#2c3145] border border-[#444]" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300">University ID Document</label>
                                        <input type="file" name="uniId" onChange={handleFileChange} className="mt-2 px-4 py-2 w-full rounded-lg bg-[#2c3145] border border-[#444]" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white">Close</button>
                                        <button type="submit" className="bg-blue-500 px-4 py-2 rounded-lg text-white">Save Changes</button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default BorrowedBooksPage;
