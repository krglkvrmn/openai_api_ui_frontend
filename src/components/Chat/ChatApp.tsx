import ChatsManager from "../control/ChatsManager";
import ControlSidebar from "../layout/ControlSidebar";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/contextHooks";
import { ChatController } from "./ChatController";
import { ActiveChatIndexProvider } from "../../contexts/ActiveChatIndexProvider";


export default function ChatApp() {
    const { isAuthenticated, authState, authDispatchers } = useAuth();
    const { logOut } = authDispatchers;

    return (
        <div id="chat-app">
            <ActiveChatIndexProvider>
                <>
                    <ControlSidebar>
                        <ChatsManager />
                        
                        <div>
                            {!isAuthenticated ?
                                <Link to="/login"><button>Log In</button></Link> :
                                <>
                                    <p>{`You are already logged in as ${authState ? authState?.user?.username : authState}`}</p>
                                    <button onClick={logOut}>Log out</button>
                                </>
                            }
                        </div>
                    </ControlSidebar>
                    <ChatController />
                </>
            </ActiveChatIndexProvider>
        </div>
    )
}
