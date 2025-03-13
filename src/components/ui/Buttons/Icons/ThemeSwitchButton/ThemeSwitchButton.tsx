import styles from "./style.module.css";
import {IconButton} from "../IconButton/IconButton.tsx";
import {IoMdMoon} from "react-icons/io";
import {MdSunny} from "react-icons/md";
import {useTheme} from "../../../../../hooks/contextHooks.ts";

export function ThemeSwitchButton() {
    const {theme, toggleTheme} = useTheme();
    return (
        <div className={styles.themeSwitchButtonContainer}
             data-tooltip="Switch theme"
             data-tooltip-direction="right" >
            <IconButton Icon={theme === "theme-light" ? MdSunny : IoMdMoon} onClick={toggleTheme} />
        </div>
    );
}

export function FloatingThemeSwitchButton() {
    return (
        <div className={styles.floatingThemeSwitchButtonContainer}>
            <ThemeSwitchButton />
        </div>
    )
}