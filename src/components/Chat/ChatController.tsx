import Chat from "./Chat";
import { ChatType } from "../../types";
import { SystemPrompt, UserPrompt } from "../control/Prompt";
import ChatHistory from "../control/ChatHistrory";
import { useChats } from "./useChats";
import ControlSidebar from "../layout/ControlSidebar";
import PromptFooter from "../layout/PromptFooter";


export const CHATS_ACTIONS = {
    SET_CHATS: "set-chats",
    CREATE_CHAT: "create-chat",
    UPDATE_CHAT: "update-chat",
    RENAME_CHAT: "rename-chat",
    DELETE_CHAT: "delete-chat"
}

export function createDefaultChat(): ChatType {
    return {
        model: "gpt-3.5-turbo",
        title: "New chat",
        messages: [],
        created_at: null,
        last_updated: null

    };
}


export default function ChatController() {
    const { chats, activeChatId, chatsLoadingError, chatsLoadingComplete, dispatchers } = useChats();
    const {addMessage, activateChat, deleteChat, renameChat} = dispatchers;

    const activeChat = chats[activeChatId];

    console.log("ChatController render", chats);
    return (
        <div id="chat-controller">
            <ControlSidebar>
                <ChatHistory chats={chats}
                             chatActivationHandler={activateChat}
                             chatDeleteHandler={deleteChat}/>
            </ControlSidebar>
            <div id="chat-content">
                {activeChat.messages.length === 0 && 
                <SystemPrompt submitHandler={prompt => addMessage('system', prompt)}/>}
                <Chat messages={activeChat.messages}/>
                <PromptFooter>
                    <UserPrompt submitHandler={prompt => addMessage('user', prompt)}/>
                </PromptFooter>
            </div>
        </div>
    )
}
