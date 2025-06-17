import React, { useState } from 'react';
import { Menu, X, Github, Instagram, Linkedin, BookOpen } from 'lucide-react';
import RoleModal from './RoleModal';
import LandingHeroSection from './LandingHeroSection';
import LandingServiceSection from './LandingServiceSection';
import LandingStatsSection from './LandingStatsSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
    exit: { opacity: 0, transition: { duration: 1 } }
};

const CombinedLandingPage = ({ setIsLogin, setActiveUser }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    const navigate = useNavigate();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole('');
    };

    const fetchUser = async (role) => {
        try {
            const token = localStorage.getItem(role === "user" ? "userToken" : "adminToken");

            const res = await fetch("http://localhost:4000/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            const json = await res.json();
            if (res.ok) {
                return { success: true, user: json };
            } else {
                return { success: false, error: json?.error || "Failed to fetch user" };
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            return { success: false, error: "Network error" };
        }
    };

    const handleContinue = async () => {
        if (!selectedRole) return;

        closeModal();

        const role = selectedRole.toLowerCase();
        const tokenKey = role === "user" ? "userToken" : "adminToken";
        const token = localStorage.getItem(tokenKey);
        if (!token) {
            console.warn("No token found for role:", role);
            role === "user" ? navigate("/login") : navigate("/adminLogin");
            return;
        }

        const { success, user } = await fetchUser(role);

        if (success && user) {
            if (role === "user") {
                setIsLogin(true);
                setActiveUser(user);
                navigate("/dashboard");
            } else {
                window.location.href = 'http://localhost:3001';
            }
        } else {
            setIsLogin(false);
            setActiveUser({});
            navigate("/login");
        }
    };


    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="landing"
                variants={fadeVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="min-h-screen font-sans text-gray-800 bg-gray-900"
            >
                {/* Navbar */}
                <nav className="bg-gray-900 shadow sticky top-0 z-50 py-4">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F79B72] rounded-full flex items-center justify-center">
                                <BookOpen size={24} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-[#F79B72]">Bookwise</span>
                        </div>
                        <div className="hidden md:flex space-x-6 items-center">
                            <button onClick={openModal} className="bg-[#F79B72] cursor-pointer text-black px-5 py-2 rounded-full hover:bg-orange-500 text-sm transition font-semibold">Get Started</button>
                        </div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden cursor-pointer text-[#EAEFEF]">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden px-6 pt-4 pb-6 space-y-2 border-t border-gray-700">
                            <button onClick={openModal} className="w-full bg-[#F79B72] text-black cursor-pointer px-5 py-2 rounded-full hover:bg-orange-500 text-sm transition font-semibold">Get Started</button>
                        </div>
                    )}
                </nav>

                {/* Role Selection Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <RoleModal
                            closeModal={closeModal}
                            setSelectedRole={setSelectedRole}
                            selectedRole={selectedRole}
                            handleContinue={handleContinue}
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                        />
                    )}
                </AnimatePresence>



                {/* BookwiseHero Section */}
                <motion.section
                    variants={fadeVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative overflow-hidden min-h-screen bg-gray-900"
                >
                    <LandingHeroSection openModal={openModal} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
                </motion.section>

                {/* Services Section */}
                <motion.section
                    variants={fadeVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="py-20"
                >
                    <LandingServiceSection />
                </motion.section>

                {/* CTA Section */}
                <motion.section
                    variants={fadeVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Let's be something <span className="text-yellow-300">amazing</span> together</h2>
                        <p className="text-pink-100 mb-6">
                            Curated book experiences, built for your reading journey
                        </p>
                        <button onClick={openModal} className="bg-white text-pink-500 px-8 py-3 rounded-full cursor-pointer font-semibold hover:bg-gray-100 transition shadow">
                            Get Started
                        </button>
                    </div>
                </motion.section>

                {/* Stats Section */}
                <motion.section
                    variants={fadeVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="py-20 bg-white"
                >
                    <LandingStatsSection />
                </motion.section>

                {/* Footer */}
                <motion.footer
                    variants={fadeVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-gray-900 text-white pt-16 pb-10 relative"
                >
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[#F79B72] rounded-full flex items-center justify-center">
                                    <BookOpen size={24} className="text-white" />
                                </div>
                                <span className="text-2xl font-bold text-[#F79B72]">Bookwise</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                BookWise is a digital library platform that allows users to discover, borrow, manage, and read books with features like search, categorization, file uploads, and user authentication.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer">
                                    <Github className="w-6 h-6 hover:text-blue-500 transition-colors" />
                                </a>
                                <a href="https://instagram.com/your-username" target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-6 h-6 hover:text-pink-500 transition-colors" />
                                </a>
                                <a href="https://linkedin.com/in/your-username" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="w-6 h-6 hover:text-blue-700 transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-10 border-t border-gray-800 pt-6 text-gray-500 text-sm">
                        © 2025 Developed by Bookwise. All rights reserved.
                    </div>
                </motion.footer>
            </motion.div>
        </AnimatePresence>
    );
};

export default CombinedLandingPage;
