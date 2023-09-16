import { MouseEventHandler, useEffect, useRef, useState } from "react";
import Chat from "../Chat/Chat";
import ChatHistory from "../ChatHistory/ChatHistory";
import ModelSelector from "../ModelSelector/ModelSelector";
import Prompt from "../Prompt/Prompt";
import PromptSelector from "../PromptSelector/PromptSelector";


export type OptionalNumber = number | null;

export type Author = "user" | "system" | "function" | "assistant";

export type MessageSchema = {
    id: OptionalNumber,
    author: Author,
    content: string,
    created_at: Date | null
    chat_id: OptionalNumber
}


export type SingleChatSchema = {
    id: OptionalNumber,
    title: string,
    model: string,
    created_at: Date | null,
    last_updated: Date | null,
    messages: MessageSchema[],
}

export type OptionalSingleChatSchema = SingleChatSchema | null;

const defaultModel: string = "gpt-3.5-turbo";

function createNewDefaultChat(): SingleChatSchema {
    return {
        id: null,
        title: "New chat",
        model: defaultModel,
        created_at: null,
        last_updated: null,
        messages: [],
    };
}

async function createChatDBInstance(chat: SingleChatSchema): Promise<SingleChatSchema | undefined> {
    try {
        const response = await fetch('http://localhost:8000/api/v1/chats/newChat', {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
            },
            body: JSON.stringify(chat)
        })
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error:', error)
    }
}

async function updateChatDBInstance(chat: SingleChatSchema): Promise<SingleChatSchema | undefined> {
    try {
        const response = await fetch('http://localhost:8000/api/v1/chats/updateChat', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json", 
            },
            body: JSON.stringify(chat)
        })
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error:', error)
    }
}

async function deleteChatDBInstance(chat_id: OptionalNumber): Promise<SingleChatSchema | undefined> {
    try {
        const response = await fetch(`http://localhost:8000/api/v1/chats/deleteChat/${chat_id}`, {
            method: "DELETE",
        })
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error:', error)
    }
}

