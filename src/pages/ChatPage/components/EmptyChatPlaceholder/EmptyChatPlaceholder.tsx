import styles from "./style.module.css";
import {useState} from "react";
import {lazyLoad} from "../../../../utils/lazyLoading.ts";
import {ComponentLoadSuspense} from "../../../../components/hoc/ComponentLoadSuspense.tsx";

const ChatTutorial = lazyLoad(import('../ChatTutorial/ChatTutorial.tsx'), 'ChatTutorial');

export function EmptyChatPlaceholder() {
    const [showTutorial, setShowTutorial] = useState<boolean>(false);
    return (
        <div className={styles.emptyChatPlaceholder}>
            {
                showTutorial ?
                    <ComponentLoadSuspense width="100%" height="100%">
                        <ChatTutorial/>
                    </ComponentLoadSuspense> :
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
