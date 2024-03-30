import {APIKeyForm} from "../../forms/ApiKeyForm/APIKeyForm.tsx";
import {useAPIKeys} from "../../../hooks/useAPIKeys.ts";
import Chat from "../Chat.tsx";
import styles from "./style.module.css";
import {CollapsableEdgeElement} from "../../ui/Layout/CollapsableEdgeElement/CollapsableEdgeElement.tsx";


export function ChatController() {
    const { apiKeys, isEmpty: isApiKeysEmpty, dispatchers } = useAPIKeys();
    const { saveApiKey } = dispatchers;
    const isSavedKeyExists = (apiKeys !== undefined && !isApiKeysEmpty);
    return (
        <div className={styles.chatController} >
            <div className={styles.chatContent}>
                <CollapsableEdgeElement side="top">
                    {
                        !isSavedKeyExists &&
                            <div className={styles.chatApiKeyFormHeader}>
                                <APIKeyForm keySaveHandler={saveApiKey} />
                            </div>
                    }
                </CollapsableEdgeElement>
                <Chat />
            </div>
        </div>
    );
}