import {useAuth} from "../../hooks/contextHooks.ts";
import {ActiveChatIndexProvider} from "./contexts/ActiveChatIndexProvider.tsx";
import {Sidebar} from "../../components/layout/Sidebar/Sidebar.tsx";
import {SystemPromptProvider} from "./contexts/SystemPromptProvider.tsx";
import {useDialog} from "../../hooks/useDialog.ts";
import {AuthActionsPopupTriggerButton} from "./components/AuthActionsPopupButton/AuthActionsPopupTriggerButton.tsx";
import {CollapsableEdgeElement} from "../../components/ui/CollapsableEdgeElement/CollapsableEdgeElement.tsx";
import {useAPIKeys} from "../../hooks/useAPIKeys.ts";
import styles from "./style.module.css";
import {LocalAPIKeyProvider} from "./contexts/LocalAPIKeyProvider.tsx";
import {lazyLoad} from "../../utils/lazyLoading.ts";
import {Suspense} from "react";
import {ComponentLoadSuspense} from "../../components/hoc/ComponentLoadSuspense.tsx";
import {
    FloatingThemeSwitchButton,
    ThemeSwitchButton
} from "../../components/ui/Buttons/Icons/ThemeSwitchButton/ThemeSwitchButton.tsx";

const AccountSettingsModal = lazyLoad(import('./components/AccountSettings/AccountSettingsModal.tsx'), 'AccountSettingsModal');
const ChatsManager = lazyLoad(import('./components/ChatsManager/ChatsManager.tsx'), 'ChatsManager');
const LoginInfo = lazyLoad(import('./components/LoginInfo/LoginInfo.tsx'), 'LoginInfo');
const PromptsLibrary = lazyLoad(import('./components/PromptsLibrary/PromptsLibrary.tsx'), 'PromptsLibrary');
const APIKeyForm = lazyLoad(import('../../components/forms/ApiKeyForm/APIKeyForm.tsx'), 'APIKeyForm');
const Chat = lazyLoad(import('./components/Chat/Chat.tsx'), 'Chat');



export default function ChatApp() {
    const { authDispatchers } = useAuth();
    const { logOut } = authDispatchers;

    const { apiKeys, isEmpty: isApiKeysEmpty, isLoading: isApiKeysLoading, dispatchers } = useAPIKeys();
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
                                <ComponentLoadSuspense width="100%" height="100%">
                                    <ChatsManager/>
                                </ComponentLoadSuspense>
                                <div className={styles.loginInfoDividerContainer}>
                                    <hr/>
                                </div>
                                <div className={styles.mainSidebarAuthInfoControls}>
                                    <ComponentLoadSuspense width="100%" height="100%">
                                        <LoginInfo/>
                                    </ComponentLoadSuspense>
                                    <div>
                                        <AuthActionsPopupTriggerButton onAccountSettingsClick={openDialog}
                                                                       onLogoutClick={logOut}/>
                                        <ThemeSwitchButton />
                                    </div>
                                </div>
                            </Sidebar>
                            <FloatingThemeSwitchButton />
                            <main className={styles.chatContent}>
                            {
                                    !isSavedKeyExists && !isApiKeysLoading &&
                                    <CollapsableEdgeElement side="top">
                                        <div className={styles.chatApiKeyFormHeader}>
                                            <Suspense>
                                                <APIKeyForm keySaveHandler={saveApiKey}/>
                                            </Suspense>
                                        </div>
                                    </CollapsableEdgeElement>
                                }
                                <ComponentLoadSuspense width="100%" height="100%">
                                    <Chat/>
                                </ComponentLoadSuspense>
                            </main>
                            <Sidebar side="right">
                                <ComponentLoadSuspense width="100%" height="100%">
                                    <PromptsLibrary/>
                                </ComponentLoadSuspense>
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
