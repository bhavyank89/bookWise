"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        console.log("Login button clicked");
        navigate('/login');
        // You can navigate to login page or do other logic here
    };

    const handleLandingPDF = () => {
        console.log("Loading button clicked");
        navigate('/landing');
        // You can navigate to login page or do other logic here
    };

    const handleSignupClick = () => {
        console.log("Signup button clicked");
        navigate('/signup');
        // You can navigate to signup page or do other logic here
    };

    const handleDashboardClick = () => {
        console.log("Dashboard button clicked");
        navigate('/dashboard');
        // You can navigate to signup page or do other logic here
    };

    const handlebookDetailsClick = () => {
        console.log("bookDetails button clicked");
        navigate('/bookdetails');
        // You can navigate to signup page or do other logic here
    };

    const handleSearchPageClick = () => {
        console.log("searchPage button clicked");
        navigate('/search');
        // You can navigate to signup page or do other logic here
    };

    const handleProfileClick = () => {
        console.log("Profile button clicked");
        navigate('/profile');
        // You can navigate to signup page or do other logic here
    };

    const handleUploadPDF = () => {
        console.log("uploadPDF button clicked");
        navigate('/uploadPDF');
        // You can navigate to signup page or do other logic here
    };

    return (
        <section className="p-4 max-w-md mx-auto">
            <Button
                onClick={handleLoginClick}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                Login
            </Button>
            <Button
                onClick={handleSignupClick}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                Signup
            </Button>
            <Button
                onClick={handleDashboardClick}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                Dashboard
            </Button>
            <Button
                onClick={handlebookDetailsClick}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                BookDetails
            </Button>
            <Button
                onClick={handleSearchPageClick}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                SearchBook
            </Button>
            <Button
                onClick={handleProfileClick}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                Profile
            </Button>
            <Button
                onClick={handleUploadPDF}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                uploadPDF
            </Button>
            <Button
                onClick={handleLandingPDF}
                className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
            >
                Landing Page
            </Button>
        </section>
    );
}

export default App;
