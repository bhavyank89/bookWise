import React, { useState, useEffect, useRef } from 'react';

function LandingStatsSection() {
    // Counter Component for Stats
    const Counter = ({ end, duration = 2000, suffix = '' }) => {
        const [count, setCount] = useState(0);
        const [isVisible, setIsVisible] = useState(false);
        const ref = useRef();

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true);
                    }
                },
                { threshold: 0.1 }
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
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                setCount(Math.floor(easeProgress * endValue));

                if (progress === 1) {
                    clearInterval(timer);
                }
            }, 16);

            return () => clearInterval(timer);
        }, [isVisible, end, duration]);

        return (
            <span ref={ref} className="text-2xl font-bold text-pink-500">
                {count}{suffix}
            </span>
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
                        <div key={stat.label} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="mb-4">
                                <Counter end={stat.value} suffix={stat.suffix} duration={2000 + index * 200} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{stat.label}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LandingStatsSection
