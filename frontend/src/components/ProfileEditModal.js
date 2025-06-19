"use client";

import { motion } from "framer-motion";

const ProfileEditModal = ({
    isOpen,
    onClose,
    onSubmit,
    userData,
    onChange,
    onFileChange,
    submitting, // receives submitting prop
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
            {/* Overlay */}
            <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Modal Box */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
            >
                <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

                <form onSubmit={onSubmit}>
                    {["name", "email", "uniId"].map((field) => (
                        <div key={field} className="mb-4">
                            <label className="block text-sm font-medium text-white/90 mb-2 capitalize">
                                {field === "uniId" ? "University ID" : field}
                            </label>
                            <input
                                type="text"
                                name={field}
                                value={userData[field]}
                                onChange={onChange}
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
                            onChange={onFileChange}
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
                            onChange={onFileChange}
                            className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 file:cursor-pointer transition-all duration-300"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full cursor-pointer sm:w-1/2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full cursor-pointer sm:w-1/2 px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-orange-400/30 ${submitting
                                    ? "bg-orange-300 text-black opacity-50 cursor-not-allowed"
                                    : "bg-[#F79B72] hover:bg-orange-500 text-black"
                                }`}
                        >
                            {submitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileEditModal;
