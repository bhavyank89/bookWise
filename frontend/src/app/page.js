"use client";

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "@/components/Login";
import App from "@/components/App";
import Signup from "@/components/Signup";
import Dashboard from "@/components/Dashboard";
import BookDetails from "@/components/BookDetails";
import SearchPage from "@/components/Search";
import Profile from "@/components/Profile";
import UploadPDF from "@/components/UploadPDF";
import Navbar from "@/components/Navbar";
import Landing from "@/components/Landing";
import { AnimatePresence } from "framer-motion";

function MainApp() {
  const [isLogin, setIsLogin] = useState(false);
  const [activeUser, setActiveUser] = useState({});
  const location = useLocation();

  return (
    <div className="bg-[url('/background.jpg')] min-h-screen bg-cover bg-no-repeat">
      {isLogin && <Navbar setIsLogin={setIsLogin} setActiveUser={setActiveUser} activeUser={activeUser}/>}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<App />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login setIsLogin={setIsLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookdetails/:id" element={<BookDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/uploadPDF" element={<UploadPDF />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
