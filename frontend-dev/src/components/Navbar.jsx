import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import LogoutUser from "./LogoutUser";
import { motion, AnimatePresence } from "framer-motion";

function Navbar({ setIsLogin, activeUser, setActiveUser }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeRoute, setActiveRoute] = useState("");

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    useEffect(() => {
        // Set current route on initial mount and route change
        setActiveRoute(location.pathname);
    }, [location.pathname]);

    return (
        <motion.div className="fixed z-20 w-[95%] xs:ml-2 sm:ml-4 md:ml-7 mt-9 rounded-4xl border-amber-400 border-2 bg-gray-900/70 backdrop-blur-md">
            <motion.header
                className="flex justify-between items-center py-3 px-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Logo */}
                <motion.div
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F79B72] rounded-full flex items-center justify-center">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-[#F79B72]">Bookwise</span>
                    </div>
                </motion.div>

                {/* Desktop Nav */}
                <motion.div
                    className="hidden md:flex text-gray-50 items-center gap-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {[
                        { route: "/dashboard", label: "Home" },
                        { route: "/search", label: "Search" },
                        { route: "/collections", label: "Collections" },
                        { route: "/profile", label: "Profile" },
                    ].map(({ route, label }) => (
                        <motion.button
                            key={route}
                            onClick={() => navigate(route)}
                            className={`${activeRoute === route ? "text-yellow-400" : ""} cursor-pointer ${route === "/profile" ? "flex gap-2 items-center" : ""}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {route === "/profile" ? (
                                <>
                                    {activeUser?.avatar?.[0]?.path ? (
                                        <img
                                            src={activeUser.avatar[0].path}
                                            alt="Avatar"
                                            className={`w-8 h-8 rounded-full object-cover border-2 ${activeUser?.isVerified ? "border-green-500" : "border-white"}`}
                                        />
                                    ) : (
                                        <div className="bg-white text-black font-semibold px-3 py-1 rounded-full">
                                            {activeUser?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <span className="p-1 font-medium">{activeUser?.name || "User"}</span>
                                </>
                            ) : (
                                label
                            )}
                        </motion.button>
                    ))}
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                        <LogoutUser setIsLogin={setIsLogin} />
                    </motion.div>
                </motion.div>

                {/* Mobile Toggle Button */}
                <motion.button
                    onClick={toggleMobileMenu}
                    className="md:hidden text-gray-50 p-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden absolute top-full left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-2xl z-50 shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            {[
                                { route: "/dashboard", label: "Home" },
                                { route: "/search", label: "Search" },
                                { route: "/profile", label: activeUser?.name || "User" },
                                { route: "/collections", label: "Collections" },
                            ].map(({ route, label }) => (
                                <motion.button
                                    key={route}
                                    onClick={() => {
                                        navigate(route);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`text-gray-50 text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors ${route === "/profile" ? "flex items-center gap-3" : ""
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {route === "/profile" &&
                                        (activeUser?.avatar?.[0]?.path ? (
                                            <img src={activeUser.avatar[0].path} alt="User Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                                        ) : (
                                            <div className="bg-white text-black font-semibold px-3 py-1 rounded-full">
                                                {activeUser?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        ))}
                                    <span className="font-medium">{label}</span>
                                </motion.button>
                            ))}
                            <motion.div
                                className="px-4 pt-2"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                            >
                                <LogoutUser setIsLogin={setIsLogin} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Navbar;
