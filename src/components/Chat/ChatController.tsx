import Chat from "./Chat";
import { SystemPrompt, UserPrompt } from "../control/Prompt";
import ChatHistory from "../control/ChatHistrory";
import { useChats } from "./useChats";
import ControlSidebar from "../layout/ControlSidebar";
import PromptFooter from "../layout/PromptFooter";
import ModelSelector from "../control/ModelSelector";
import PromptSelectionSidebar from "../layout/PromptSelectionSidebar";
import PromptSelector from "../control/PromptSelector";
import { useSignalState } from "../../hooks/useSignalState";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signal } from "@preact/signals-react";


export default function ChatController() {
    const navigate = useNavigate();
    const { isAuthenticated, authState, authDispatchers } = useAuth();
    const { logOut } = authDispatchers;
    const [systemPromptValue, setSystemPromptValue] = useSignalState<string>("");
    const { activeChat, chats, isChatsLoading, isChatsError, isChatsSuccess, dispatchers } = useChats();
    const { activateChat, deleteChat, renameChat  } = dispatchers;


    console.log("ChatController render with following chats:", chats);
    console.log("Active chat:", activeChat);
    return (
        <div id="chat-controller">
            <ControlSidebar>
                {
                    isChatsLoading ? <p>"Loading chats..."</p> :
                    isChatsError ? "An error occured while loading chats" :
                    isChatsSuccess && chats !== undefined ?
                        <ChatHistory chats={chats}
                                     chatActivationHandler={activateChat}
                                     chatDeleteHandler={deleteChat}
                                     chatRenameHandler={renameChat}/> : null
                }
                
                <div>
                    {!isAuthenticated ?
                        <Link to="/login"><button>Log In</button></Link> :
                        <>
                            <p>{`You are already logged in as ${authState ? authState?.user?.email : authState}`}</p>
                            <button onClick={logOut}>Log out</button>
                        </>
                    }
                </div>
            </ControlSidebar>
            <div id="chat-content">
                {/*
                {activeChat.messages.length === 0 && 
                <SystemPrompt promptValue={systemPromptValue}
                              promptValueChangeHandler={setSystemPromptValue}
                submitHandler={prompt => addMessage('system', prompt)}/>}*/}
                <Chat chat={activeChat}/>
                {/* <PromptFooter>
                    <UserPrompt submitHandler={prompt => addMessage('user', prompt)}/>
                </PromptFooter> */}
            </div>
            <PromptSelectionSidebar>
                <PromptSelector promptSelectionCallback={setSystemPromptValue}/>
            </PromptSelectionSidebar>
        </div>
    )
}
