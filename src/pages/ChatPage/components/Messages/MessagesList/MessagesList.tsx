import {useQueries, UseQueryResult} from "react-query";
import {getMessageRequest} from "../../../../../services/backendAPI.ts";
import Message from "../Message/Message.tsx";
import React, {useContext, useEffect, useRef, useState} from "react";
import {ChatContext} from "../../Chat/Chat.tsx";
import {Signal} from "@preact/signals-core";
import {MessageAny, MessageCreate, MessageRead} from "../../../../../types/dataTypes.ts";
import {ElementOrLoader} from "../../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {LoadingError} from "../../../../../components/ui/InfoDisplay/Errors/Errors.tsx";
import styles from "./style.module.css";
import {
    ScrollToBottomButton
} from "../../../../../components/ui/Buttons/Icons/ScrollToBottomButton/ScrollToBottomButton.tsx";
import {scrollToBottom} from "../../../../../utils/ui.ts";


function useMessageList(messages: MessageAny[]): UseQueryResult<MessageCreate>[] {
    const chat = useContext(ChatContext);
    return useQueries(messages.map((message, index) => {
        return {
            queryKey: ['chats', chat?.id, 'messages', index],
            queryFn: async () => {
                if ('content' in message || !('id' in message)) {
                    return message as MessageCreate;
                }
                // await new Promise((resolve, reject) => setTimeout(() => resolve(1), 100000));
                return await getMessageRequest((message as MessageRead).id);
            },
        };
    }));
}


export function MessagesList(
    {messages}: { messages: (MessageAny | Signal<MessageCreate>)[] }
) {
    const staticMessages = messages.filter(message => !(message instanceof Signal)) as MessageAny[];
    // Dynamic messages are rendered separately because they should not be cached by useQueries
    const dynamicMessages = messages.filter(message => message instanceof Signal) as Signal<MessageCreate>[];
    const messagesQueries = useMessageList(staticMessages);
    const [isScrollSubscribed, setIsScrollSubscribed] = useState<boolean>(false);
    const isListLoaded = messagesQueries.every(query => query.isFetched);
    const messageListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        scrollToBottom(messageListRef);
        setIsScrollSubscribed(true);
    }, [messages.length, isListLoaded]);

    function getOnScroll() {
        let prevScrollTop = 0;
        function onScroll(event: React.UIEvent<HTMLElement>) {
            if (prevScrollTop > event.currentTarget.scrollTop) {
                setIsScrollSubscribed(false);
            } else {
                const isScrollEnd = Math.abs(event.currentTarget.scrollHeight - event.currentTarget.clientHeight - event.currentTarget.scrollTop) <= 1;
                if (isScrollEnd) {
                    setIsScrollSubscribed(true);
                }
            }
            prevScrollTop = event.currentTarget.scrollTop;
        }
        return onScroll;
    }

    function onMessageUpdate() {
        if (messageListRef.current) {
            const isScrollRequired = messageListRef.current.scrollTop + messageListRef.current.clientHeight < messageListRef.current.scrollHeight;
            if (isScrollSubscribed && isScrollRequired) {
                scrollToBottom(messageListRef);
            }
        }
    }

    return (
        <div className={styles.messagesListContainer}>
            <div className={styles.messagesList} onScroll={getOnScroll()} ref={messageListRef}>
                {
                    messagesQueries.map((query, index) => {
                        return <div key={index}
                                    className={query.isLoading ? styles.messagesListItemContainerLoading : styles.messagesListItemContainer}>
                            <ElementOrLoader isLoading={query.isLoading}>
                                {

                                    query.isError ?
                                        <LoadingError errorText="An error occurred while loading a message"
                                                      reloadAction={() => query.refetch()} /> :
                                        query.isSuccess && query.data !== undefined && query.data.content !== undefined ?
                                            <Message message={query.data}/> : null
                                }
                            </ElementOrLoader>
                        </div>
                    })
                }
                {
                    dynamicMessages.map((message, index) => {
                        return <Message key={messagesQueries.length + index} message={message} onUpdate={onMessageUpdate}/>
                    })
                }
            </div>
            {
                !isScrollSubscribed && messages.length > 0 && <ScrollToBottomButton containerRef={messageListRef} />
            }
        </div>
    );
}