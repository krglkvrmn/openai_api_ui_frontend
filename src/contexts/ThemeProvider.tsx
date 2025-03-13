import React from "react";
import {useLocalStorage} from "../hooks/useLocalStorage.ts";


type ThemeType = "theme-light" | "theme-dark";
type ToggleThemeType = () => void;
type ThemeContextValue = {
    theme: ThemeType,
    toggleTheme: ToggleThemeType
} | null;

export const ThemeContext = React.createContext<ThemeContextValue>(null);

export function ThemeProvider({ children }: {children: React.ReactNode}) {
    const [theme, setTheme] = useLocalStorage<ThemeType>('__chat_app_theme', 'theme-light');

    const toggleTheme = () => {
        if (theme === "theme-light") {
            setTheme("theme-dark");
        } else if (theme === "theme-dark") {
            setTheme("theme-light");
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div id="theme-wrapper" className={theme}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}