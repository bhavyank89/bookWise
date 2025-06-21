"use client";

import React from 'react';
import { LogOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

function LogoutUser({ setIsLogin }) {
    const navigate = useNavigate();

    const handleOnClick = () => {
        Cookies.remove('userToken');
        Cookies.remove('hasSeenUserUnverifiedModal');
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
