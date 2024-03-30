import {funcClosureOrUndefined} from "../../../utils/functional.ts";
import React, {useRef, useState} from "react";
import {resetSelections, selectElementContent} from "../../../utils/elements.ts";
import {useMutation, useQuery} from "react-query";
import {deleteChatRequest, getAllChatsRequest, updateChatRequest} from "../../../services/backendAPI.ts";
import {optimisticQueryUpdateConstructor} from "../../../utils/optimisticUpdates.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useActiveChatIndex} from "../../../hooks/contextHooks.ts";
import {ChatInfoRead} from "../../../types/dataTypes.ts";
import {parseChatId} from "../../../utils/stringparsers.ts";
import styles from "./style.module.css";
import {DeleteButton} from "../../ui/Buttons/DeleteButton.tsx";
import {ConfirmButton} from "../../ui/Buttons/ConfirmButton.tsx";
import {EditButton} from "../../ui/Buttons/EditButton.tsx";
import {AddButton} from "../../ui/Buttons/AddButton.tsx";


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
    chats: ChatInfoRead[] | undefined,
    isChatsLoading: boolean,
    isChatsError: boolean,
    isChatsSuccess: boolean,
    dispatchers: TuseChatsDispatchers;

};


function useChats(): TuseChatsReturn {
    const queryParams = useParams();
    const navigate = useNavigate();
    const { data, isSuccess, isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: async () => {
            return await getAllChatsRequest();
        },
        placeholderData: []
    });
    const [defaultActiveChatIndex, setActiveChatIndex] = useActiveChatIndex();
    let activeChatIndex: number | null = defaultActiveChatIndex;
    if (data !== undefined && defaultActiveChatIndex === null) {
        activeChatIndex = data.findIndex((chat) => chat.id === parseChatId(queryParams.chatId));
        activeChatIndex = activeChatIndex === -1 ? null : activeChatIndex;
    }

    async function deleteChat(chatIndex: number): Promise<void> {
        if (isSuccess) {
            await deleteChatRequest(data[chatIndex].id);
        }
    }
    async function renameChat({chatIndex, name}: {chatIndex: number, name: string}): Promise<void> {
        if (isSuccess) {
            await updateChatRequest({...data[chatIndex], title: name});
        }
    }
    function activateChat(chatIndex: number | null): void {
        setActiveChatIndex(chatIndex);
        if (chatIndex === null) {
            navigate('/chat/new')
        } else if (isSuccess) {
            navigate(`/chat/${data[chatIndex].id}`)
        }
    }

    const deleteChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (chatIndex: number, prevChats: ChatInfoRead[] | undefined) => {
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
                setActiveChatIndex(prevActiveChatIndex === null ? null : prevActiveChatIndex - 1);
            }
            return prevActiveChatIndex;

        },
        sideEffectsRecover: (prevActiveChatIndex) => {
            prevActiveChatIndex !== undefined && activateChat(prevActiveChatIndex);
        }
    });
    const renameChatOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['chats'],
        stateUpdate: (mutateData: {chatIndex: number, name: string}, prevChats: ChatInfoRead[] | undefined) => {
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

export default function ChatsManager() {
    const { chats, isChatsLoading, isChatsSuccess, isChatsError, dispatchers } = useChats();
    const { activateChat, deleteChat, renameChat } = dispatchers;
    return (
        <div className={styles.chatHistoryContainer}>
            <div className={styles.controlButtonsContainer}>
                <AddButton onClick={() => activateChat(null)} />
            </div>
            <div className={styles.chatHistoryRecordsContainer}>
                {
                    isChatsLoading ? <p>"Loading chats..."</p> :
                    isChatsError ? "An error occurred while loading chats" :
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
        </div>
    )
}

function ChatHistoryRecord(
    { title, chatActivationHandler, chatDeleteHandler, chatRenameHandler }: ChatHistoryRecordPropsType
) {
    const [isEditing, contentRef, onEditStart, onEditEnd] = useEditableContentRef(chatRenameHandler);
    return (
        <div className={styles.chatHistoryRecordContainer}>
            <div className={styles.chatHistoryRecordTitleContainer}
                 onClick={funcClosureOrUndefined(chatActivationHandler)}>
                <b className={styles.chatHistoryRecordTitle}
                   ref={contentRef}
                   onBlur={(e) => {
                       if (isEditing && e.relatedTarget?.className !== 'save-chat-button') {
                           onEditEnd()
                       }
                   }}
                   onKeyDown={(e) => {
                       if (isEditing && e.key === 'Enter') onEditEnd()
                   }}>{title}</b>
            </div>
            <div className={styles.chatHistoryRecordControlsContainer}>
                {!isEditing ?
                    <EditButton onClick={onEditStart}/> :
                    <ConfirmButton onClick={onEditEnd}/>
                }
                <DeleteButton onClick={funcClosureOrUndefined(chatDeleteHandler)} mode="light" />
            </div>
        </div>
    )
}



