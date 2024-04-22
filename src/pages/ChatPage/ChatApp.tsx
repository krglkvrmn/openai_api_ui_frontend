import ChatsManager from "./components/ChatsManager/ChatsManager.tsx";
import {useAuth} from "../../hooks/contextHooks.ts";
import {ActiveChatIndexProvider} from "./contexts/ActiveChatIndexProvider.tsx";
import {Sidebar} from "../../components/layout/Sidebar/Sidebar.tsx";
import {SystemPromptProvider} from "./contexts/SystemPromptProvider.tsx";
import PromptsLibrary from "./components/PromptsLibrary/PromptsLibrary.tsx";
import {useDialog} from "../../hooks/useDialog.ts";
import {LoginInfo} from "./components/LoginInfo/LoginInfo.tsx";
import {AuthActionsPopupTriggerButton} from "./components/AuthActionsPopupButton/AuthActionsPopupTriggerButton.tsx";
import {CollapsableEdgeElement} from "../../components/ui/CollapsableEdgeElement/CollapsableEdgeElement.tsx";
import {APIKeyForm} from "../../components/forms/ApiKeyForm/APIKeyForm.tsx";
import Chat from "./components/Chat/Chat.tsx";
import {useAPIKeys} from "../../hooks/useAPIKeys.ts";
import styles from "./style.module.css";
import {LocalAPIKeyProvider} from "./contexts/LocalAPIKeyProvider.tsx";
import {lazyLoad} from "../../utils/lazyLoading.ts";
import {Suspense} from "react";

const AccountSettingsModal = lazyLoad(import('./components/AccountSettings/AccountSettingsModal.tsx'), 'AccountSettingsModal');

export default function ChatApp() {
    const { authDispatchers } = useAuth();
    const { logOut } = authDispatchers;

    const { apiKeys, isEmpty: isApiKeysEmpty, dispatchers } = useAPIKeys();
    const { saveApiKey } = dispatchers;

    const { dialogRef, openDialog, closeDialog } = useDialog("modal");
    const isSavedKeyExists = (apiKeys !== undefined && !isApiKeysEmpty);
    return (
        <div className={styles.chatAppWrapper}>
            <LocalAPIKeyProvider>
                <ActiveChatIndexProvider>
                    <SystemPromptProvider>
                        <>
                            <Sidebar isExpanded={window.innerWidth > 768} side="left">
                                <ChatsManager/>
                                <div className={styles.loginInfoDividerContainer}>
                                    <hr/>
                                </div>
                                <div className={styles.mainSidebarAuthInfoControls}>
                                    <LoginInfo/>
                                    <AuthActionsPopupTriggerButton onAccountSettingsClick={openDialog}
                                                                   onLogoutClick={logOut}/>
                                </div>
                            </Sidebar>
                            <main className={styles.chatContent}>
                            {
                                    !isSavedKeyExists &&
                                    <CollapsableEdgeElement side="top">
                                        <div className={styles.chatApiKeyFormHeader}>
                                            <APIKeyForm keySaveHandler={saveApiKey}/>
                                        </div>
                                    </CollapsableEdgeElement>
                                }
                                <Chat/>
                            </main>
                            <Sidebar side="right">
                                <PromptsLibrary/>
                            </Sidebar>
                            <Suspense>
                                <AccountSettingsModal dialogRef={dialogRef} closeDialog={closeDialog}/>
                            </Suspense>
                        </>
                    </SystemPromptProvider>
                </ActiveChatIndexProvider>
            </LocalAPIKeyProvider>
        </div>
    )
}
