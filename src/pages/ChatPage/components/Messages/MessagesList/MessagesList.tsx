import {useQueries, UseQueryResult} from "react-query";
import {getMessageRequest} from "../../../../../services/backendAPI.ts";
import Message from "../Messages/Message.tsx";
import React, {useContext, useEffect, useRef, useState} from "react";
import {ChatContext} from "../../Chat/Chat.tsx";
import {Signal} from "@preact/signals-core";
import {MessageAny, MessageCreate, MessageRead} from "../../../../../types/dataTypes.ts";
import {ElementOrLoader} from "../../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {LoadingError} from "../../../../../components/ui/InfoDisplay/Errors/Errors.tsx";
import styles from "./style.module.css";


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
    { messages}: { messages: (MessageAny | Signal<MessageCreate>)[] }
) {
    const staticMessages = messages.filter(message => !(message instanceof Signal)) as MessageAny[];
    // Dynamic messages are rendered separately because they should not be cached by useQueries
    const dynamicMessages = messages.filter(message => message instanceof Signal) as Signal<MessageCreate>[];
    const messagesQueries = useMessageList(staticMessages);
    const [isScrollSubscribed, setIsScrollSubscribed] = useState<boolean>(false);
    const isListLoaded = messagesQueries.every(query => query.isFetched);
    const messageListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messageListRef?.current?.lastElementChild?.scrollIntoView();
    }, [messages.length, isListLoaded]);

    function onScroll(event: React.UIEvent<HTMLElement>) {
        const isScrollSubscribedNew = event.currentTarget.scrollHeight - event.currentTarget.scrollTop === event.currentTarget.clientHeight;
        if (isScrollSubscribedNew !== isScrollSubscribed) {
            setIsScrollSubscribed(isScrollSubscribedNew)
        }
    }

    return (
        <>
        <div className={styles.messagesList} onScroll={onScroll} ref={messageListRef}>
            {
                messagesQueries.map((query, index) => {
                    return <div key={index} className={styles.messagesListItemContainer}>
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
                    return <Message key={messagesQueries.length + index} message={message} autoscroll={isScrollSubscribed}/>
                })
            }
        </div>
        </>
    );
}