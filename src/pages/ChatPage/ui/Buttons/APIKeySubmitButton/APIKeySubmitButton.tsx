import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {MdKey} from "react-icons/md";

export function APIKeySubmitButton() {
    return (
        <div className={styles.apiKeySubmitButtonContainer}
             data-tooltip="Save an API key to your account"
             data-tooltip-direction="bottom">
            <IconButton Icon={MdKey}/>
        </div>
    );
}