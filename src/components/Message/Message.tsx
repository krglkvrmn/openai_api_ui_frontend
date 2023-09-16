import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import "./style.css";


export default function Message(
    {content, author, generatedContent}:
    {
        content: string, author: string, generatedContent?: string | null,
    }) {
    const messageContent = (generatedContent === undefined) || (generatedContent === null) ? content : generatedContent;
    return (
        <div id="MessageContainer">
            <b>Author: {author}</b>
            <ReactMarkdown>{messageContent}</ReactMarkdown>
        </div>
    );
}