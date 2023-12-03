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
    const {authState, authDispatchers} = useAuth();
    const {signOut} = authDispatchers;
    const [systemPromptValue, setSystemPromptValue] = useSignalState<string>("");
    const { chats, streamingMessage, activeChatId, chatsLoadingError, chatsLoadingComplete, dispatchers } = useChats();
    const {addMessage, activateChat, deleteChat, renameChat, switchModel} = dispatchers;

    const activeChat = chats[activeChatId];

    console.log("ChatController render with following chats:", chats);
    console.log(authState);
    return (
        <div id="chat-controller">
            <ControlSidebar>
                <ChatHistory chats={chats}
                             chatActivationHandler={activateChat}
                             chatDeleteHandler={deleteChat}
                             chatRenameHandler={renameChat}/>
                <div>
                    {!authState.isAuthenticated ?
                        <Link to="/login"><button>Log In</button></Link> :
                        <>
                            <p>{`You are already logged in as ${authState.user?.email}`}</p>
                            <button onClick={signOut}>Log out</button>
                        </>
                    }
                </div>
            </ControlSidebar>
            <div id="chat-content">
                <ModelSelector activeModel={activeChat.model}
                               modelSwitchHandler={switchModel}/>
                {activeChat.messages.length === 0 && 
                <SystemPrompt promptValue={systemPromptValue}
                              promptValueChangeHandler={setSystemPromptValue}
                              submitHandler={prompt => addMessage('system', prompt)}/>}
                <Chat messages={activeChat.messages} activeMessage={streamingMessage}/>
                <PromptFooter>
                    <UserPrompt submitHandler={prompt => addMessage('user', prompt)}/>
                </PromptFooter>
            </div>
            <PromptSelectionSidebar>
                <PromptSelector promptSelectionCallback={setSystemPromptValue}/>
            </PromptSelectionSidebar>
        </div>
    )
}
