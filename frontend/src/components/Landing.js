import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "@fontsource/jetbrains-mono/400-italic.css";
import { useNavigate } from 'react-router-dom';
import { BookOpen } from "lucide-react";

const BookwiseHero = () => {
    const rotatingWords = ['discover', 'read', 'borrow', 'download'];
    const [wordIndex, setWordIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const navigate = useNavigate();

    const bookImages = [
        {
            src: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=60",
            alt: "Classic Literature Collection"
        },
        {
            src: "https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?w=600&auto=format&fit=crop&q=60",
            alt: "Modern Fiction Books"
        },
        {
            src: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=60",
            alt: "Digital Reading Experience"
        }
    ];

    // Typing animation effect
    useEffect(() => {
        const currentWord = rotatingWords[wordIndex];
        let timeout;

        if (isTyping) {
            // Typing phase
            if (displayedText.length < currentWord.length) {
                timeout = setTimeout(() => {
                    setDisplayedText(currentWord.slice(0, displayedText.length + 1));
                }, 150); // Typing speed
            } else {
                // Pause after typing complete
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 2000); // Pause duration
            }
        } else {
            // Backspacing phase
            if (displayedText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayedText(displayedText.slice(0, -1));
                }, 100); // Backspace speed
            } else {
                // Move to next word
                setWordIndex((prev) => (prev + 1) % rotatingWords.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayedText, isTyping, wordIndex, rotatingWords]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % bookImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden min-h-screen">
            {/* Decorative Circles */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 border-2 border-orange-400 rounded-full"></div>
                <div className="absolute bottom-32 right-16 w-24 h-24 border-2 border-orange-400 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-orange-400 rounded-full"></div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 py-16 gap-12 relative z-10">
                {/* Text Section */}
                <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                    {/* Logo */}
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                        <div className="w-12 h-12 bg-[#F79B72] rounded-full flex items-center justify-center">
                            <BookOpen size={28} />
                        </div>
                        <span className="text-2xl font-bold text-[#F79B72]">Bookwise</span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl lg:text-4xl font-bold text-center text-[#EAEFEF] leading-tight font-sans">
                        Let yourself<br />
                        <span className="relative inline-block text-5xl lg:text-6xl font-bold text-[#F79B72] font-[JetBrains Mono]">
                            <span className="relative z-10 flex items-center">
                                {displayedText}
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                    className="text-[#F79B72] ml-1 font-normal"
                                >
                                    |
                                </motion.span>
                            </span>
                        </span>
                        <br />
                        <span className="font-sans">
                            your next great escape<br /> through reading.
                        </span>
                    </h1>


                    {/* Description */}
                    <p className="text-lg text-center text-[#EAEFEF] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Explore thousands of ebooks and borrow your favorite books.
                        Immerse yourself in stories that inspire, educate, and entertain.
                        Your next great read awaits.
                    </p>

                    {/* CTA */}
                    {/* CTA */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#F79B72] text-black px-6 py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md hover:bg-orange-500 mx-auto" onClick={() => { navigate("/") }}
                    >
                        Get Started
                    </motion.button>


                    {/* Stats */}
                    <div className="flex gap-8 justify-center lg:justify-start pt-8 text-sm text-gray-400">
                        {[
                            { label: 'Ebooks', value: '10K+' },
                            { label: 'Members', value: '5K+' },
                            { label: 'Access', value: '24/7' }
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{stat.value}</div>
                                <div>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Image Section */}
                <div className="lg:w-1/2 flex justify-center relative">
                    <div className="relative w-80 h-96 lg:w-96 lg:h-[500px]">
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-400 rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-red-400 rounded-full opacity-20 animate-pulse delay-1000"></div>

                        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={bookImages[currentImageIndex].src}
                                    alt={bookImages[currentImageIndex].alt}
                                    className="w-full h-full object-cover"
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -40 }}
                                    transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                                />

                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent"></div>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
                                <div className="w-2 h-12 bg-red-500 rounded-full opacity-60"></div>
                                <div className="w-2 h-16 bg-blue-500 rounded-full opacity-60"></div>
                                <div className="w-2 h-10 bg-green-500 rounded-full opacity-60"></div>
                            </div>
                        </div>

                        {/* Floating Icon */}
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-md"
                        >
                            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                        </motion.div>

                        {/* Dots for Image Control */}
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {bookImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentImageIndex ? 'bg-orange-600' : 'bg-orange-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Curved Text */}
            <div className="absolute bottom-12 right-12 hidden lg:block">
                <svg width="200" height="200" viewBox="0 0 200 200" className="text-orange-400 opacity-30">
                    <defs>
                        <path id="circle-path" d="M100,100 m-75,0 a75,75 0 1,1 150,0 a75,75 0 1,1 -150,0" />
                    </defs>
                    <text className="text-sm fill-current">
                        <textPath href="#circle-path">
                            Read • Learn • Grow • Discover • Read • Learn • Grow • Discover •
                        </textPath>
                    </text>
                </svg>
            </div>
        </div>
    );
};

export default BookwiseHero;