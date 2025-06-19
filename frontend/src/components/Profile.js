"use client";

import { BadgeCheck, Pencil } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Profile = () => {
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userData, setUserData] = useState({
        avatar: "",
        name: "",
        email: "",
        uniId: "",
        avatarFile: null,
        uniIdFile: null,
    });

    const fetchUserCollectionData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            if (!token) throw new Error("No token found");

            const res = await fetch("http://localhost:4000/user", {
                method: "GET",
                credentials: "include",
                headers: { "auth-token": token },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Fetch failed");
            setActiveUser(data);
        } catch (err) {
            toast.error(err.message || "Failed to load user");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserCollectionData();
    }, [fetchUserCollectionData]);

    const handleOpenModal = () => {
        setUserData({
            avatar: activeUser?.avatar?.[0]?.path || "",
            name: activeUser?.name || "",
            email: activeUser?.email || "",
            uniId: activeUser?.uniId || "",
            avatarFile: null,
            uniIdFile: null,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setUserData((prev) => ({ ...prev, [`${name}File`]: files[0] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("email", userData.email);
        formData.append("uniId", userData.uniId);
        if (userData.avatarFile) formData.append("avatar", userData.avatarFile);
        if (userData.uniIdFile) formData.append("uniIdFile", userData.uniIdFile);

        try {
            const res = await fetch("http://localhost:4000/auth/updateuser", {
                method: "POST",
                headers: { "auth-token": localStorage.getItem("userToken") },
                body: formData,
            });

            const json = await res.json();
            if (json.success) {
                setActiveUser(json.updatedUser);
                toast.success("Profile updated successfully");
                setIsModalOpen(false);
            } else {
                toast.error(json.message || "Error updating data");
            }
        } catch (err) {
            toast.error(err.message || "Error updating data");
        }
    };

    return (
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-10 py-8 font-sans max-w-screen-xl mx-auto w-full">
            {/* Profile Section - Centered on large screens */}
            <motion.div
                className="flex flex-col items-center lg:flex-row lg:justify-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    className="bg-[#1b1e2e] rounded-2xl p-6 w-full max-w-xl shadow-lg"
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
                                <div className="flex flex-col space-y-2 text-center sm:text-left">
                                    <div className="w-32 h-4 bg-gray-700 rounded"></div>
                                    <div className="w-40 h-4 bg-gray-700 rounded"></div>
                                    <div className="w-24 h-4 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <div className="w-full h-48 bg-gray-700 rounded-lg"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-center sm:text-left">
                            <div className="flex justify-center sm:justify-start col-span-1">
                                <img
                                    src={activeUser?.avatar?.[0]?.path || "/fury.png"}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#2c3145]"
                                />
                            </div>
                            <div className="flex flex-col col-span-2 justify-between items-start gap-2">
                                <p className="text-sm text-green-400 flex justify-between items-center w-full">
                                    {activeUser?.isVerified ? (
                                        <span className="flex items-center gap-1">
                                            Verified Student <BadgeCheck color="orange" />
                                        </span>
                                    ) : (
                                        "Verification Pending..."
                                    )}
                                    <button
                                        onClick={handleOpenModal}
                                        className="text-blue-400 ml-auto"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white mr-2">Name:</span>{" "}
                                    {activeUser?.name || "Student"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white mr-2">Email ID:</span>{" "}
                                    {activeUser?.email || "example@student.com"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white mr-2">Student ID:</span>{" "}
                                    {activeUser?.uniId || "N/A"}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 w-full h-auto">
                        {loading ? (
                            <div className="w-full h-48 bg-gray-700 rounded-lg"></div>
                        ) : (
                            <img
                                src={activeUser?.uniIdDoc?.[0]?.path || "/fury.png"}
                                alt="University ID"
                                className="w-full h-[200px] sm:h-[250px] object-cover rounded-xl border-2 border-[#2c3145]"
                            />
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={handleCloseModal}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Edit Profile
                            </h2>

                            <form onSubmit={handleSubmit}>
                                {["name", "email", "uniId"].map((field) => (
                                    <div key={field} className="mb-4">
                                        <label className="block text-sm font-medium text-white/90 mb-2 capitalize">
                                            {field === "uniId" ? "University ID" : field}
                                        </label>
                                        <input
                                            type="text"
                                            name={field}
                                            value={userData[field]}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                ))}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-white/90 mb-2">
                                        Avatar
                                    </label>
                                    <input
                                        type="file"
                                        name="avatar"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer transition-all duration-300"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-white/90 mb-2">
                                        University ID Document
                                    </label>
                                    <input
                                        type="file"
                                        name="uniId"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer transition-all duration-300"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="w-full sm:w-1/2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-1/2 bg-[#F79B72] hover:bg-orange-500 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-orange-400/30"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Profile;
