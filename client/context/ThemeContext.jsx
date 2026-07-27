import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "quickchat-theme";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === "undefined") return "dark";
        return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    });

    const setTheme = useCallback((next) => {
        setThemeState(next);
        localStorage.setItem(STORAGE_KEY, next);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [setTheme, theme]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
};
