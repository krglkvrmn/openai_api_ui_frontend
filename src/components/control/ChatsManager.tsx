import { funcClosureOrUndefined  } from "../../utils/functional";
import { ChatOverviewType, ChatsStateType } from "../../types";
import { useEffect, useRef, useState } from "react";
import { resetSelections, selectElementContent } from "../../utils/elements";
import { useMutation, useQuery } from "react-query";
import { deleteChatRequest, getAllChatsOverviewRequest, updateChatRequest } from "../../services/backend_api";
import { optimisticQueryUpdateConstructor } from "../../utils/optimisticUpdates";
import { useNavigate } from "react-router-dom";
import { useActiveChatIndex } from "../../hooks/contextHooks";

export type ChatIndexType = number | null;


type ChatHistoryRecordPropsType = {
    title: string,
    chatActivationHandler?: () => void,
    chatDeleteHandler?: () => void,
    chatRenameHandler?: (name: string) => void
}

type TuseEditableContentRefReturn = [boolean, React.RefObject<HTMLElement>, () => void, () => void];


export type TuseChatsDispatchers = {
    activateChat: (chatIndex: number | null) => void,
    deleteChat: (chatIndex: number) => void,
    renameChat: ({chatIndex, name}: {chatIndex: number, name: string}) => void,
};

export type TuseChatsReturn = {
    chats: ChatOverviewType[] | undefined,
    isChatsLoading: boolean,
    isChatsError: boolean,
    isChatsSuccess: boolean,
    dispatchers: TuseChatsDispatchers;

};


export function useChats(): TuseChatsReturn {
    const navigate = useNavigate();
    const [activeChatIndex, setActiveChatIndex] = useActiveChatIndex();
    const { data, isSuccess, isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => await getAllChatsOverviewRequest() as ChatOverviewType[],
        placeholderData: []
    });

    async function deleteChat(chatIndex: number) {
        if (isSuccess) {
            await deleteChatRequest(data[chatIndex].id);
        }
    }
    async function renameChat({chatIndex, name}: {chatIndex: number, name: string}) {
        if (isSuccess) {
            await updateChatRequest({...data[chatIndex], title: name});
        }
    }
    function activateChat(chatIndex: number | null) {
        setActiveChatIndex(chatIndex);
        if (chatIndex === null) {
            navigate('/chat/new')
        } else if (isSuccess) {
            navigate(`/chat/${data[chatIndex].id}`)
        }
    }

    const deleteChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (chatIndex: number, prevChats: ChatsStateType) => {
            if (prevChats !== undefined) {
                const chatsCopy = prevChats.slice();
                chatsCopy.splice(chatIndex, 1);
                return chatsCopy;
            }
            return [];
        },
        sideEffectsUpdate: (chatIndex: number) => {
            const prevActiveChatIndex = activeChatIndex;
            if (activeChatIndex === chatIndex) {
                activateChat(null);
            } else if (activeChatIndex !== null && chatIndex < activeChatIndex) {
                activateChat(prevActiveChatIndex === null ? null : prevActiveChatIndex - 1);
            }
            return prevActiveChatIndex;

        },
        sideEffectsRecover: (prevActiveChatIndex) => {
            prevActiveChatIndex !== undefined && activateChat(prevActiveChatIndex);
        }
    });
    const renameChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: {chatIndex: number, name: string}, prevChats: ChatsStateType) => {
            if (prevChats !== undefined) {
                const chatsCopy = prevChats.slice();
                chatsCopy[mutateData.chatIndex] = {...chatsCopy[mutateData.chatIndex], title: mutateData.name};
                return chatsCopy;
            }
            return [];

        }
    })
    
    const deleteChatMutation = useMutation({
        mutationFn: deleteChat,
        onMutate: deleteChatOptimisticConfig.onMutate,
        onError: deleteChatOptimisticConfig.onError,
        onSettled: deleteChatOptimisticConfig.onSettled,
    });

    const renameChatMutation = useMutation({
        mutationFn: renameChat,
        onMutate: renameChatOptimisticConfig.onMutate,
        onError: renameChatOptimisticConfig.onError,
        onSettled: renameChatOptimisticConfig.onSettled
    });

    return {
        chats: data,
        isChatsLoading: isLoading,
        isChatsError: isError,
        isChatsSuccess: isSuccess,
        dispatchers: {
            activateChat: activateChat,
            deleteChat: deleteChatMutation.mutate,
            renameChat: renameChatMutation.mutate,
        }
    };
}


export default function ChatsManager() {
    const { chats, isChatsLoading, isChatsSuccess, isChatsError, dispatchers } = useChats();
    const { activateChat, deleteChat, renameChat } = dispatchers;
    return (
        <div id="chat-history-sidebar-container">
            <button id="new-chat-button"
                    onClick={() => activateChat(null)}>New chat</button>
            
            {
                isChatsLoading ? <p>"Loading chats..."</p> :
                isChatsError ? "An error occured while loading chats" :
                isChatsSuccess && chats !== undefined ?
                chats.map((chat, index) => {
                    return (
                        <ChatHistoryRecord key={index}
                                           title={chat.title}
                                           chatActivationHandler={() => activateChat(index)}
                                           chatDeleteHandler={() => deleteChat(index)}
                                           chatRenameHandler={ (name: string) => {
                                                renameChat({chatIndex: index, name: name})
                                           }}/>
                    );
                }) : null
            }
            
            
        </div>
    )
}

function ChatHistoryRecord(
    { title, chatActivationHandler, chatDeleteHandler, chatRenameHandler }: ChatHistoryRecordPropsType
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

