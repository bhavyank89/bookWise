"use client";

import React from 'react';
import { LogOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

function LogoutUser({ setIsLogin }) {
    const navigate = useNavigate();

    const handleOnClick = () => {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('hasSeenUserUnverifiedModal');
        toast.success("successfully Logged out")
        setIsLogin(false);
        navigate('/');
    };

    return (
        <button className="text-red-400 text-xl hover:cursor-pointer" onClick={handleOnClick}>
            <LogOut />
        </button>
    );
}

export default LogoutUser;
