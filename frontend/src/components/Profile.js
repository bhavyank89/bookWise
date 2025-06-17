"use client";

import { CalendarDays, Undo2, Clock, BadgeCheck, Pencil } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const BorrowedBooksPage = ({ activeUser, setActiveUser }) => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userData, setUserData] = useState({
        avatar: '',
        name: '',
        email: '',
        uniId: '',
        avatarFile: null,
        uniIdFile: null
    });

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
                headers: { "auth-token": localStorage.getItem("userToken") },
                body: formData
            });

            const json = await res.json();

            if (json.success) {
                setActiveUser(json.updatedUser);
                toast.success("Data updated");
                setIsModalOpen(false);
            } else {
                console.error("Error updating user", json.message);
                toast.error(json.message || "Error updating data");
            }
        } catch (err) {
            console.error("Error submitting form", err);
            toast.error(err.message || "Error updating data");
        }
    };

    return (
        <main className="min-h-screen text-white px-8 py-10 font-sans">
            <motion.div className="grid lg:grid-cols-2 gap-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                {/* Left Card */}
                <motion.div className="bg-[#1b1e2e] h-fit rounded-2xl p-6 w-full max-w-md mx-auto shadow-lg" initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
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
                                    {activeUser?.isVerified ? (
                                        <span className="flex items-center gap-1">
                                            Verified Student <BadgeCheck color="orange" />
                                        </span>
                                    ) : (
                                        "Verification Pending..."
                                    )}
                                    <span className="ml-auto">
                                        <button onClick={handleOpenModal} className="text-sm cursor-pointer text-blue-400 ml-20 mt-2">
                                            <Pencil size={18} />
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
                    <div className="grid h-96 no-scrollbar lg:mr-12  overflow-y-auto sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-6">
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
                                <motion.div key={book._id || index} className="bg-[#1b1e2e] h-fit rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300" whileHover={{ scale: 1.05 }}>
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto no-scrollbar">
                        {/* Animated Backdrop - Glass effect */}
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={handleCloseModal}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* Animated Modal Content - Glass translucent background */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
                            className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-6 bg-white/20 rounded w-full"></div>
                                    <div className="h-6 bg-white/20 rounded w-full"></div>
                                    <div className="h-6 bg-white/20 rounded w-full"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/90 mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={userData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/90 mb-2">University ID</label>
                                        <input
                                            type="text"
                                            name="uniId"
                                            value={userData.uniId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/90 mb-2">Avatar</label>
                                        <input
                                            type="file"
                                            name="avatar"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer transition-all duration-300"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-white/90 mb-2">University ID Document</label>
                                        <input
                                            type="file"
                                            name="uniId"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer transition-all duration-300"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 cursor-pointer bg-[#F79B72] hover:bg-orange-500 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-orange-400/30"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default BorrowedBooksPage;
