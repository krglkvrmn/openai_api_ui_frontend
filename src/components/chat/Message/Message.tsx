import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {materialOceanic} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Signal} from "@preact/signals-core";
import {MessageCreate} from "../../../types/dataTypes.ts";
import styles from "./style.module.css";
import {CopyToClipboardButton} from "../../ui/Buttons/CopyToClipboardButton.tsx";


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
                <SyntaxHighlighter style={materialOceanic}
                                   customStyle={{marginTop: 0, borderRadius: "0 0 1rem 1rem"}}
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
    {message}:
    {message: MessageCreate | Signal<MessageCreate>}
    ) {
    const isMessageSignal = message instanceof Signal;
    const [content, author] = [
        isMessageSignal ? message.value.content : message.content,
        isMessageSignal ? message.value.author: message.author,
    ]
    const hrAuthor = authorsMapper.get(author);
    return (
        <div className={styles[`${author}MessageContainer`]}>
            {
                author === "system" ?
                    <b>Chat context</b> :
                    <b>{hrAuthor}</b>

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
