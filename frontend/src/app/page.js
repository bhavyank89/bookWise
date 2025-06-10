"use client";

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

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

// Animation variants
const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

// JS-compatible motion wrapper
function MotionWrapper({ children }) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function MarginTop({ children }) {
  return (
    <div className="pt-20 lg:pt-40">
      {children}
    </div>
  );
}


function MainApp() {
  const [isLogin, setIsLogin] = useState(false);
  const [activeUser, setActiveUser] = useState({});
  const location = useLocation();

  return (
    <div className="bg-[url('/background.jpg')] min-h-screen bg-cover bg-no-repeat">
      {isLogin && (
        <Navbar
          setIsLogin={setIsLogin}
          setActiveUser={setActiveUser}
          activeUser={activeUser}
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MotionWrapper><App /></MotionWrapper>} />
          <Route path="/landing" element={<MotionWrapper><Landing /></MotionWrapper>} />
          <Route path="/login" element={<MotionWrapper><Login setIsLogin={setIsLogin} /></MotionWrapper>} />
          <Route path="/signup" element={<MotionWrapper><Signup /></MotionWrapper>} />
          <Route path="/dashboard" element={<MotionWrapper><MarginTop><Dashboard /></MarginTop></MotionWrapper>} />
          <Route path="/bookdetails/:id" element={<MotionWrapper><MarginTop><BookDetails /></MarginTop></MotionWrapper>} />
          <Route path="/search" element={<MotionWrapper><MarginTop><SearchPage /></MarginTop></MotionWrapper>} />
          <Route path="/profile" element={<MotionWrapper><MarginTop><Profile /></MarginTop></MotionWrapper>} />
          <Route path="/uploadPDF" element={<MotionWrapper><UploadPDF /></MotionWrapper>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Router>
      <Toaster position="top-right" />
      <MainApp />
    </Router>
  );
}
