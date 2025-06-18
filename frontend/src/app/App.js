import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../path/to/your/main/component'; // Adjust the import path

function App({ activeUser, setActiveUser, setIsLogin }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { fetchUser, login, logout } = useAuth();

    const handleUserAuthentication = async () => {
        try {
            // Check for token first
            const userToken = localStorage.getItem("userToken");
            const token = userToken;

            if (!token) {
                console.warn("No token found");
                setLoading(false);
                navigate("/login");
                return;
            }

            // Try to fetch user data
            const result = await fetchUser();

            if (result.success) {
                // Successfully authenticated, redirect to dashboard
                navigate("/dashboard");
            } else {
                // Authentication failed, redirect to login
                console.error("Authentication failed:", result.error);
                navigate("/login");
            }
        } catch (err) {
            console.error("Error during authentication:", err);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If user is already authenticated, redirect to dashboard
        if (activeUser && Object.keys(activeUser).length > 0) {
            navigate("/dashboard");
            setLoading(false);
            return;
        }

        // Otherwise, check authentication status
        handleUserAuthentication();
    }, [activeUser, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-no-repeat flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700 font-medium text-lg">
                            Authenticating...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-no-repeat flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className="animate-pulse h-4 w-4 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium text-lg">
                        Redirecting...
                    </span>
                </div>
            </div>
        </div>
    );
}

export default App;