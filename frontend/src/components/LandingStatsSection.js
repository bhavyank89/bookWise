import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function LandingStatsSection() {
    const Counter = ({ end, duration = 2000, suffix = '' }) => {
        const [count, setCount] = useState(0);
        const [isVisible, setIsVisible] = useState(false);
        const ref = useRef();
        const controls = useAnimation();

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true);
                    }
                },
                { threshold: 0.3 }
            );

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => observer.disconnect();
        }, [isVisible]);

        useEffect(() => {
            if (!isVisible) return;

            const startTime = Date.now();
            const endValue = parseInt(end.replace(/[^0-9]/g, ''));

            const timer = setInterval(() => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const newCount = Math.floor(easeProgress * endValue);

                setCount(prev => {
                    if (newCount !== prev) {
                        controls.start({
                            scale: [1, 1.3, 1],
                            transition: { duration: 0.3 }
                        });
                    }
                    return newCount;
                });

                if (progress === 1) {
                    clearInterval(timer);
                }
            }, 16);

            return () => clearInterval(timer);
        }, [isVisible, end, duration, controls]);

        return (
            <motion.span
                ref={ref}
                animate={controls}
                className="text-2xl font-bold text-pink-500 inline-block"
            >
                {count}{suffix}
            </motion.span>
        );
    };

    const MotionStat = ({ children, delay = 0 }) => {
        const controls = useAnimation();
        const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

        useEffect(() => {
            if (inView) {
                controls.start({
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay }
                });
            }
        }, [controls, inView, delay]);

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 40 }}
                animate={controls}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300"
            >
                {children}
            </motion.div>
        );
    };

    return (
        <div>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">Our Impact</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Numbers that showcase our commitment to excellence and growth.
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-3 text-center">
                    {[
                        { label: 'Books Available', value: '10K', suffix: '+' },
                        { label: 'Active Members', value: '5K', suffix: '+' },
                        { label: 'Hours Available', value: '24', suffix: '/7' }
                    ].map((stat, index) => (
                        <MotionStat key={stat.label} delay={index * 0.2}>
                            <div className="mb-4">
                                <Counter end={stat.value} suffix={stat.suffix} duration={2000 + index * 300} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{stat.label}</h3>
                        </MotionStat>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LandingStatsSection;
