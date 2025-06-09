"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import LogoutUser from "./LogoutUser";

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
        <header className="flex justify-between items-center p-10 mb-10 px-4 md:px-10">
            <div onClick={() => navigate("/dashboard")} className="cursor-pointer">
                <h1 className="text-2xl text-gray-50 font-bold flex items-center gap-2">
                    <BookOpen size={28} /> BookWise
                </h1>
            </div>
            <div className="flex text-gray-50 items-center gap-6">
                <button className="hover:cursor-pointer" onClick={() => navigate("/dashboard")}>
                    Home
                </button>
                <button className="hover:cursor-pointer" onClick={() => navigate("/search")}>
                    Search
                </button>

                <button onClick={() => navigate("/profile")} className="flex items-center gap-2 hover:cursor-pointer">
                    {/* Avatar if exists, else fallback initial */}
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
                    <span className="font-medium hover:cursor-pointer text-gray-50">
                        {activeUser?.name || "User"}
                    </span>
                </button>

                <LogoutUser setIsLogin={setIsLogin} />
            </div>
        </header>
    );
}

export default Navbar;
