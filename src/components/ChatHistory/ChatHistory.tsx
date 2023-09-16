import { KeyboardEvent, MouseEventHandler, useRef, useState } from "react";
import { SingleChatSchema } from "../ChatController/ChatController";
import "./style.css";
import { resetSelections, selectElementContent } from "../../utils/elements";

export default function ChatHistory(
    {chats, chatActivationHandler, deleteChatHandler, renameChatHandler}: 
    {chats: SingleChatSchema[], chatActivationHandler: CallableFunction, deleteChatHandler: CallableFunction, renameChatHandler: CallableFunction}
    ) {
    const chatEntries = chats.map((chat, chat_id) => {
        if (chat.messages.length > 0) {
            return <ChatHistoryEntry title={chat.title}
                                     chat_id={chat_id}
                                     onActivation={() => chatActivationHandler(chat_id)} key={chat_id}
                                     onDelete={() => deleteChatHandler(chat_id)}
                                     renameChatHandler={(name: string) => renameChatHandler(chat_id, name)}/>;
        }
    })
    return (
        <div id="chat-history-container">
            {chatEntries}
        </div>
    );
}


function ChatHistoryEntry(
    {title, chat_id, onActivation, onDelete, renameChatHandler}:
    {title: string, chat_id: number, onActivation: MouseEventHandler, onDelete: MouseEventHandler, renameChatHandler: CallableFunction}
    ) {
    
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const entryTitleRef = useRef<HTMLElement | null>(null);

    const renameButtonId = `chat-history-entry-${chat_id}-start-rename-button`;
    const saveButtonId = `chat-history-entry-${chat_id}-save-rename-button`;

    function toggleTitleEditing(action: string) {
        const entryTitleRefContent = entryTitleRef.current;
        if (entryTitleRefContent === null) {
            return;
        }
        if (!isEditable && action === "start") {
            entryTitleRefContent.contentEditable = "true";
            entryTitleRefContent.focus();
            selectElementContent(entryTitleRefContent);
        } else if (isEditable && action === "save") {
            entryTitleRefContent.contentEditable = "false";
            resetSelections();
            renameChatHandler(entryTitleRefContent.textContent);
        }
        setIsEditable(!isEditable);
    }

    const saveTitleOnEnterStroke = (e: KeyboardEvent) => {if (e.key === 'Enter') {toggleTitleEditing('save')}};
    const skip = () => {};

    return (
        <div className="chat-history-entry-container">
            <b className="chat-history-entry-title"
               ref={entryTitleRef}
               onClick={isEditable ? skip : onActivation}
               onKeyDown={isEditable ? saveTitleOnEnterStroke : skip}
               onBlur={isEditable ? (e) => {if (e.relatedTarget?.id !== saveButtonId) {toggleTitleEditing("save")}} : skip}>{title}</b>
            <div className="chat-history-entry-toolbar">
                {!isEditable ?
                    <button id={renameButtonId}
                            className="chat-history-entry-start-rename-button"
                            onClick={() => {toggleTitleEditing("start")}}>Rename</button>
                    :
                    <button id={saveButtonId}
                            className="chat-history-entry-save-rename-button"
                            onClick={() => {toggleTitleEditing("save")}}>Save</button>

                }
                <button className="chat-history-entry-delete-button"
                        onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
}