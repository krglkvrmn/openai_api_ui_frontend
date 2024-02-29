import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {dark} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Signal} from "@preact/signals-core";
import {MessageCreate} from "../../types/dataTypes.ts";


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
            <SyntaxHighlighter style={dark} language={language} PreTag="div" {...rest}>
                {cleanedChildren}
            </SyntaxHighlighter>
        ) : (
            <code className={className} {...rest}>
                {children}
            </code>
        )
}


export default function Message(
    {message}:
    {message: MessageCreate | Signal<MessageCreate>}
    ) {
    const isMessageSignal = message instanceof Signal;
    const [content, author] = [
        isMessageSignal ? message.value.content : message.content,
        isMessageSignal ? message.value.author: message.author,

    ]
    return (
        <div className="message-container">
            <b>Author: {author}</b>
            <ReactMarkdown components={{
                code: CodeBlockComponent
            }}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
