'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CollectionRequestedBooks from './CollectionRequestedBooks';
import CollectionBorrowHistory from './CollectionBorrowHistory';
import CollectionSavedBooks from './CollectionSavedBooks';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' },
    }),
};

function Collection({ activeUser }) {
    const [user, setUser] = useState({});
    useEffect(() => {
        const fetchUser = async (role) => {
            try {
                const token = localStorage.getItem("userToken");

                const res = await fetch("http://localhost:4000/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });

                const json = await res.json();
                if (res.ok) {
                    setUser(json);
                } else {
                    console.log("Error fetching user data");
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, [user])
    return (
        <section className="min-h-screen w-full overflow-x-hidden text-gray-100 py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <CollectionRequestedBooks
                        activeUser={user}
                        books={user.borrowedBooks}
                    />
                </motion.div>

                <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <CollectionBorrowHistory
                        activeUser={user}
                        books={user.borrowHistory}
                        borrowedBooks={user.borrowedBooks}
                    />
                </motion.div>

                <motion.div
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <CollectionSavedBooks
                        activeUser={user}
                        books={activeUser.savedBooks}
                    />
                </motion.div>
            </div>
        </section>
    );
}

export default Collection;
