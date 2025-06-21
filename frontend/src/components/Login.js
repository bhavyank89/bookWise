import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { BookOpen } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import Cookies from "js-cookie";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Minimum 8 characters required" }),
});

function Login({ setIsLogin = () => { }, setActiveUser }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const bookImages = [
        {
            src: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=60",
            alt: "Classic Literature Collection",
        },
        {
            src: "https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?w=600&auto=format&fit=crop&q=60",
            alt: "Modern Fiction Books",
        },
        {
            src: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=60",
            alt: "Digital Reading Experience",
        },
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % bookImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [bookImages.length]);

    const imageVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } },
    };

    const handleRegisterClick = () => {
        navigate("/signup");
    };

    const fetchUser = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": Cookies.get("userToken"),
                },
            });
            const json = await res.json();
            setActiveUser(json);
            setIsLogin(true);
            return true;
        } catch (err) {
            console.error("Error fetching user:", err);
            toast.error(err.message || "server error");
            setActiveUser({});
            setIsLogin(false);
            return false;
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const response = await fetch(`${SERVER_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    role: "User", // ✅ Required for role-based login
                }),
            });

            const json = await response.json();
            if (response.ok && json.success) {
                Cookies.set("userToken", json.token,{ expires: 7 });
                const user = await fetchUser();
                if (user) {
                    toast.success("Login Successful");
                    navigate('/dashboard');
                }
                else {
                    Cookies.remove('userToken')
                };
            } else {
                toast.error(json.error || "Login failed!");
            }
        } catch (error) {
            toast.error("Server error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div onClick={() => { navigate('/') }} className="flex items-center cursor-pointer space-x-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <BookOpen size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-orange-500">Bookwise</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <motion.main
                className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 min-h-[calc(100vh-8rem)]">

                    {/* Form Section */}
                    <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="bg-[#0d0f17]/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-white">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    📚 BookWise
                                </h1>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Welcome Back
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Access the vast collection and stay updated.
                                </p>
                            </div>

                            {/* Form */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-300">
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        className="mt-1 bg-[#1e2230] border border-[#2c2f45] text-white placeholder:text-gray-500
                                                        focus:ring-orange-500 focus:border-orange-500"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-300">
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="********"
                                                            className="mt-1 bg-[#1e2230] border border-[#2c2f45] text-white placeholder:text-gray-500
                        focus:ring-orange-500 focus:border-orange-500 pr-10"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                            className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                                            tabIndex={-1}
                                                        >
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="mt-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 cursor-pointer font-semibold rounded-lg transition-all duration-300 ${isLoading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl"
                                            }`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2" aria-live="polite">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Logging in...</span>
                                            </div>
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>

                                    <div className="text-center pt-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Don't have an account yet?{" "}
                                            <button
                                                type="button"
                                                onClick={handleRegisterClick}
                                                className="text-orange-500 hover:text-orange-600 cursor-pointer font-medium hover:underline transition-colors duration-200"
                                            >
                                                Register here
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        className="relative w-full hidden lg:block max-w-sm lg:max-w-md"
                        key={currentImageIndex}
                        variants={imageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
                        <div
                            className="absolute -bottom-8 -left-8 w-24 h-24 bg-red-400 rounded-full opacity-20 animate-pulse"
                            style={{ animationDelay: "1s" }}
                        ></div>

                        {/* Main Image Container */}
                        <div className="relative w-full h-80 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={bookImages[currentImageIndex].src}
                                alt={bookImages[currentImageIndex].alt}
                                className="w-full h-full object-cover transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 to-transparent"></div>

                            {/* Side Decorative Lines */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-3">
                                <div className="w-2 h-12 bg-red-500 rounded-full opacity-60"></div>
                                <div className="w-2 h-16 bg-blue-500 rounded-full opacity-60"></div>
                                <div className="w-2 h-10 bg-green-500 rounded-full opacity-60"></div>
                            </div>
                        </div>

                        {/* Image Navigation Dots */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                            {bookImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    aria-label={`Select image ${index + 1}`}
                                    className={`w-3 h-3 cursor-pointer rounded-full transition-all duration-300 ${index === currentImageIndex
                                        ? "bg-orange-600 scale-110"
                                        : "bg-orange-300 hover:bg-orange-400"
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
}

export default Login;