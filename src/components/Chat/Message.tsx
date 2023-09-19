import ReactMarkdown from "react-markdown";


export default function Message(
    {author, content}:
    {author: string, content: string}
    ) {
    return (
        <div className="message-container">
            <b>Author: {author}</b>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}