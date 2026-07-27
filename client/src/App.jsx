import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ThemedToaster = () => {
    const { theme } = useTheme();

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: theme === "dark" ? "#1e293b" : "#ffffff",
                    color: theme === "dark" ? "#f8fafc" : "#111827",
                    border: theme === "dark" ? "1px solid rgba(148,163,184,0.2)" : "1px solid rgba(15,23,42,0.08)",
                    borderRadius: "14px",
                    boxShadow: theme === "dark" ? "0 12px 32px rgba(0,0,0,0.35)" : "0 12px 32px rgba(15,23,42,0.1)",
                    padding: "12px 16px",
                    fontSize: "14px",
                },
                success: {
                    iconTheme: {
                        primary: "#34d399",
                        secondary: theme === "dark" ? "#1e293b" : "#ffffff",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#f87171",
                        secondary: theme === "dark" ? "#1e293b" : "#ffffff",
                    },
                },
            }}
        />
    );
};

const App = () => {
    const { authUser } = useContext(AuthContext);

    return (
        <div className="app-theme">
            <ThemedToaster />
            <Routes>
                <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
        </div>
    );
};

export default App;
