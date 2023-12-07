import { funcClosureOrUndefined  } from "../../utils/functional";
import { ChatType, ChatIdCallbackType, ChatIdNameCallbackType, ChatOverviewType } from "../../types";
import { useRef, useState } from "react";
import { resetSelections, selectElementContent } from "../../utils/elements";


type ChatHistoryProps = {
    chats: ChatOverviewType[]
    chatActivationHandler?: ChatIdCallbackType,
    chatDeleteHandler?: ChatIdCallbackType,
    chatRenameHandler?: ChatIdNameCallbackType,
}

type ChatHistoryRecordProps = {
    title: string,
    chatActivationHandler?: () => void,
    chatDeleteHandler?: () => void,
    chatRenameHandler?: (name: string) => void
}

type TuseEditableContentRefReturn = [boolean, React.RefObject<HTMLElement>, () => void, () => void];


export default function ChatHistory(
    { chats, chatActivationHandler, chatDeleteHandler, chatRenameHandler }: ChatHistoryProps
) {

    return (
        <div id="chat-history-sidebar-container">
            <button id="new-chat-button"
                    onClick={funcClosureOrUndefined(chatActivationHandler, null)}>New chat</button>
            {chats.map((chat, index) => {
                    return (
                        <ChatHistoryRecord key={index}
                                           title={chat.title}
                                           chatActivationHandler={funcClosureOrUndefined(chatActivationHandler, index)}
                                           chatDeleteHandler={funcClosureOrUndefined(chatDeleteHandler, index)}
                                           chatRenameHandler={chatRenameHandler === undefined ? undefined : 
                                                              (name: string) => chatRenameHandler({chat_id: index, name: name})}/>
                    );
                }
            )}
        </div>
    )
}

function ChatHistoryRecord(
    { title, chatActivationHandler, chatDeleteHandler, chatRenameHandler }: ChatHistoryRecordProps
) {
    const [isEditing, contentRef, onEditStart, onEditEnd] = useEditableContentRef(chatRenameHandler);
    return (
        <div className="chat-history-record-container">
            <b className="chat-history-record-title"
               ref={contentRef}
               onClick={funcClosureOrUndefined(chatActivationHandler)}
               onBlur={(e) => {if (isEditing && e.relatedTarget?.className !== 'save-chat-button') {onEditEnd()} }}
               onKeyDown={(e) => {if (isEditing && e.key === 'Enter') onEditEnd()}}>{title}</b>
            <div className="chat-history-record-controls">
                {!isEditing ? 
                    <button className="rename-chat-button"
                            onClick={onEditStart}>Rename</button>
                :
                    <button className="save-chat-button"
                            onClick={onEditEnd}>Save</button>
                }
                <button className="delete-chat-button"
                        onClick={funcClosureOrUndefined(chatDeleteHandler)}>Delete</button>
            </div>
        </div>
    )
}

function useEditableContentRef(editedValueCallback?: (value: string) => void): TuseEditableContentRefReturn {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const contentRef = useRef<HTMLElement>(null);

    function onEditStart() {
        if (contentRef.current === null) return;
        contentRef.current.contentEditable = "true";
        contentRef.current.focus();
        selectElementContent(contentRef.current);
        setIsEditing(true);
    }

    function onEditEnd() {
        if (contentRef.current === null) return;
        contentRef.current.contentEditable = "false";
        contentRef.current.blur();
        resetSelections();
        editedValueCallback !== undefined && editedValueCallback(contentRef.current.innerText);
        setIsEditing(false);
    }

    return [isEditing, contentRef, onEditStart, onEditEnd];
}

