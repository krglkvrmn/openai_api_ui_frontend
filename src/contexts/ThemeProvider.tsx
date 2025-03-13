import React, {useEffect} from "react";
import {useLocalStorage} from "../hooks/useLocalStorage.ts";


type ThemeType = "theme-light" | "theme-dark";
type ToggleThemeType = () => void;
type ThemeContextValue = {
    theme: ThemeType,
    toggleTheme: ToggleThemeType
} | null;

export const ThemeContext = React.createContext<ThemeContextValue>(null);

export function ThemeProvider({ children }: {children: React.ReactNode}) {
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light';
    const [theme, setTheme] = useLocalStorage<ThemeType>('__chat_app_theme', preferredTheme);

    const toggleTheme = () => {
        if (theme === "theme-light") {
            setTheme("theme-dark");
        } else if (theme === "theme-dark") {
            setTheme("theme-light");
        }
    }

    useEffect(() => {
        if (theme === "theme-dark") {
            document.documentElement.setAttribute("data-theme", "theme-dark");
        } else if (theme === "theme-light") {
            document.documentElement.setAttribute("data-theme", "theme-light");
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}