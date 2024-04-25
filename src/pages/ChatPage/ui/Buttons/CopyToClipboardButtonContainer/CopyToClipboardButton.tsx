import {useState} from "react";
import {IoIosCopy, IoMdCheckmarkCircleOutline} from "react-icons/io";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {devConsole} from "../../../../../utils/devConsole.ts";

export function CopyToClipboardButton({text}: { text: string }) {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        } catch (error) {
            devConsole.error("An error occurred while copying text to clipboard:", error);
        }
    }

    return (
        <div className={styles.copyToClipboardButtonContainer}>
            {
                isCopied ?
                    <div className={styles.successfulCopyContainer}>
                        <IoMdCheckmarkCircleOutline/><span>Copied!</span>
                    </div> :
                    <IconButton Icon={IoIosCopy} onClick={copyToClipboard}/>
            }
        </div>
    );
}