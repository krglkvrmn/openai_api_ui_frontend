import ChatsManager from "../control/ChatsManager/ChatsManager.tsx";
import {useAuth} from "../../hooks/contextHooks";
import {ChatController} from "./ChatController/ChatController.tsx";
import {ActiveChatIndexProvider} from "../../contexts/ActiveChatIndexProvider";
import styles from "./style.module.css";
import {Sidebar} from "../ui/Layout/Sidebar/Sidebar.tsx";
import {SystemPromptProvider} from "../../contexts/SystemPromptProvider.tsx";
import PromptLibrary from "../control/PromptLibrary/PromptLibrary.tsx";
import {useDialog} from "../../hooks/useDialog.ts";
import {LoginInfo} from "../profile/LoginInfo/LoginInfo.tsx";
import {AccountSettingsModal} from "../profile/AccountSettingsModal/AccountSettingsModal.tsx";
import {AuthActionsPopupTriggerButton} from "../profile/AuthActionsPopupButton/AuthActionsPopupTriggerButton.tsx";

export default function ChatApp() {
    const { authDispatchers } = useAuth();
    const { logOut } = authDispatchers;
    const { dialogRef, openDialog, closeDialog } = useDialog("modal");
    return (
        <div className={styles.chatAppWrapper}>
            <ActiveChatIndexProvider>
                <SystemPromptProvider>
                    <>
                        <Sidebar side="left">
                            <ChatsManager />

                            <div className={styles.mainSidebarAuthInfoControls}>
                                <LoginInfo />
                                <AuthActionsPopupTriggerButton onAccountSettingsClick={openDialog} onLogoutClick={logOut} />
                            </div>
                        </Sidebar>
                        <div className={styles.chatMainContent}>
                            <ChatController />
                        </div>
                        <Sidebar side="right" >
                            <PromptLibrary />
                        </Sidebar>
                    </>
                </SystemPromptProvider>
            </ActiveChatIndexProvider>
            <AccountSettingsModal dialogRef={dialogRef} closeDialog={closeDialog} />
        </div>
    )
}
