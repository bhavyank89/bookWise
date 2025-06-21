"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Animation Variants
const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

function App() {
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  const handleSignupClick = () => navigate("/signup");
  const handleDashboardClick = () => navigate("/dashboard");
  const handlebookDetailsClick = () => navigate("/bookdetails");
  const handleSearchPageClick = () => navigate("/search");
  const handleProfileClick = () => navigate("/profile");
  const handleUploadPDF = () => navigate("/uploadPDF");
  const handleLandingPDF = () => navigate("/landing");

  return (
    <motion.section
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-4 max-w-md mx-auto"
    >
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
        Upload PDF
      </Button>
      <Button
        onClick={handleLandingPDF}
        className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f] mt-2 font-semibold"
      >
        Landing Page
      </Button>
    </motion.section>
  );
}

export default App;
