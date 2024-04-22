import styles from "./style.module.css";
import {ChatTutorial} from "../ChatTutorial/ChatTutorial.tsx";
import {useState} from "react";

export function EmptyChatPlaceholder() {
    const [showTutorial, setShowTutorial] = useState<boolean>(false);
    return (
        <div className={styles.emptyChatPlaceholder}>
            {
                showTutorial ?
                    <ChatTutorial/> :
                    <>
                        <h2>Have a nice chat!</h2>
                        <span className={styles.needHelpButton}
                              onClick={() => setShowTutorial(prev => !prev)}>
                            Need help?
                        </span>
                    </>
            }
        </div>
    );
}
