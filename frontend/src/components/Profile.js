"use client";

import { BadgeCheck, Pencil } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ProfileEditModal from "./ProfileEditModal";

const Profile = () => {
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [userData, setUserData] = useState({
        avatar: "",
        name: "",
        email: "",
        uniId: "",
        avatarFile: null,
        uniIdFile: null,
    });

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    const fetchUserCollectionData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            if (!token) throw new Error("No token found");

            const res = await fetch(`${SERVER_URL}/user`, {
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setUserData((prev) => ({
            ...prev,
            [`${name}File`]: files[0],
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("email", userData.email);
        formData.append("uniId", userData.uniId);
        if (userData.avatarFile) formData.append("avatar", userData.avatarFile);
        if (userData.uniIdFile) formData.append("uniIdFile", userData.uniIdFile);

        try {
            const res = await fetch(`${SERVER_URL}/auth/updateuser`, {
                method: "POST",
                headers: {
                    "auth-token": localStorage.getItem("userToken"),
                },
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
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen text-white px-4 sm:px-6 md:px-10 py-8 font-sans max-w-screen-xl mx-auto w-full">
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
                                        className="text-blue-400 cursor-pointer ml-auto"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white mr-2">Name:</span>
                                    {activeUser?.name || "Student"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white mr-2">Email ID:</span>
                                    {activeUser?.email || "example@student.com"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white mr-2">Student ID:</span>
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

            <AnimatePresence>
                {isModalOpen && (
                    <ProfileEditModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSubmit={handleSubmit}
                        userData={userData}
                        onChange={handleChange}
                        onFileChange={handleFileChange}
                        submitting={submitting}
                    />
                )}
            </AnimatePresence>
        </main>
    );
};

export default Profile;
