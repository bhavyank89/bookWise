import { useEffect, useState, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import App from "./components/App";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import BookDetails from "./components/BookDetails";
import SearchPage from "./components/Search";
import Profile from "./components/Profile";
// import UploadPDF from "../components/UploadPDF";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Collection from "./components/Collection";
import Cookies from "js-cookie";

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Animation variants
const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
};

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
  return <div className="pt-20 lg:pt-40">{children}</div>;
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-no-repeat flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}

// Auth Provider Component
function AuthProvider({ children }) {
  const [isLogin, setIsLogin] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const fetchUser = async () => {
    try {
      // const userToken = localStorage.getItem("userToken");
      const userToken = Cookies.get("userToken");

      if (!userToken) {
        console.warn("No token found");
        setIsLogin(false);
        setActiveUser(null);
        return { success: false, error: "No token found" };
      }

      const res = await fetch(`${SERVER_URL}/user`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "auth-token": userToken,
        },
      });

      const json = await res.json();

      if (res.ok && json) {
        const userData = json.user || json;
        setActiveUser(userData);
        setIsLogin(true);
        return { success: true, user: userData };
      } else {
        console.error("Failed to fetch user:", json?.error);
        setIsLogin(false);
        setActiveUser(null);

        // Clear invalid localStorage data
        Cookies.remove("activeUser");
        Cookies.remove("isLogin");
        Cookies.remove("token");
        Cookies.remove("userToken");

        return { success: false, error: json?.error || "Failed to fetch user" };
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setIsLogin(false);
      setActiveUser(null);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    setIsLogin(false);
    setActiveUser(null);
    Cookies.remove("activeUser");
    Cookies.remove("isLogin");
    Cookies.remove("token");
    Cookies.remove("userToken");
  };

  const login = (userData, token) => {
    setActiveUser(userData);
    setIsLogin(true);
    Cookies.set("userToken", token, { expires: 7 });
    Cookies.set("activeUser", JSON.stringify(userData), { expires: 7 });
    Cookies.set("isLogin", "true", { expires: 7 });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = Cookies.get("activeUser");
        const storedLoginStatus = Cookies.get("isLogin");
        const token = Cookies.get("userToken");

        if (storedUser && storedLoginStatus === "true" && token) {
          // Try to restore from localStorage first
          try {
            const userData = JSON.parse(storedUser);
            setActiveUser(userData);
            setIsLogin(true);

            // Verify token is still valid
            const result = await fetchUser();
            if (!result.success) {
              // Token is invalid, clear everything
              logout();
            }
          } catch (e) {
            console.error("Error parsing stored user data:", e);
            logout();
          }
        } else if (token) {
          // Token exists but no stored user data, fetch from server
          await fetchUser();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  });

  const value = {
    isLogin,
    activeUser,
    loading,
    initialized,
    setIsLogin,
    setActiveUser,
    fetchUser,
    logout,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component - Requires authentication
function ProtectedRoute({ children }) {
  const { isLogin, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Auth Route Component - Redirects if already authenticated
function AuthRoute({ children }) {
  const { isLogin, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  if (isLogin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Route Component - Accessible to all
function PublicRoute({ children }) {
  const { loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  return children;
}

// Helper function to determine if navbar should be shown
function shouldShowNavbar(pathname, isLogin) {
  const publicPaths = ['/', '/login', '/signup', '/prelogin'];
  return isLogin && !publicPaths.includes(pathname);
}

function MainApp() {
  const { isLogin, activeUser, setIsLogin, setActiveUser } = useAuth();
  const location = useLocation();

  return (
    <div className="bg-[url('/background.jpg')] min-h-screen bg-cover bg-no-repeat">
      {/* Only show navbar for authenticated users on protected routes */}
      {shouldShowNavbar(location.pathname, isLogin) && (
        <Navbar
          setIsLogin={setIsLogin}
          setActiveUser={setActiveUser}
          activeUser={activeUser}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <MotionWrapper>
                  <Landing setActiveUser={setActiveUser} setIsLogin={setIsLogin} />
                </MotionWrapper>
              </PublicRoute>
            }
          />

          {/* Auth Routes - Redirect to dashboard if logged in */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <MotionWrapper>
                  <Login setIsLogin={setIsLogin} setActiveUser={setActiveUser} />
                </MotionWrapper>
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <MotionWrapper>
                  <Signup />
                </MotionWrapper>
              </AuthRoute>
            }
          />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MotionWrapper>
                  <MarginTop>
                    <Dashboard activeUser={activeUser} isLogin={isLogin} />
                  </MarginTop>
                </MotionWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookdetails/:id"
            element={
              <ProtectedRoute>
                <MotionWrapper>
                  <MarginTop>
                    <BookDetails activeUser={activeUser} isLogin={isLogin} />
                  </MarginTop>
                </MotionWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <MotionWrapper>
                  <MarginTop>
                    <SearchPage activeUser={activeUser} isLogin={isLogin} />
                  </MarginTop>
                </MotionWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <MotionWrapper>
                  <MarginTop>
                    <Collection activeUser={activeUser} isLogin={isLogin} />
                  </MarginTop>
                </MotionWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MotionWrapper>
                  <MarginTop>
                    <Profile activeUser={activeUser} setActiveUser={setActiveUser} />
                  </MarginTop>
                </MotionWrapper>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/uploadPDF"
            element={
              <ProtectedRoute>
                <MotionWrapper>
                  <UploadPDF />
                </MotionWrapper>
              </ProtectedRoute>
            }
          /> */}

          {/* Legacy route - can be removed */}
          <Route
            path="/prelogin"
            element={
              <MotionWrapper>
                <App
                  activeUser={activeUser}
                  setIsLogin={setIsLogin}
                  setActiveUser={setActiveUser}
                  isLogin={isLogin}
                />
              </MotionWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <MainApp />
      </AuthProvider>
    </Router>
  );
}