async function* fetchEvents(response: Response) {
    if (!response.ok || response.body === null) {
        throw new Error("Network response was not ok " + response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let incompleteChunk = '';
    try {
        while (true) {
            const {done, value} = await reader.read();
            let chunkContent = incompleteChunk + decoder.decode(value);
            if (done && chunkContent.startsWith('data: [DONE]')) {break};
            while (true) {
                const matchResult = chunkContent.match(/^data: (\{(?:.|\s)+?\})\n\n/m);
                if (matchResult !== null) {
                    yield JSON.parse(matchResult[1]);
                    chunkContent = chunkContent.substring(matchResult[0].length);
                } else {
                    incompleteChunk = chunkContent;
                    break;
                }

            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function* askModel(chat: SingleChatSchema, debug: boolean = true): AsyncGenerator<any | undefined> {
    const requestBody = {
        model: chat.model,
        messages: chat.messages.map(message => {
            return {role: message.author, content: message.content};
        }),
        stream: true
    }
    const apiEndpoint = `http://localhost:8000/api/v1/ai/createCompletion?debug=${debug}`;
    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestBody)
        });

        yield* fetchEvents(response);
    } catch (error) {
        console.error('Error:', error);
    }
}

export default function ChatController() {
    const [activeChatId, setActiveChatId] = useState<number>(0);
    const [chats, setChats] = useState<SingleChatSchema[]>([createNewDefaultChat()]);

    const [systemPromptChoiceActive, setSystemPromptChoiceActive] = useState<boolean>(true);
    

    const promptSubmitActiveRef = useRef<boolean>(true);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);

    const activeChat: SingleChatSchema = chats[activeChatId];

    async function fetchChats() {
        try {
            const response: Response = await fetch('http://localhost:8000/api/v1/chats/all', {method: "GET"});
            const result: SingleChatSchema[] = await response.json();
            setChats([...chats, ...result]);
        } catch (error) {
            console.error(`Error occured while fetching chats: ${error}`);
        }
    }

    function newChatHandler() {
        setActiveChatId(0);
    }

    function promptChoiceSwitchHandler() {
        setSystemPromptChoiceActive(prev => !prev)
    }



    function deleteChatHandler(chat_id: number) {
        const chatsCopy = chats.slice();
        deleteChatDBInstance(chats[chat_id].id).then(chat => {
            chatsCopy.splice(chat_id, 1);
            if (activeChatId === chat_id) {
                setActiveChatId(0);
            } else if (activeChatId > chat_id) {
                setActiveChatId(activeChatId - 1);
            }
            setChats(chatsCopy);
        }).catch(error => console.error('Error:', error));
        
    }

    function renameChatHandler(chat_id: number, name: string) {
        const chatsCopy = chats.slice();
        chatsCopy[chat_id].title = name;
        updateChatDBInstance(chatsCopy[chat_id]).then(chat => {
            chatsCopy[chat_id] = chat === undefined ? chatsCopy[chat_id] : chat;
            setChats(chatsCopy);
        }).catch(error => console.error('Error:', error));
    }

    useEffect(() => {fetchChats()}, []);

    async function modelReplyToChat(chat: SingleChatSchema): Promise<SingleChatSchema | undefined> {
        try {
            const newModelMessage: MessageSchema = {id: null, author: "assistant", content: "", chat_id: chat.id, created_at: new Date()};
            for await (const chunk of askModel(chat)) {
                const delta = chunk.choices[0].delta;
                if (delta?.role !== undefined && delta?.role !== null) {
                    newModelMessage.author = delta.role;
                }
                if (delta?.content !== undefined && delta?.content !== null) {
                    newModelMessage.content = newModelMessage.content + delta.content;
                    setGeneratedContent(prev => newModelMessage.content);
                }
            }
            newModelMessage.created_at = new Date();
            chat.messages.push(newModelMessage);
            chat.last_updated = new Date();
            return chat;
        } catch (error) {
            console.error('Error:', error)
        };

    }

    function createNewChatFromDefault(defaultChat: SingleChatSchema, modelReply: boolean = true) {
        defaultChat.created_at = new Date();
        setChats(prevChats => {
            const chatsCopy: SingleChatSchema[] = prevChats.slice();
            chatsCopy.splice(1, 0, defaultChat);
            chatsCopy.splice(0, 1, createNewDefaultChat());
            return chatsCopy;

        });
        setActiveChatId(prev => 1);
        const createChatDB = (chatToCreate: SingleChatSchema) => {
            createChatDBInstance(chatToCreate).then(chat => {
                setChats(prevChats => {
                    const chatsCopy: SingleChatSchema[] = prevChats.slice();
                    const dbChat = chat === undefined ? chatToCreate : chat;
                    chatsCopy[1] = dbChat;
                    return chatsCopy;
                });
            }).catch(error => console.error('Error:', error));
        };
        if (modelReply) {
            promptSubmitActiveRef.current = false;
            modelReplyToChat(defaultChat)
                .then(modelReplyChat => modelReplyChat === undefined ? undefined : createChatDB(modelReplyChat)) 
                .catch(error => console.error('Error:', error))
                .finally(() => {promptSubmitActiveRef.current = true; setGeneratedContent(prev => null)});
        } else {
            createChatDB(defaultChat);
        }
    }

    function addNewMessage(activeChat: SingleChatSchema) {
        setChats(prevChats => {
            const chatsCopy: SingleChatSchema[] = prevChats.slice();
            chatsCopy[activeChatId] = activeChat;
            return chatsCopy;
        });

        promptSubmitActiveRef.current = false;
        modelReplyToChat(activeChat).then(modelReplyChat => {
            if (modelReplyChat === undefined) {
                return;
            };
            updateChatDBInstance(modelReplyChat).then(chat => {
                setChats(prevChats => {
                    const chatsCopy: SingleChatSchema[] = prevChats.slice();
                    const dbChat = chat === undefined ? activeChat : chat;
                    chatsCopy[activeChatId] = dbChat;
                    return chatsCopy;

                });
            }).catch(error => console.error('Error:', error));
        }).catch(error => console.error('Error:', error))
          .finally(() => {promptSubmitActiveRef.current = true; setGeneratedContent(null)});
    }

    function promptInputHandler(author: Author, prompt: string) {
        const chatsCopy: SingleChatSchema[] = chats.slice();
        const activeChatCopy: SingleChatSchema = chatsCopy[activeChatId];
        const newMessage: MessageSchema = {id: null, author: author, content: prompt, chat_id: activeChatCopy.id, created_at: new Date()};
        activeChatCopy.messages.push(newMessage);
        activeChatCopy.last_updated = new Date();
        if (activeChatId === 0) {
            createNewChatFromDefault(activeChatCopy, author !== 'system');
        } else {
            addNewMessage(activeChatCopy);
        }
    }

    function modelSwitchHandler(model: string) {
        const chatsCopy = chats.slice();
        chatsCopy[activeChatId].model = model;
        if (activeChatId !== 0) {
            updateChatDBInstance(chatsCopy[activeChatId]).then(chat => {
                chatsCopy[activeChatId] = chat === undefined ? chatsCopy[activeChatId] : chat;
                setChats(chatsCopy);
            })
        } else {
            setChats(chatsCopy);
        }
    }

    function chatActivationHandler(chat_id: number) {
        setActiveChatId(chat_id);
    }


    return (
        <div id="chat-controller">
            <div id="chat-history-sidebar">
                <NewChatButton newChatHandler={newChatHandler}/>
                <ChatHistory chats={chats}
                             chatActivationHandler={chatActivationHandler}
                             deleteChatHandler={deleteChatHandler}
                             renameChatHandler={renameChatHandler}/>
            </div>
            <MainContent chat={activeChat}
                         generatedContent={generatedContent}
                         promptSubmitStatusRef={promptSubmitActiveRef}
                         promptInputHandler={promptInputHandler}
                         modelSwitchHandler={modelSwitchHandler}
                         promptChoiceSwitchHandler={promptChoiceSwitchHandler} /> 
            {systemPromptChoiceActive && 
                <div id="system-prompt-selection-sidebar">
                    <PromptSelector />
                </div>
            }
        </div>
        
    );
}

function NewChatButton({newChatHandler}: {newChatHandler: MouseEventHandler}) {
    return (
        <button onClick={newChatHandler}>
            New chat
        </button>
    );
}

function MainContent(
    {chat, promptInputHandler, generatedContent, promptSubmitStatusRef, modelSwitchHandler, promptChoiceSwitchHandler}:
    {
        chat: SingleChatSchema, promptInputHandler: CallableFunction, generatedContent: string | null,
        promptSubmitStatusRef: React.RefObject<boolean>, modelSwitchHandler: CallableFunction,
        promptChoiceSwitchHandler: CallableFunction
    }) {
    let {model, messages} = chat;
    return (
        <div id="main-content-wrapper">
            <div id="main-content">
                <ModelSelector model={model}
                               modelSwitchHandler={modelSwitchHandler}/>
                <Prompt promptType="system"
                        promptInputHandler={promptInputHandler}
                        promptSubmitStatusRef={promptSubmitStatusRef}
                        isActive={!messages.length}
                        promptChoiceSwitchHandler={promptChoiceSwitchHandler}/>
                <Chat messages={messages}
                      generatedContent={generatedContent}
                      promptSubmitStatus={promptSubmitStatusRef.current}/>
                <Prompt promptType="user"
                        promptInputHandler={promptInputHandler}
                        promptSubmitStatusRef={promptSubmitStatusRef}
                        isActive={true}
                        promptChoiceSwitchHandler={promptChoiceSwitchHandler}/>
            </div>
        </div>
    );
}