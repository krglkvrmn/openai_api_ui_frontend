import ChatsManager from "../control/ChatsManager/ChatsManager.tsx";
import {useAuth} from "../../hooks/contextHooks";
import {ChatController} from "./ChatController/ChatController.tsx";
import {ActiveChatIndexProvider} from "../../contexts/ActiveChatIndexProvider";
import styles from "./style.module.css";
import {Sidebar} from "../ui/Layout/Sidebar/Sidebar.tsx";
import {LogoutButton} from "../ui/Buttons/LogoutButton.tsx";
import {Link} from "react-router-dom";
import {SystemPromptProvider} from "../../contexts/SystemPromptProvider.tsx";
import PromptLibrary from "../control/PromptLibrary/PromptLibrary.tsx";


export default function ChatApp() {
    const {authState, authDispatchers} = useAuth();
    const {logOut} = authDispatchers;

    return (
        <div className={styles.chatAppWrapper}>
            <ActiveChatIndexProvider>
                <SystemPromptProvider>
                    <>
                        <Sidebar side="left">
                            <ChatsManager />

                            <div className={styles.authSection}>
                                <>
                                    <p>
                                        {"You are logged in as "}
                                        { authState ? <Link to="/profile">{authState?.user?.username}</Link> : authState }
                                    </p>
                                    <LogoutButton onClick={logOut} />
                                </>
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
        </div>
    )
}
