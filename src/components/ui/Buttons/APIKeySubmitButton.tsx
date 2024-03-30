import {IconButton} from "./IconButton.tsx";
import {FaKey} from "react-icons/fa";
import styles from "./style.module.css";

export function APIKeySubmitButton() {
    return (
        <div className={styles.apiKeySubmitButtonContainer}>
            <IconButton Icon={FaKey} mode="dark"/>
        </div>
    );
}