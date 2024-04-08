import {IconButton} from "./IconButton.tsx";
import styles from "./style.module.css";
import {MdKey} from "react-icons/md";

export function APIKeySubmitButton() {
    return (
        <div className={styles.apiKeySubmitButtonContainer} title="Save an API key to your account">
            <IconButton Icon={MdKey} mode="dark"/>
        </div>
    );
}