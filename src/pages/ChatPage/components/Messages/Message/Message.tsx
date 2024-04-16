import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {Signal} from "@preact/signals-core";
import {MessageCreate} from "../../../../../types/dataTypes.ts";
import {CopyToClipboardButton} from "../../../ui/Buttons/CopyToClipboardButtonContainer/CopyToClipboardButton.tsx";
import React, {useRef} from "react";
import {useSignalEffect} from "@preact/signals-react";
import styles from "./style.module.css";
import {twilight} from "react-syntax-highlighter/dist/cjs/styles/prism";


function CodeBlockComponent({
    children,
    className = '',
    ...rest
}: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : undefined;

    if (typeof rest.inline === "boolean") {
        rest.inline = rest.inline.toString();
    }
    const cleanedChildren = String(children).replace(/\n$/, '');

    return language ? (
            <div className={styles.highlightedCodeContainer}>
                <div className={styles.codeActionsContainer}>
                    <span>{language}</span>
                    <CopyToClipboardButton text={cleanedChildren} />
                </div>
                <SyntaxHighlighter style={twilight}
                                   customStyle={{
                                       marginTop: 0,
                                       borderRadius: "0 0 1rem 1rem",
                                       borderTopWidth: 0,
                                       borderBottomWidth: "2px",
                                       borderLeftWidth: "2px",
                                       borderRightWidth: "2px",
                                       borderColor: "rgb(84, 84, 84)"
                                    }}
                                   language={language}
                                   PreTag="div"
                                   showLineNumbers
                                   lineNumberContainerStyle={{paddingLeft: "10px"}} {...rest}>
                    {cleanedChildren}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code className={className} {...rest}>
                {children}
            </code>
        )
}

const authorsMapper = new Map([
    ["user", "You"], ["assistant", "ChatGPT"],
])

export default function Message(
    {message, autoscroll}:
    {message: MessageCreate | Signal<MessageCreate>, autoscroll?: boolean}
    ) {
    const messageContainerRef: React.RefObject<HTMLDivElement> = useRef(null);
    const isMessageSignal = message instanceof Signal;
    const [content, author] = [
        isMessageSignal ? message.value.content : message.content,
        isMessageSignal ? message.value.author: message.author,
    ]
    const hrAuthor = authorsMapper.get(author);
    useSignalEffect(() => {
        isMessageSignal ? message.value :  message;  // Subscribe an effect to signal change
        if (autoscroll) {
            messageContainerRef?.current?.scrollIntoView()
        }
    });
    return (
        <div className={styles[`${author}MessageContainer`]} ref={messageContainerRef}>
            {
                author === "system" ?
                    <b className={styles.messageAuthor}>Chat context</b> :
                    <b className={styles.messageAuthor}>{hrAuthor}</b>

            }
            {
                author === "assistant" ?
                    <ReactMarkdown components={{
                        code: CodeBlockComponent
                    }}>
                        {content}
                    </ReactMarkdown> :
                    <p className={styles.messageContent}>{content}</p>
            }
        </div>
    )
}
