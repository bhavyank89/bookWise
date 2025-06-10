"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import LogoutUser from "./LogoutUser";
import { motion } from "framer-motion";

function Navbar({ setIsLogin, activeUser, setActiveUser }) {
    const navigate = useNavigate();

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
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        fetchUser();
    }, [activeUser]);

    return (
        <motion.header
            className="flex justify-between items-center p-10 mb-10 px-4 md:px-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                onClick={() => navigate("/dashboard")}
                className="cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                <h1 className="text-2xl text-gray-50 font-bold flex items-center gap-2">
                    <BookOpen size={28} /> BookWise
                </h1>
            </motion.div>

            <motion.div
                className="flex text-gray-50 items-center gap-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <motion.button
                    onClick={() => navigate("/dashboard")}
                    className="hover:cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Home
                </motion.button>

                <motion.button
                    onClick={() => navigate("/search")}
                    className="hover:cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Search
                </motion.button>

                <motion.button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 hover:cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {activeUser?.avatar?.[0]?.path ? (
                        <img
                            src={activeUser.avatar[0].path}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        />
                    ) : (
                        <div className="bg-white text-black font-semibold px-3 py-1 rounded-full">
                            {activeUser?.name ? activeUser.name[0]?.toUpperCase() : "U"}
                        </div>
                    )}
                    <span className="font-medium text-gray-50">
                        {activeUser?.name || "User"}
                    </span>
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    <LogoutUser setIsLogin={setIsLogin} />
                </motion.div>
            </motion.div>
        </motion.header>
    );
}

export default Navbar;
