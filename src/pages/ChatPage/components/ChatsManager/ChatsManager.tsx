import {funcClosureOrUndefined} from "../../../../utils/functional.ts";
import React, {useRef, useState} from "react";
import {resetSelections, selectElementContent} from "../../../../utils/selection.ts";
import {useMutation, useQuery} from "react-query";
import {deleteChatRequest, getAllChatsRequest, updateChatRequest} from "../../../../services/backendAPI.ts";
import {optimisticQueryUpdateConstructor} from "../../../../utils/optimisticUpdates.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useActiveChatIndex, useCollapsableEdgeElement} from "../../../../hooks/contextHooks.ts";
import {ChatInfoRead} from "../../../../types/dataTypes.ts";
import {parseChatId} from "../../../../utils/stringparsers.ts";
import styles from "./style.module.css";
import {DeleteButton} from "../../../../components/ui/Buttons/Icons/DeleteButton/DeleteButton.tsx";
import {ConfirmButton} from "../../../../components/ui/Buttons/Icons/ConfirmButton/ConfirmButton.tsx";
import {EditButton} from "../../../../components/ui/Buttons/Icons/EditButton/EditButton.tsx";
import {NewChatButton} from "../../ui/Buttons/NewChatButton/NewChatButton.tsx";
import {ElementOrLoader} from "../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {LoadingError} from "../../../../components/ui/InfoDisplay/Errors/Errors.tsx";


type ChatHistoryRecordPropsType = {
    title: string,
    isActive: boolean,
    chatActivationHandler?: () => void,
    chatDeleteHandler?: () => void,
    chatRenameHandler?: (name: string) => void
}

type TuseEditableContentRefReturn = [boolean, React.RefObject<HTMLElement>, () => void, () => void];


export type TuseChatsDispatchers = {
    reloadChats: () => void,
    activateChat: (chatIndex: number | null) => void,
    deleteChat: (chatIndex: number) => void,
    renameChat: ({chatIndex, name}: {chatIndex: number, name: string}) => void,
};

export type TuseChatsReturn = {
    chats: ChatInfoRead[] | undefined,
    activeChatIndex: number | null,
    isChatsLoading: boolean,
    isChatsError: boolean,
    isChatsSuccess: boolean,
    dispatchers: TuseChatsDispatchers;

};


function useChats(): TuseChatsReturn {
    const setIsHidden = useCollapsableEdgeElement()[1];
    const queryParams = useParams();
    const navigate = useNavigate();
    const { data, isSuccess, isLoading, isError, refetch } = useQuery({
        queryKey: ['chats'],
        queryFn: getAllChatsRequest
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
            navigate('/chat/new');
        } else if (isSuccess) {
            navigate(`/chat/${data[chatIndex].id}`);
        }
        window.innerWidth < 768 && setIsHidden(true);   // Close sidebar if mobile version
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
        activeChatIndex: activeChatIndex,
        isChatsLoading: isLoading,
        isChatsError: isError,
        isChatsSuccess: isSuccess,
        dispatchers: {
            reloadChats: refetch,
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
    const { chats, activeChatIndex, isChatsLoading, isChatsSuccess, isChatsError, dispatchers } = useChats();
    const { activateChat, deleteChat, renameChat, reloadChats } = dispatchers;
    return (
        <div className={styles.chatHistoryContainer}>
            <div className={styles.controlButtonsContainer}>
                <NewChatButton onClick={() => activateChat(null)} />
            </div>
            <div className={styles.controlsDividerContainer}>
                <hr/>
            </div>
            <ElementOrLoader isLoading={isChatsLoading}>
                <nav className={styles.chatHistoryRecordsContainer}>
                    {
                        isChatsError ?
                            <LoadingError errorText="An error occurred while loading chats" reloadAction={reloadChats} /> :
                            isChatsSuccess && chats !== undefined ?
                                chats.length > 0 ?
                                    chats.map((chat, index) => {
                                        return (
                                            <ChatHistoryRecord key={index}
                                                               title={chat.title}
                                                               isActive={activeChatIndex === index}
                                                               chatActivationHandler={() => activateChat(index)}
                                                               chatDeleteHandler={() => deleteChat(index)}
                                                               chatRenameHandler={(name: string) => {
                                                                   renameChat({chatIndex: index, name: name})
                                                               }}/>
                                        );
                                    }) :
                                    <p className={styles.noChatsMessage}>
                                        You do not have any saved chats yet
                                        <br />
                                        Submit a prompt to start a conversation
                                    </p> :
                                null
                    }
                </nav>
            </ElementOrLoader>
        </div>
    )
}

function ChatHistoryRecord(
    { title, isActive, chatActivationHandler, chatDeleteHandler, chatRenameHandler }: ChatHistoryRecordPropsType
) {
    const [isEditing, contentRef, onEditStart, onEditEnd] = useEditableContentRef(chatRenameHandler);
    const chatHistoryContainerClassName = isActive ? styles.chatHistoryRecordContainerActive : styles.chatHistoryRecordContainer;
    return (
        <div className={chatHistoryContainerClassName}>
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
                <DeleteButton onClick={funcClosureOrUndefined(chatDeleteHandler)} />
            </div>
        </div>
    )
}



